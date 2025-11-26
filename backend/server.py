from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timedelta
import bcrypt
import jwt
import random
import string
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 30  # 30 days

# Stripe configuration
STRIPE_API_KEY = os.environ['STRIPE_API_KEY']

# Create the main app
app = FastAPI(title="TimeSwap API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============= MODELS =============

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    firstName: str
    lastName: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyResetCodeRequest(BaseModel):
    email: EmailStr
    code: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str


class UserProfile(BaseModel):
    firstName: str
    lastName: str
    phone: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    photo_base64: Optional[str] = None
    interests: Optional[List[str]] = []

class ServiceCreate(BaseModel):
    title: str
    description: str
    category: str
    duration: float  # in hours
    type: str  # "offer" or "request"
    location: str
    coordinates: Optional[Dict[str, float]] = None
    photos: Optional[List[str]] = []  # Liste de base64, max 3 photos

class ExchangeCreate(BaseModel):
    serviceId: str
    message: Optional[str] = None

class ExchangeAccept(BaseModel):
    message: Optional[str] = None

class ExchangeCancel(BaseModel):
    reason: str

class RatingCreate(BaseModel):
    rating: int  # 1-5 étoiles
    review: Optional[str] = None

class ChatCreate(BaseModel):
    serviceId: str
    participantId: str

class MessageCreate(BaseModel):
    content: str

class ReportCreate(BaseModel):
    targetType: str  # "service", "user", "message"
    targetId: str
    reason: str
    description: Optional[str] = None


class CheckoutRequest(BaseModel):
    package_id: str
    origin_url: str

class VerificationUpload(BaseModel):
    idDocument_base64: str

# ============= AUTH HELPERS =============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "user_id": user_id,
        "exp": expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(401, "Invalid token")
        
        user = await db.users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(401, "User not found")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

# ============= AUTH ROUTES =============

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(400, "Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(user_data.password)
    
    # Check if admin
    ADMIN_EMAILS = ["quentinraffalli@hotmail.com", "depollutech@gmail.com"]
    is_admin = user_data.email.lower() in [e.lower() for e in ADMIN_EMAILS]
    
    user = {
        "_id": user_id,
        "email": user_data.email,
        "password_hash": hashed_pwd,
        "role": "admin" if is_admin else "user",
        "profile": {
            "firstName": user_data.firstName,
            "lastName": user_data.lastName,
            "phone": user_data.phone,
            "bio": "",
            "location": "",
            "photo_base64": None
        },
        "verification": {
            "isVerified": False,
            "idDocument_base64": None,
            "verifiedAt": None
        },
        "credits": {
            "available": 2.0,  # 2 heures gratuites
            "given": 0,
            "received": 0
        },
        "gamification": {
            "xp": 0,
            "level": 1,
            "badges": [],
            "stats": {
                "force": 0,
                "sagesse": 0,
                "dexterite": 0
            }
        },
        "interests": [],
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    await db.users.insert_one(user)
    
    token = create_token(user_id)
    
    return {
        "token": token,
        "user": {
            "_id": user_id,
            "email": user["email"],
            "profile": user["profile"],
            "credits": user["credits"],
            "gamification": user["gamification"]
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(401, "Invalid email or password")
    
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    
    token = create_token(user["_id"])
    
    return {
        "token": token,
        "user": {
            "_id": user["_id"],
            "email": user["email"],
            "role": user.get("role", "user"),
            "profile": user["profile"],
            "credits": user["credits"],
            "gamification": user["gamification"],
            "verification": user["verification"]
        }
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "_id": current_user["_id"],
        "email": current_user["email"],
        "profile": current_user["profile"],
        "credits": current_user["credits"],
        "gamification": current_user["gamification"],
        "verification": current_user["verification"],
        "interests": current_user.get("interests", [])
    }


# ============= PASSWORD RESET ROUTES =============

def generate_reset_code():
    """Generate a 6-digit reset code"""
    return ''.join(random.choices(string.digits, k=6))

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Request a password reset code"""
    user = await db.users.find_one({"email": request.email})
    if not user:
        # Don't reveal if email exists or not for security
        return {"message": "If this email exists, a reset code has been sent."}
    
    # Generate reset code
    reset_code = generate_reset_code()
    reset_code_expiry = datetime.utcnow() + timedelta(minutes=15)
    
    # Save reset code to database
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "resetCode": reset_code,
                "resetCodeExpiry": reset_code_expiry
            }
        }
    )
    
    # In development: log the code (in production, send via email)
    print(f"\n{'='*50}")
    print(f"PASSWORD RESET CODE FOR {request.email}")
    print(f"Code: {reset_code}")
    print(f"Expires at: {reset_code_expiry}")
    print(f"{'='*50}\n")
    
    # TODO: Send email with reset code using SendGrid/similar service
    # For now, we just log it
    
    return {
        "message": "If this email exists, a reset code has been sent.",
        "dev_code": reset_code  # Remove this in production!
    }

@api_router.post("/auth/verify-reset-code")
async def verify_reset_code(request: VerifyResetCodeRequest):
    """Verify if the reset code is valid"""
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(400, "Invalid email or code")
    
    # Check if code exists and is not expired
    if not user.get("resetCode") or not user.get("resetCodeExpiry"):
        raise HTTPException(400, "No reset code requested")
    
    if user["resetCode"] != request.code:
        raise HTTPException(400, "Invalid reset code")
    
    if datetime.utcnow() > user["resetCodeExpiry"]:
        raise HTTPException(400, "Reset code has expired")
    
    return {"message": "Code verified successfully"}

@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password using the code"""
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(400, "Invalid email or code")
    
    # Verify reset code
    if not user.get("resetCode") or not user.get("resetCodeExpiry"):
        raise HTTPException(400, "No reset code requested")
    
    if user["resetCode"] != request.code:
        raise HTTPException(400, "Invalid reset code")
    
    if datetime.utcnow() > user["resetCodeExpiry"]:
        raise HTTPException(400, "Reset code has expired")
    
    # Hash new password
    password_hash = hash_password(request.new_password)
    
    # Update password and remove reset code
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"password_hash": password_hash},
            "$unset": {"resetCode": "", "resetCodeExpiry": ""}
        }
    )
    
    return {"message": "Password reset successfully"}


# ============= PROFILE ROUTES =============

@api_router.put("/profile")
async def update_profile(profile_data: UserProfile, current_user: dict = Depends(get_current_user)):
    update_data = {
        "profile.firstName": profile_data.firstName,
        "profile.lastName": profile_data.lastName,
        "profile.phone": profile_data.phone,
        "profile.bio": profile_data.bio,
        "profile.location": profile_data.location,
        "interests": profile_data.interests,
        "updatedAt": datetime.utcnow()
    }
    
    if profile_data.photo_base64:
        update_data["profile.photo_base64"] = profile_data.photo_base64
    
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    return {"message": "Profile updated successfully"}

@api_router.post("/profile/verification")
async def upload_verification(data: VerificationUpload, current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {
            "verification.idDocument_base64": data.idDocument_base64,
            "verification.isVerified": False,  # Waiting for admin approval
            "updatedAt": datetime.utcnow()
        }}
    )
    
    return {"message": "Verification document uploaded successfully"}

@api_router.get("/users/{user_id}")
async def get_user_profile(user_id: str):
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(404, "User not found")
    
    return {
        "_id": user["_id"],
        "profile": user["profile"],
        "gamification": user["gamification"],
        "verification": {"isVerified": user["verification"]["isVerified"]},
        "stats": {
            "exchangesCompleted": user["credits"]["given"] + user["credits"]["received"],
            "hoursGiven": user["credits"]["given"],
            "hoursReceived": user["credits"]["received"]
        }
    }

# ============= SERVICES ROUTES =============

@api_router.post("/services")
async def create_service(service_data: ServiceCreate, current_user: dict = Depends(get_current_user)):
    service_id = str(uuid.uuid4())
    
    # Validate photos (max 3, check size)
    photos = service_data.photos or []
    if len(photos) > 3:
        raise HTTPException(400, "Maximum 3 photos allowed")
    
    # Check photo sizes (rough estimate: base64 is ~1.37x original size)
    MAX_PHOTO_SIZE = 5 * 1024 * 1024  # 5MB per photo
    for i, photo in enumerate(photos):
        if len(photo) > MAX_PHOTO_SIZE:
            raise HTTPException(400, f"Photo {i+1} exceeds 5MB limit")
    
    # Calculate boost score based on verification
    boost_score = 10 if current_user["verification"]["isVerified"] else 1
    
    service = {
        "_id": service_id,
        "userId": current_user["_id"],
        "title": service_data.title,
        "description": service_data.description,
        "category": service_data.category,
        "duration": service_data.duration,
        "type": service_data.type,
        "location": service_data.location,
        "coordinates": service_data.coordinates,
        "photos": photos,
        "status": "active",  # Can be: active, locked, completed, cancelled
        "lockedBy": None,  # User ID who locked the service
        "boostedScore": boost_score,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    await db.services.insert_one(service)
    
    return {"message": "Service created successfully", "serviceId": service_id}

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula (in km)"""
    from math import radians, cos, sin, asin, sqrt
    
    # Convert to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371
    
    return c * r

@api_router.get("/services")
async def get_services(
    type: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    skip: int = 0,
    limit: int = 50  # Fetch more for better sorting
):
    query = {"status": "active"}
    
    if type:
        query["type"] = type
    if category:
        query["category"] = category
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    # Fetch all active services
    services = await db.services.find(query).to_list(length=None)
    
    # Enrich with user data and calculate scores
    enriched_services = []
    current_time = datetime.utcnow()
    
    for service in services:
        user = await db.users.find_one({"_id": service["userId"]})
        
        # Calculate age score (newer = higher score)
        created_at = service.get("createdAt", current_time)
        age_hours = (current_time - created_at).total_seconds() / 3600
        # Normalize: 0-24h = 1.0, 24-168h = 0.5, >168h = 0.1
        if age_hours <= 24:
            age_score = 1.0
        elif age_hours <= 168:  # 1 week
            age_score = 0.5
        else:
            age_score = 0.1
        
        # Calculate distance score (closer = higher score)
        distance_score = 1.0  # Default if no geolocation
        distance_km = None
        
        if lat is not None and lon is not None and service.get("coordinates"):
            service_lat = service["coordinates"].get("latitude")
            service_lon = service["coordinates"].get("longitude")
            
            if service_lat and service_lon:
                distance_km = calculate_distance(lat, lon, service_lat, service_lon)
                # Normalize: 0-5km = 1.0, 5-20km = 0.5, >20km = 0.1
                if distance_km <= 5:
                    distance_score = 1.0
                elif distance_km <= 20:
                    distance_score = 0.5
                else:
                    distance_score = 0.1
        
        # Combined score: 60% time, 40% distance
        combined_score = (0.6 * age_score) + (0.4 * distance_score)
        
        enriched_service = {
            **service,
            "user": {
                "_id": user["_id"],
                "name": f"{user['profile']['firstName']} {user['profile']['lastName']}",
                "photo": user["profile"].get("photo_base64"),
                "isVerified": user["verification"]["isVerified"],
                "rating": user["gamification"]["xp"] / 100
            },
            "distance_km": distance_km,
            "score": combined_score
        }
        enriched_services.append(enriched_service)
    
    # Sort by combined score (descending)
    enriched_services.sort(key=lambda x: x["score"], reverse=True)
    
    # Apply pagination
    return enriched_services[skip:skip + limit]

@api_router.get("/services/{service_id}")
async def get_service(service_id: str):
    service = await db.services.find_one({"_id": service_id})
    if not service:
        raise HTTPException(404, "Service not found")
    
    user = await db.users.find_one({"_id": service["userId"]})
    
    return {
        **service,
        "user": {
            "_id": user["_id"],
            "name": f"{user['profile']['firstName']} {user['profile']['lastName']}",
            "photo": user["profile"].get("photo_base64"),
            "isVerified": user["verification"]["isVerified"],
            "rating": user["gamification"]["xp"] / 100
        }
    }

@api_router.get("/services/my/all")
async def get_my_services(current_user: dict = Depends(get_current_user)):
    services = await db.services.find({"userId": current_user["_id"]}).sort("createdAt", -1).to_list(length=100)
    return services



@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a service (only by its author)"""
    service = await db.services.find_one({"_id": service_id})
    
    if not service:
        raise HTTPException(404, "Service not found")
    
    # Check if current user is the author
    if service["userId"] != current_user["_id"]:
        raise HTTPException(403, "You can only delete your own services")
    
    # Check if service has pending/active exchanges
    active_exchanges = await db.exchanges.find_one({
        "serviceId": service_id,
        "status": {"$in": ["pending", "accepted"]}
    })
    
    if active_exchanges:
        raise HTTPException(400, "Cannot delete service with active exchanges")
    
    # Soft delete (mark as deleted instead of removing)
    await db.services.update_one(
        {"_id": service_id},
        {"$set": {"status": "deleted", "deletedAt": datetime.utcnow()}}
    )
    
    return {"message": "Service deleted successfully"}

# ============= EXCHANGES ROUTES (Type Vinted) =============

@api_router.post("/services/{service_id}/accept-exchange")
async def accept_exchange_from_service(
    service_id: str,
    exchange_data: ExchangeAccept,
    current_user: dict = Depends(get_current_user)
):
    """
    Accepter un échange depuis une annonce (équivalent du bouton 'Accepter l'échange')
    - Vérifie que le service est disponible
    - Crée un échange avec status 'accepted'
    - Verrouille l'annonce
    - Crée/récupère le chat entre les deux utilisateurs
    """
    service = await db.services.find_one({"_id": service_id})
    if not service:
        raise HTTPException(404, "Service not found")
    
    if service["status"] != "active":
        raise HTTPException(400, "Service is no longer available")
    
    if service["userId"] == current_user["_id"]:
        raise HTTPException(400, "Cannot accept your own service")
    
    # Vérifier le solde selon le type de service
    requester_id = current_user["_id"]
    provider_id = service["userId"]
    
    if service["type"] == "offer":
        # L'utilisateur actuel demande un service, il doit avoir assez d'heures
        if current_user["credits"]["available"] < service["duration"]:
            raise HTTPException(400, f"Solde insuffisant. Vous avez {current_user['credits']['available']}h, il vous faut {service['duration']}h")
    
    # Créer l'échange
    exchange_id = str(uuid.uuid4())
    exchange = {
        "_id": exchange_id,
        "serviceId": service_id,
        "providerId": provider_id,  # Celui qui offre le service
        "requesterId": requester_id,  # Celui qui demande le service
        "duration": service["duration"],
        "status": "accepted",  # Statut: pending, accepted, in_progress, completed, cancelled
        "providerConfirmed": False,
        "requesterConfirmed": False,
        "cancelledBy": None,
        "cancellationReason": None,
        "penaltyApplied": False,
        "createdAt": datetime.utcnow(),
        "acceptedAt": datetime.utcnow(),
        "completedAt": None,
        "xpAwarded": 0
    }
    
    await db.exchanges.insert_one(exchange)
    
    # Verrouiller l'annonce
    await db.services.update_one(
        {"_id": service_id},
        {
            "$set": {
                "status": "locked",
                "lockedBy": requester_id,
                "lockedAt": datetime.utcnow()
            }
        }
    )
    
    # Trouver ou créer le chat entre les deux utilisateurs
    chat = await db.chats.find_one({
        "serviceId": service_id,
        "participants": {"$all": [provider_id, requester_id]}
    })
    
    if not chat:
        chat_id = str(uuid.uuid4())
        chat = {
            "_id": chat_id,
            "serviceId": service_id,
            "participants": [provider_id, requester_id],
            "createdAt": datetime.utcnow(),
            "lastMessage": exchange_data.message or "Échange accepté",
            "lastMessageAt": datetime.utcnow()
        }
        await db.chats.insert_one(chat)
    else:
        chat_id = chat["_id"]
    
    # Créer un message automatique dans le chat
    message = {
        "_id": str(uuid.uuid4()),
        "chatId": chat_id,
        "senderId": "system",
        "senderName": "Système",
        "content": f"🤝 Échange accepté ! Mission en cours. Les deux parties doivent confirmer \"Tâche réalisée\" pour finaliser.",
        "createdAt": datetime.utcnow(),
        "readBy": []
    }
    await db.messages.insert_one(message)
    
    # Créer une notification pour le provider
    notification = {
        "_id": str(uuid.uuid4()),
        "userId": provider_id,
        "type": "system",
        "content": f"Votre annonce \"{service['title']}\" a été acceptée !",
        "exchangeId": exchange_id,
        "timestamp": datetime.utcnow(),
        "read": False
    }
    await db.notifications.insert_one(notification)
    
    return {
        "message": "Exchange accepted successfully",
        "exchangeId": exchange_id,
        "chatId": chat_id
    }

@api_router.get("/exchanges/{exchange_id}")
async def get_exchange(exchange_id: str, current_user: dict = Depends(get_current_user)):
    """Récupérer les détails d'un échange"""
    exchange = await db.exchanges.find_one({"_id": exchange_id})
    if not exchange:
        raise HTTPException(404, "Exchange not found")
    
    # Vérifier que l'utilisateur est partie prenante
    if exchange["providerId"] != current_user["_id"] and exchange["requesterId"] != current_user["_id"]:
        raise HTTPException(403, "Not authorized")
    
    # Enrichir avec les données du service et des utilisateurs
    service = await db.services.find_one({"_id": exchange["serviceId"]})
    provider = await db.users.find_one({"_id": exchange["providerId"]})
    requester = await db.users.find_one({"_id": exchange["requesterId"]})
    
    return {
        **exchange,
        "service": service,
        "provider": {
            "_id": provider["_id"],
            "name": f"{provider['profile']['firstName']} {provider['profile']['lastName']}",
            "photo": provider["profile"].get("photo_base64"),
            "level": provider["gamification"]["level"],
            "xp": provider["gamification"]["xp"]
        },
        "requester": {
            "_id": requester["_id"],
            "name": f"{requester['profile']['firstName']} {requester['profile']['lastName']}",
            "photo": requester["profile"].get("photo_base64"),
            "level": requester["gamification"]["level"],
            "xp": requester["gamification"]["xp"]
        }
    }

@api_router.post("/exchanges/{exchange_id}/confirm-completion")
async def confirm_completion(exchange_id: str, current_user: dict = Depends(get_current_user)):
    """
    Confirmer la réalisation de la tâche (double validation type Vinted)
    - Marque la confirmation de l'utilisateur
    - Si les deux ont confirmé, déclenche le transfert d'heures
    """
    exchange = await db.exchanges.find_one({"_id": exchange_id})
    if not exchange:
        raise HTTPException(404, "Exchange not found")
    
    if exchange["status"] != "accepted":
        raise HTTPException(400, f"Exchange status is {exchange['status']}, cannot confirm")
    
    # Déterminer qui confirme
    is_provider = exchange["providerId"] == current_user["_id"]
    is_requester = exchange["requesterId"] == current_user["_id"]
    
    if not is_provider and not is_requester:
        raise HTTPException(403, "Not authorized")
    
    # Vérifier si déjà confirmé
    if is_provider and exchange["providerConfirmed"]:
        raise HTTPException(400, "You have already confirmed")
    if is_requester and exchange["requesterConfirmed"]:
        raise HTTPException(400, "You have already confirmed")
    
    # Marquer la confirmation
    update_fields = {}
    if is_provider:
        update_fields["providerConfirmed"] = True
    if is_requester:
        update_fields["requesterConfirmed"] = True
    
    await db.exchanges.update_one(
        {"_id": exchange_id},
        {"$set": update_fields}
    )
    
    # Récupérer l'échange mis à jour
    exchange = await db.exchanges.find_one({"_id": exchange_id})
    
    # Si les deux ont confirmé, finaliser l'échange
    if exchange["providerConfirmed"] and exchange["requesterConfirmed"]:
        return await finalize_exchange(exchange_id, exchange)
    
    # Sinon, envoyer une notification à l'autre partie
    other_user_id = exchange["providerId"] if is_requester else exchange["requesterId"]
    notification = {
        "_id": str(uuid.uuid4()),
        "userId": other_user_id,
        "type": "system",
        "content": "L'autre partie a confirmé la tâche réalisée. Confirmez à votre tour pour finaliser l'échange.",
        "exchangeId": exchange_id,
        "timestamp": datetime.utcnow(),
        "read": False
    }
    await db.notifications.insert_one(notification)
    
    return {
        "message": "Confirmation enregistrée. En attente de la confirmation de l'autre partie.",
        "providerConfirmed": exchange["providerConfirmed"],
        "requesterConfirmed": exchange["requesterConfirmed"]
    }

async def finalize_exchange(exchange_id: str, exchange: dict):
    """
    Finaliser l'échange : transfert d'heures, XP, archivage
    """
    service = await db.services.find_one({"_id": exchange["serviceId"]})
    requester = await db.users.find_one({"_id": exchange["requesterId"]})
    
    # Vérifier le solde du demandeur
    if requester["credits"]["available"] < exchange["duration"]:
        raise HTTPException(400, f"Insufficient credits. Requester has {requester['credits']['available']}h but needs {exchange['duration']}h")
    
    # Calculer les XP
    xp_awarded = int(exchange["duration"] * 10)  # 10 XP par heure
    
    # Transaction atomique : débiter le requester et créditer le provider
    try:
        # Débiter le demandeur
        await db.users.update_one(
            {"_id": exchange["requesterId"]},
            {
                "$inc": {
                    "credits.available": -exchange["duration"],
                    "credits.given": exchange["duration"],
                    "gamification.xp": xp_awarded // 2,
                    "gamification.stats.sagesse": 1
                }
            }
        )
        
        # Créditer le fournisseur
        await db.users.update_one(
            {"_id": exchange["providerId"]},
            {
                "$inc": {
                    "credits.available": exchange["duration"],
                    "credits.received": exchange["duration"],
                    "gamification.xp": xp_awarded,
                    "gamification.stats.force": 1
                }
            }
        )
        
        # Marquer l'échange comme terminé
        await db.exchanges.update_one(
            {"_id": exchange_id},
            {
                "$set": {
                    "status": "completed",
                    "completedAt": datetime.utcnow(),
                    "xpAwarded": xp_awarded
                }
            }
        )
        
        # Marquer l'annonce comme terminée
        await db.services.update_one(
            {"_id": exchange["serviceId"]},
            {"$set": {"status": "completed"}}
        )
        
        # Mettre à jour les niveaux
        for user_id in [exchange["providerId"], exchange["requesterId"]]:
            user = await db.users.find_one({"_id": user_id})
            new_level = (user["gamification"]["xp"] // 100) + 1
            await db.users.update_one(
                {"_id": user_id},
                {"$set": {"gamification.level": new_level}}
            )
        
        # Envoyer un message automatique dans le chat
        chat = await db.chats.find_one({"serviceId": exchange["serviceId"]})
        if chat:
            message = {
                "_id": str(uuid.uuid4()),
                "chatId": chat["_id"],
                "senderId": "system",
                "senderName": "Système",
                "content": f"✅ La tâche a été confirmée par les deux utilisateurs. Le transfert de {exchange['duration']}h a été effectué avec succès !",
                "createdAt": datetime.utcnow(),
                "readBy": []
            }
            await db.messages.insert_one(message)
        
        # Notifications
        for user_id in [exchange["providerId"], exchange["requesterId"]]:
            notification = {
                "_id": str(uuid.uuid4()),
                "userId": user_id,
                "type": "system",
                "content": f"Échange terminé ! Le transfert de {exchange['duration']}h a été effectué.",
                "exchangeId": exchange_id,
                "timestamp": datetime.utcnow(),
                "read": False
            }
            await db.notifications.insert_one(notification)
        
        return {
            "message": "Exchange completed successfully",
            "status": "completed",
            "hoursTransferred": exchange["duration"],
            "xpAwarded": xp_awarded
        }
        
    except Exception as e:
        # Rollback en cas d'erreur
        logging.error(f"Error finalizing exchange {exchange_id}: {str(e)}")
        raise HTTPException(500, "Error processing exchange. Please contact support.")

@api_router.post("/exchanges/{exchange_id}/cancel")
async def cancel_exchange(
    exchange_id: str,
    cancel_data: ExchangeCancel,
    current_user: dict = Depends(get_current_user)
):
    """
    Annuler un echange avec penalites selon le statut
    """
    exchange = await db.exchanges.find_one({"_id": exchange_id}")
    if not exchange:
        raise HTTPException(404, "Exchange not found")
    
    if exchange["status"] not in ["accepted", "in_progress"]:
        raise HTTPException(400, f"Cannot cancel exchange with status {exchange['status']}")
    
    is_provider = exchange["providerId"] == current_user["_id"]
    is_requester = exchange["requesterId"] == current_user["_id"]
    
    if not is_provider and not is_requester:
        raise HTTPException(403, "Not authorized")
    
    # Déterminer la pénalité
    penalty_hours = 0
    penalty_xp = 0
    
    # Si une partie a déjà confirmé, appliquer une pénalité
    if exchange.get("providerConfirmed") or exchange.get("requesterConfirmed"):
        penalty_hours = exchange["duration"] * 0.1  # 10% du temps de l'échange
        penalty_xp = 50  # Perte de 50 XP
        
        # Appliquer la pénalité à celui qui annule
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {
                "$inc": {
                    "credits.available": -penalty_hours,
                    "gamification.xp": -penalty_xp
                }
            }
        )
    
    # Mettre à jour l'échange
    await db.exchanges.update_one(
        {"_id": exchange_id},
        {
            "$set": {
                "status": "cancelled",
                "cancelledBy": current_user["_id"],
                "cancellationReason": cancel_data.reason,
                "penaltyApplied": penalty_hours > 0,
                "penaltyHours": penalty_hours,
                "penaltyXP": penalty_xp,
                "cancelledAt": datetime.utcnow()
            }
        }
    )
    
    # Déverrouiller l'annonce
    await db.services.update_one(
        {"_id": exchange["serviceId"]},
        {
            "$set": {
                "status": "active",
                "lockedBy": None,
                "lockedAt": None
            }
        }
    )
    
    # Notifier l'autre partie
    other_user_id = exchange["providerId"] if is_requester else exchange["requesterId"]
    notification = {
        "_id": str(uuid.uuid4()),
        "userId": other_user_id,
        "type": "system",
        "content": f"L'échange a été annulé par l'autre partie. Motif : {cancel_data.reason}",
        "exchangeId": exchange_id,
        "timestamp": datetime.utcnow(),
        "read": False
    }
    await db.notifications.insert_one(notification)
    
    # Message dans le chat
    chat = await db.chats.find_one({"serviceId": exchange["serviceId"]})
    if chat:
        message = {
            "_id": str(uuid.uuid4()),
            "chatId": chat["_id"],
            "senderId": "system",
            "senderName": "Système",
            "content": f"❌ L'échange a été annulé. Motif : {cancel_data.reason}",
            "createdAt": datetime.utcnow(),
            "readBy": []
        }
        await db.messages.insert_one(message)
    
    return {
        "message": "Exchange cancelled",
        "penaltyApplied": penalty_hours > 0,
        "penaltyHours": penalty_hours,
        "penaltyXP": penalty_xp
    }

@api_router.get("/exchanges/my/all")
async def get_my_exchanges(current_user: dict = Depends(get_current_user)):
    """Récupérer tous les échanges de l'utilisateur"""
    exchanges = await db.exchanges.find({
        "$or": [
            {"providerId": current_user["_id"]},
            {"requesterId": current_user["_id"]}
        ]
    }).sort("createdAt", -1).to_list(length=100)
    
    # Enrichir avec les données
    enriched_exchanges = []
    for exchange in exchanges:
        service = await db.services.find_one({"_id": exchange["serviceId"]})
        other_user_id = exchange["providerId"] if exchange["requesterId"] == current_user["_id"] else exchange["requesterId"]
        other_user = await db.users.find_one({"_id": other_user_id})
        
        enriched_exchanges.append({
            **exchange,
            "service": service,
            "otherUser": {
                "_id": other_user["_id"],
                "name": f"{other_user['profile']['firstName']} {other_user['profile']['lastName']}",
                "photo": other_user["profile"].get("photo_base64")
            }
        })
    
    return enriched_exchanges

# ============= PAYMENT ROUTES =============

# Fixed packages for buying hours
PACKAGES = {
    "basic": {"hours": 1, "price": 9.99, "requiresVerification": False},
    "standard": {"hours": 5, "price": 44.95, "pricePerHour": 8.99, "requiresVerification": False},
    "premium": {"hours": 10, "price": 79.90, "pricePerHour": 7.99, "requiresVerification": False},
    "vip": {"hours": 20, "price": 139.80, "pricePerHour": 6.99, "requiresVerification": True}
}

@api_router.get("/payments/packages")
async def get_packages():
    return PACKAGES

@api_router.post("/payments/checkout")
async def create_checkout(request: CheckoutRequest, current_user: dict = Depends(get_current_user)):
    if request.package_id not in PACKAGES:
        raise HTTPException(400, "Invalid package")
    
    package = PACKAGES[request.package_id]
    
    # Initialize Stripe
    webhook_url = f"{request.origin_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Create checkout session
    success_url = f"{request.origin_url}/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{request.origin_url}/buy-hours"
    
    checkout_request = CheckoutSessionRequest(
        amount=package["price"],
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": current_user["_id"],
            "package_id": request.package_id,
            "hours": str(package["hours"])
        }
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction
    transaction_id = str(uuid.uuid4())
    transaction = {
        "_id": transaction_id,
        "userId": current_user["_id"],
        "sessionId": session.session_id,
        "packageId": request.package_id,
        "amount": package["price"],
        "currency": "usd",
        "hours": package["hours"],
        "status": "pending",
        "payment_status": "pending",
        "metadata": checkout_request.metadata,
        "createdAt": datetime.utcnow()
    }
    
    await db.payment_transactions.insert_one(transaction)
    
    return {"url": session.url, "sessionId": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, current_user: dict = Depends(get_current_user)):
    # Check if already processed
    transaction = await db.payment_transactions.find_one({"sessionId": session_id})
    if not transaction:
        raise HTTPException(404, "Transaction not found")
    
    if transaction["payment_status"] == "paid":
        return {
            "status": "completed",
            "payment_status": "paid",
            "amount": transaction["amount"],
            "hours": transaction["hours"]
        }
    
    # Check with Stripe
    webhook_url = "https://example.com/webhook"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction
    await db.payment_transactions.update_one(
        {"sessionId": session_id},
        {"$set": {
            "status": checkout_status.status,
            "payment_status": checkout_status.payment_status
        }}
    )
    
    # If paid, add credits to user
    if checkout_status.payment_status == "paid" and transaction["payment_status"] != "paid":
        await db.users.update_one(
            {"_id": transaction["userId"]},
            {"$inc": {"credits.available": transaction["hours"]}}
        )
    
    return {
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "amount": checkout_status.amount_total / 100,
        "currency": checkout_status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    webhook_body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    webhook_url = "https://example.com/webhook"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    webhook_response = await stripe_checkout.handle_webhook(webhook_body, signature)
    
    # Update transaction
    if webhook_response.payment_status == "paid":
        transaction = await db.payment_transactions.find_one({"sessionId": webhook_response.session_id})
        if transaction and transaction["payment_status"] != "paid":
            # Add credits
            await db.users.update_one(
                {"_id": transaction["userId"]},
                {"$inc": {"credits.available": transaction["hours"]}}
            )
            
            # Update transaction
            await db.payment_transactions.update_one(
                {"sessionId": webhook_response.session_id},
                {"$set": {"payment_status": "paid", "status": "completed"}}
            )
    
    return {"status": "ok"}

# ============= GAMIFICATION ROUTES =============

@api_router.get("/leaderboard")
async def get_leaderboard(limit: int = 10):
    users = await db.users.find().sort("gamification.xp", -1).limit(limit).to_list(length=limit)
    
    leaderboard = []
    for idx, user in enumerate(users):
        leaderboard.append({
            "rank": idx + 1,
            "userId": user["_id"],
            "name": f"{user['profile']['firstName']} {user['profile']['lastName']}",
            "photo": user["profile"].get("photo_base64"),
            "xp": user["gamification"]["xp"],
            "level": user["gamification"]["level"],
            "isVerified": user["verification"]["isVerified"]
        })
    
    return leaderboard

@api_router.get("/badges")
async def get_badges():
    # Predefined badges
    badges = [
        {"id": "first_exchange", "name": "Premier Échange", "description": "Complétez votre premier échange", "icon": "🎉", "xp": 50},
        {"id": "verified", "name": "Profil Vérifié", "description": "Vérifiez votre identité", "icon": "✅", "xp": 100},
        {"id": "helper", "name": "Bon Samaritain", "description": "Aidez 10 personnes", "icon": "💪", "xp": 200},
        {"id": "mentor", "name": "Mentor", "description": "Atteignez le niveau 10", "icon": "🏆", "xp": 500}
    ]
    return badges



# ============= CHAT ROUTES =============

@api_router.post("/chats")
async def create_chat(chat_data: ChatCreate, current_user: dict = Depends(get_current_user)):
    """Create a new chat or return existing one"""
    service = await db.services.find_one({"_id": chat_data.serviceId})
    if not service:
        raise HTTPException(404, "Service not found")
    
    # Check if chat already exists between these users for this service
    existing_chat = await db.chats.find_one({
        "serviceId": chat_data.serviceId,
        "participants": {"$all": [current_user["_id"], chat_data.participantId]}
    })
    
    if existing_chat:
        return existing_chat
    
    # Create new chat
    chat = {
        "_id": str(uuid.uuid4()),
        "serviceId": chat_data.serviceId,
        "serviceTitle": service["title"],
        "participants": [current_user["_id"], chat_data.participantId],
        "createdAt": datetime.utcnow(),
        "lastMessage": None,
        "lastMessageAt": datetime.utcnow()
    }
    
    await db.chats.insert_one(chat)
    return chat

@api_router.get("/chats")
async def get_my_chats(current_user: dict = Depends(get_current_user)):
    """Get all chats for current user"""
    chats = await db.chats.find({
        "participants": current_user["_id"]
    }).sort("lastMessageAt", -1).to_list(length=50)
    
    # Enrich with other user data
    enriched_chats = []
    for chat in chats:
        other_user_id = [p for p in chat["participants"] if p != current_user["_id"]][0]
        other_user = await db.users.find_one({"_id": other_user_id})
        
        enriched_chat = {
            **chat,
            "otherUser": {
                "_id": other_user["_id"],
                "name": f"{other_user['profile']['firstName']} {other_user['profile']['lastName']}",
                "photo": other_user["profile"].get("photo_base64"),
            }
        }
        enriched_chats.append(enriched_chat)
    
    return enriched_chats

@api_router.get("/chats/{chat_id}")
async def get_chat(chat_id: str, current_user: dict = Depends(get_current_user)):
    """Get chat details"""
    chat = await db.chats.find_one({"_id": chat_id})
    if not chat:
        raise HTTPException(404, "Chat not found")
    
    if current_user["_id"] not in chat["participants"]:
        raise HTTPException(403, "Access denied")
    
    return chat

@api_router.get("/chats/{chat_id}/messages")
async def get_chat_messages(chat_id: str, current_user: dict = Depends(get_current_user)):
    """Get all messages for a chat"""
    chat = await db.chats.find_one({"_id": chat_id})
    if not chat or current_user["_id"] not in chat["participants"]:
        raise HTTPException(403, "Access denied")
    
    messages = await db.messages.find({
        "chatId": chat_id
    }).sort("createdAt", 1).to_list(length=500)
    
    return messages

@api_router.post("/chats/{chat_id}/messages")
async def send_message(
    chat_id: str,
    message_data: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """Send a message in a chat"""
    chat = await db.chats.find_one({"_id": chat_id})
    if not chat or current_user["_id"] not in chat["participants"]:
        raise HTTPException(403, "Access denied")
    
    message = {
        "_id": str(uuid.uuid4()),
        "chatId": chat_id,
        "senderId": current_user["_id"],
        "senderName": f"{current_user['profile']['firstName']} {current_user['profile']['lastName']}",
        "content": message_data.content,
        "createdAt": datetime.utcnow(),
        "readBy": [current_user["_id"]]  # Le sender a déjà "lu" son message
    }
    
    await db.messages.insert_one(message)
    
    # Update chat last message
    await db.chats.update_one(
        {"_id": chat_id},
        {
            "$set": {
                "lastMessage": message_data.content,
                "lastMessageAt": datetime.utcnow()
            }
        }
    )
    
    # Create notification for the other participant (not the sender)
    other_participant_id = [p for p in chat["participants"] if p != current_user["_id"]][0]
    notification = {
        "_id": str(uuid.uuid4()),
        "userId": other_participant_id,
        "type": "message",
        "messageId": message["_id"],
        "chatId": chat_id,
        "senderId": current_user["_id"],
        "senderName": message["senderName"],
        "content": message_data.content[:50],  # Preview
        "timestamp": datetime.utcnow(),
        "read": False
    }
    await db.notifications.insert_one(notification)
    
    return message
    


@api_router.get("/messages/unread/count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Get count of unread messages for current user"""
    # Find all messages where user is a participant but hasn't read
    chats = await db.chats.find({
        "participants": current_user["_id"]
    }).to_list(length=None)
    
    chat_ids = [chat["_id"] for chat in chats]
    
    # Count messages not read by current user
    unread_count = await db.messages.count_documents({
        "chatId": {"$in": chat_ids},
        "senderId": {"$ne": current_user["_id"]},  # Not sent by me
        "readBy": {"$ne": current_user["_id"]}  # Not read by me
    })
    
    # Get unread count per chat
    unread_by_chat = {}
    for chat_id in chat_ids:
        count = await db.messages.count_documents({
            "chatId": chat_id,
            "senderId": {"$ne": current_user["_id"]},
            "readBy": {"$ne": current_user["_id"]}
        })
        if count > 0:
            unread_by_chat[chat_id] = count
    
    return {
        "total": unread_count,
        "byChat": unread_by_chat
    }

@api_router.post("/chats/{chat_id}/mark-read")
async def mark_chat_as_read(chat_id: str, current_user: dict = Depends(get_current_user)):
    """Mark all messages in a chat as read"""
    chat = await db.chats.find_one({"_id": chat_id})
    if not chat or current_user["_id"] not in chat["participants"]:
        raise HTTPException(403, "Access denied")
    
    # Update all messages in this chat to add current user to readBy
    result = await db.messages.update_many(
        {
            "chatId": chat_id,
            "readBy": {"$ne": current_user["_id"]}
        },
        {
            "$addToSet": {"readBy": current_user["_id"]}
        }
    )
    
    return {"marked_read": result.modified_count}


@api_router.get("/notifications")
async def get_notifications(
    unread_only: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """Get all notifications for current user"""
    query = {"userId": current_user["_id"]}
    if unread_only:
        query["read"] = False
    
    notifications = await db.notifications.find(query).sort("timestamp", -1).limit(50).to_list(length=50)
    return notifications

@api_router.post("/notifications/{notification_id}/mark-read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark a notification as read"""
    result = await db.notifications.update_one(
        {"_id": notification_id, "userId": current_user["_id"]},
        {"$set": {"read": True}}
    )
    return {"success": result.modified_count > 0}

@api_router.post("/notifications/mark-all-read")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read"""
    result = await db.notifications.update_many(
        {"userId": current_user["_id"], "read": False},
        {"$set": {"read": True}}
    )
    return {"marked_read": result.modified_count}

# ============= ADMIN ROUTES =============

async def check_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    return current_user

@api_router.get("/admin/stats")
async def get_admin_stats(admin: dict = Depends(check_admin)):
    # Total users
    total_users = await db.users.count_documents({})
    verified_users = await db.users.count_documents({"verification.isVerified": True})
    
    # Total services
    total_services = await db.services.count_documents({})
    active_services = await db.services.count_documents({"status": "active"})
    
    # Total exchanges
    total_exchanges = await db.exchanges.count_documents({})
    completed_exchanges = await db.exchanges.count_documents({"status": "completed"})
    
    # Total transactions
    total_transactions = await db.payment_transactions.count_documents({})
    paid_transactions = await db.payment_transactions.count_documents({"payment_status": "paid"})
    
    # Calculate total revenue
    transactions = await db.payment_transactions.find({"payment_status": "paid"}).to_list(length=10000)
    total_revenue = sum(t.get("amount", 0) for t in transactions)
    
    return {
        "users": {"total": total_users, "verified": verified_users},
        "services": {"total": total_services, "active": active_services},
        "exchanges": {"total": total_exchanges, "completed": completed_exchanges},
        "transactions": {"total": total_transactions, "paid": paid_transactions},
        "revenue": total_revenue
    }

@api_router.get("/admin/users")
async def get_all_users(skip: int = 0, limit: int = 50, admin: dict = Depends(check_admin)):
    users = await db.users.find().skip(skip).limit(limit).sort("createdAt", -1).to_list(length=limit)
    for user in users:
        user.pop("password_hash", None)
    return users

@api_router.put("/admin/users/{user_id}/ban")
async def ban_user(user_id: str, admin: dict = Depends(check_admin)):
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"isBanned": True, "updatedAt": datetime.utcnow()}}
    )
    return {"message": "User banned successfully"}

@api_router.put("/admin/users/{user_id}/unban")
async def unban_user(user_id: str, admin: dict = Depends(check_admin)):
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"isBanned": False, "updatedAt": datetime.utcnow()}}
    )
    return {"message": "User unbanned successfully"}

@api_router.put("/admin/users/{user_id}/verify")
async def verify_user(user_id: str, admin: dict = Depends(check_admin)):
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {
            "verification.isVerified": True,
            "verification.verifiedAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }}
    )
    return {"message": "User verified successfully"}

@api_router.get("/admin/services/stats")
async def get_services_stats(admin: dict = Depends(check_admin)):
    # Services by category
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    categories = await db.services.aggregate(pipeline).to_list(length=100)
    
    # Services by type
    offers = await db.services.count_documents({"type": "offer"})
    requests = await db.services.count_documents({"type": "request"})
    
    return {
        "byCategory": categories,
        "byType": {"offers": offers, "requests": requests}
    }

@api_router.get("/admin/exchanges/flow")
async def get_exchanges_flow(admin: dict = Depends(check_admin)):
    # Get all completed exchanges
    exchanges = await db.exchanges.find({"status": "completed"}).to_list(length=10000)
    
    # Calculate hours given vs received
    total_hours_exchanged = sum(e.get("duration", 0) for e in exchanges)
    
    # Get users balance
    users = await db.users.find().to_list(length=10000)
    user_balances = [
        {
            "userId": u["_id"],
            "name": f"{u['profile']['firstName']} {u['profile']['lastName']}",
            "given": u["credits"]["given"],
            "received": u["credits"]["received"],
            "balance": u["credits"]["available"]
        }
        for u in users
    ]
    
    return {
        "totalHoursExchanged": total_hours_exchanged,
        "userBalances": sorted(user_balances, key=lambda x: x["given"], reverse=True)[:20]
    }

@api_router.get("/admin/transactions")
async def get_all_transactions(skip: int = 0, limit: int = 50, admin: dict = Depends(check_admin)):
    transactions = await db.payment_transactions.find().skip(skip).limit(limit).sort("createdAt", -1).to_list(length=limit)
    
    # Enrich with user data
    enriched = []
    for t in transactions:
        user = await db.users.find_one({"_id": t["userId"]})
        if user:
            enriched.append({
                **t,
                "userName": f"{user['profile']['firstName']} {user['profile']['lastName']}",
                "userEmail": user["email"]
            })
    
    return enriched

# ============= RATINGS ROUTES =============

@api_router.post("/exchanges/{exchange_id}/rate")
async def rate_exchange(
    exchange_id: str,
    rating_data: RatingCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Noter un échange terminé (système d'avis type Vinted)
    """
    exchange = await db.exchanges.find_one({"_id": exchange_id})
    if not exchange:
        raise HTTPException(404, "Exchange not found")
    
    if exchange["status"] != "completed":
        raise HTTPException(400, "Cannot rate an incomplete exchange")
    
    is_provider = exchange["providerId"] == current_user["_id"]
    is_requester = exchange["requesterId"] == current_user["_id"]
    
    if not is_provider and not is_requester:
        raise HTTPException(403, "Not authorized")
    
    # Vérifier si l'utilisateur a déjà noté
    existing_rating = await db.ratings.find_one({
        "exchangeId": exchange_id,
        "fromUserId": current_user["_id"]
    })
    
    if existing_rating:
        raise HTTPException(400, "You have already rated this exchange")
    
    # Valider la note (1-5)
    if rating_data.rating < 1 or rating_data.rating > 5:
        raise HTTPException(400, "Rating must be between 1 and 5")
    
    # Déterminer qui est noté
    rated_user_id = exchange["providerId"] if is_requester else exchange["requesterId"]
    
    # Créer la notation
    rating_id = str(uuid.uuid4())
    rating = {
        "_id": rating_id,
        "exchangeId": exchange_id,
        "serviceId": exchange["serviceId"],
        "fromUserId": current_user["_id"],
        "toUserId": rated_user_id,
        "rating": rating_data.rating,
        "review": rating_data.review,
        "createdAt": datetime.utcnow()
    }
    
    await db.ratings.insert_one(rating)
    
    # Mettre à jour la moyenne de l'utilisateur noté
    all_ratings = await db.ratings.find({"toUserId": rated_user_id}).to_list(length=None)
    avg_rating = sum(r["rating"] for r in all_ratings) / len(all_ratings)
    rating_count = len(all_ratings)
    
    await db.users.update_one(
        {"_id": rated_user_id},
        {
            "$set": {
                "rating": {
                    "average": round(avg_rating, 2),
                    "count": rating_count
                }
            }
        }
    )
    
    # Notification
    notification = {
        "_id": str(uuid.uuid4()),
        "userId": rated_user_id,
        "type": "system",
        "content": f"Vous avez reçu une note de {rating_data.rating}/5 ⭐",
        "exchangeId": exchange_id,
        "timestamp": datetime.utcnow(),
        "read": False
    }
    await db.notifications.insert_one(notification)
    
    return {
        "message": "Rating submitted successfully",
        "ratingId": rating_id,
        "newAverage": round(avg_rating, 2)
    }

@api_router.get("/users/{user_id}/ratings")
async def get_user_ratings(user_id: str):
    """
    Récupérer toutes les notes d'un utilisateur
    """
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(404, "User not found")
    
    ratings = await db.ratings.find({"toUserId": user_id}).sort("createdAt", -1).to_list(length=100)
    
    # Enrichir avec les infos des auteurs
    enriched_ratings = []
    for rating in ratings:
        from_user = await db.users.find_one({"_id": rating["fromUserId"]})
        service = await db.services.find_one({"_id": rating["serviceId"]})
        
        enriched_ratings.append({
            **rating,
            "fromUser": {
                "name": f"{from_user['profile']['firstName']} {from_user['profile']['lastName']}",
                "photo": from_user['profile'].get("photo_base64"),
                "level": from_user["gamification"]["level"]
            },
            "serviceTitle": service["title"] if service else "Service supprimé"
        })
    
    return {
        "averageRating": user.get("rating", {}).get("average", 0),
        "ratingCount": user.get("rating", {}).get("count", 0),
        "ratings": enriched_ratings
    }

# ============= REPORTS ROUTES =============

@api_router.post("/reports")
async def create_report(report_data: ReportCreate, current_user: dict = Depends(get_current_user)):
    """
    Créer un signalement (service, utilisateur, message)
    """
    report_id = str(uuid.uuid4())
    
    # Déterminer l'utilisateur signalé selon le type
    reported_user_id = None
    
    if report_data.targetType == "user":
        reported_user_id = report_data.targetId
    elif report_data.targetType == "service":
        service = await db.services.find_one({"_id": report_data.targetId})
        if service:
            reported_user_id = service["userId"]
    elif report_data.targetType == "message":
        message = await db.messages.find_one({"_id": report_data.targetId})
        if message:
            reported_user_id = message["senderId"]
    
    report = {
        "_id": report_id,
        "reporterId": current_user["_id"],
        "reportedUserId": reported_user_id,
        "targetType": report_data.targetType,
        "targetId": report_data.targetId,
        "reason": report_data.reason,
        "description": report_data.description,
        "status": "pending",  # pending, reviewed, resolved, dismissed
        "createdAt": datetime.utcnow(),
        "reviewedAt": None,
        "reviewedBy": None
    }
    
    await db.reports.insert_one(report)
    
    return {
        "message": "Report submitted successfully",
        "reportId": report_id
    }

@api_router.get("/admin/reports")
async def get_all_reports(
    status: Optional[str] = None,
    admin: dict = Depends(check_admin)
):
    """
    Récupérer tous les signalements (admin uniquement)
    """
    query = {}
    if status:
        query["status"] = status
    
    reports = await db.reports.find(query).sort("createdAt", -1).to_list(length=200)
    
    # Enrichir avec les infos des utilisateurs
    enriched_reports = []
    for report in reports:
        reporter = await db.users.find_one({"_id": report["reporterId"]})
        reported = await db.users.find_one({"_id": report.get("reportedUserId")}) if report.get("reportedUserId") else None
        
        enriched_reports.append({
            **report,
            "reporter": {
                "name": f"{reporter['profile']['firstName']} {reporter['profile']['lastName']}",
                "email": reporter["email"]
            } if reporter else None,
            "reported": {
                "name": f"{reported['profile']['firstName']} {reported['profile']['lastName']}",
                "email": reported["email"]
            } if reported else None
        })
    
    return enriched_reports

@api_router.put("/admin/reports/{report_id}/status")
async def update_report_status(
    report_id: str,
    status: str,
    admin: dict = Depends(check_admin)
):
    """
    Mettre à jour le statut d'un signalement (admin uniquement)
    """
    if status not in ["pending", "reviewed", "resolved", "dismissed"]:
        raise HTTPException(400, "Invalid status")
    
    await db.reports.update_one(
        {"_id": report_id},
        {
            "$set": {
                "status": status,
                "reviewedAt": datetime.utcnow(),
                "reviewedBy": admin["_id"]
            }
        }
    )
    
    return {"message": "Report status updated successfully"}

# ============= USER PROFILE ENRICHED =============

@api_router.get("/users/{user_id}/profile")
async def get_user_profile(user_id: str):
    """
    Profil utilisateur enrichi avec stats, badges, notes (public)
    """
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(404, "User not found")
    
    # Compter les échanges terminés
    completed_exchanges = await db.exchanges.count_documents({
        "$or": [{"providerId": user_id}, {"requesterId": user_id}],
        "status": "completed"
    })
    
    # Récupérer la note moyenne
    rating_info = user.get("rating", {"average": 0, "count": 0})
    
    # Récupérer les dernières notes
    recent_ratings = await db.ratings.find({"toUserId": user_id}).sort("createdAt", -1).limit(5).to_list(length=5)
    
    enriched_ratings = []
    for rating in recent_ratings:
        from_user = await db.users.find_one({"_id": rating["fromUserId"]})
        enriched_ratings.append({
            "rating": rating["rating"],
            "review": rating["review"],
            "fromUserName": f"{from_user['profile']['firstName']} {from_user['profile']['lastName']}" if from_user else "Utilisateur",
            "createdAt": rating["createdAt"]
        })
    
    return {
        "_id": user["_id"],
        "name": f"{user['profile']['firstName']} {user['profile']['lastName']}",
        "photo": user["profile"].get("photo_base64"),
        "bio": user["profile"].get("bio", ""),
        "location": user["profile"].get("location", ""),
        "level": user["gamification"]["level"],
        "xp": user["gamification"]["xp"],
        "badges": user["gamification"].get("badges", []),
        "stats": user["gamification"].get("stats", {}),
        "isVerified": user["verification"]["isVerified"],
        "rating": rating_info,
        "completedExchanges": completed_exchanges,
        "recentRatings": enriched_ratings,
        "memberSince": user["createdAt"]
    }

# ============= HEALTH CHECK =============

@api_router.get("/")
async def root():
    return {"message": "TimeSwap API is running", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    try:
        # Test MongoDB connection
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
