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

class ExchangeCreate(BaseModel):
    serviceId: str
    message: Optional[str] = None

class RatingCreate(BaseModel):
    exchangeId: str
    rating: int
    review: Optional[str] = None

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
    
    user = {
        "_id": user_id,
        "email": user_data.email,
        "password_hash": hashed_pwd,
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
        "status": "active",
        "boostedScore": boost_score,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    await db.services.insert_one(service)
    
    return {"message": "Service created successfully", "serviceId": service_id}

@api_router.get("/services")
async def get_services(
    type: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
):
    query = {"status": "active"}
    
    if type:
        query["type"] = type
    if category:
        query["category"] = category
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    # Sort by boostedScore (verified users first)
    services = await db.services.find(query).sort("boostedScore", -1).skip(skip).limit(limit).to_list(length=limit)
    
    # Enrich with user data
    enriched_services = []
    for service in services:
        user = await db.users.find_one({"_id": service["userId"]})
        enriched_services.append({
            **service,
            "user": {
                "_id": user["_id"],
                "name": f"{user['profile']['firstName']} {user['profile']['lastName']}",
                "photo": user["profile"].get("photo_base64"),
                "isVerified": user["verification"]["isVerified"],
                "rating": user["gamification"]["xp"] / 100  # Simple rating calculation
            }
        })
    
    return enriched_services

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

# ============= EXCHANGES ROUTES =============

@api_router.post("/exchanges")
async def create_exchange(exchange_data: ExchangeCreate, current_user: dict = Depends(get_current_user)):
    service = await db.services.find_one({"_id": exchange_data.serviceId})
    if not service:
        raise HTTPException(404, "Service not found")
    
    if service["userId"] == current_user["_id"]:
        raise HTTPException(400, "Cannot exchange with yourself")
    
    # Check if user has enough credits for request
    if service["type"] == "offer" and current_user["credits"]["available"] < service["duration"]:
        raise HTTPException(400, "Insufficient credits")
    
    exchange_id = str(uuid.uuid4())
    
    exchange = {
        "_id": exchange_id,
        "serviceId": exchange_data.serviceId,
        "providerId": service["userId"] if service["type"] == "offer" else current_user["_id"],
        "receiverId": current_user["_id"] if service["type"] == "offer" else service["userId"],
        "duration": service["duration"],
        "status": "pending",
        "xpAwarded": 0,
        "rating": None,
        "review": None,
        "createdAt": datetime.utcnow(),
        "completedAt": None
    }
    
    await db.exchanges.insert_one(exchange)
    
    return {"message": "Exchange request created", "exchangeId": exchange_id}

@api_router.put("/exchanges/{exchange_id}/accept")
async def accept_exchange(exchange_id: str, current_user: dict = Depends(get_current_user)):
    exchange = await db.exchanges.find_one({"_id": exchange_id})
    if not exchange:
        raise HTTPException(404, "Exchange not found")
    
    if exchange["providerId"] != current_user["_id"] and exchange["receiverId"] != current_user["_id"]:
        raise HTTPException(403, "Not authorized")
    
    await db.exchanges.update_one(
        {"_id": exchange_id},
        {"$set": {"status": "accepted"}}
    )
    
    return {"message": "Exchange accepted"}

@api_router.put("/exchanges/{exchange_id}/complete")
async def complete_exchange(exchange_id: str, current_user: dict = Depends(get_current_user)):
    exchange = await db.exchanges.find_one({"_id": exchange_id})
    if not exchange:
        raise HTTPException(404, "Exchange not found")
    
    if exchange["providerId"] != current_user["_id"] and exchange["receiverId"] != current_user["_id"]:
        raise HTTPException(403, "Not authorized")
    
    # Award XP and update credits
    xp_awarded = int(exchange["duration"] * 10)  # 10 XP per hour
    
    # Update provider (gains credits and XP)
    await db.users.update_one(
        {"_id": exchange["providerId"]},
        {
            "$inc": {
                "credits.available": exchange["duration"],
                "credits.given": exchange["duration"],
                "gamification.xp": xp_awarded,
                "gamification.stats.force": 1
            }
        }
    )
    
    # Update receiver (uses credits)
    await db.users.update_one(
        {"_id": exchange["receiverId"]},
        {
            "$inc": {
                "credits.available": -exchange["duration"],
                "credits.received": exchange["duration"],
                "gamification.xp": xp_awarded // 2,  # Half XP for receiver
                "gamification.stats.sagesse": 1
            }
        }
    )
    
    # Update exchange
    await db.exchanges.update_one(
        {"_id": exchange_id},
        {"$set": {
            "status": "completed",
            "completedAt": datetime.utcnow(),
            "xpAwarded": xp_awarded
        }}
    )
    
    # Update levels
    for user_id in [exchange["providerId"], exchange["receiverId"]]:
        user = await db.users.find_one({"_id": user_id})
        new_level = (user["gamification"]["xp"] // 100) + 1
        await db.users.update_one(
            {"_id": user_id},
            {"$set": {"gamification.level": new_level}}
        )
    
    return {"message": "Exchange completed", "xpAwarded": xp_awarded}

@api_router.get("/exchanges/my/all")
async def get_my_exchanges(current_user: dict = Depends(get_current_user)):
    exchanges = await db.exchanges.find({
        "$or": [
            {"providerId": current_user["_id"]},
            {"receiverId": current_user["_id"]}
        ]
    }).sort("createdAt", -1).to_list(length=100)
    
    # Enrich with service and user data
    enriched_exchanges = []
    for exchange in exchanges:
        service = await db.services.find_one({"_id": exchange["serviceId"]})
        other_user_id = exchange["providerId"] if exchange["receiverId"] == current_user["_id"] else exchange["receiverId"]
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
