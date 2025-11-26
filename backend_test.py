#!/usr/bin/env python3
"""
Comprehensive Backend Testing for TimeSwap Vinted-Style Exchange System
Tests all new endpoints: exchanges, ratings, reports, enriched profiles, and services with photos
"""

import requests
import json
import uuid
import base64
from datetime import datetime
import time

# Configuration
BASE_URL = "https://swap-community.preview.emergentagent.com/api"
ADMIN_CREDENTIALS = [
    {"email": "quentinraffalli@hotmail.com", "password": "password123"},
    {"email": "depollutech@gmail.com", "password": "password123"}
]

class TimeSwapTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.tokens = {}
        self.users = {}
        self.services = {}
        self.exchanges = {}
        self.chats = {}
        self.reports = {}
        self.test_results = []
        
    def log_test(self, test_name, success, message="", details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        })
        print()
    
    def make_request(self, method, endpoint, token=None, data=None, params=None):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, params=params)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=data)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers)
            
            return response
        except Exception as e:
            print(f"Request failed: {str(e)}")
            return None
    
    def setup_test_users(self):
        """Create test users and authenticate"""
        print("🔧 Setting up test users...")
        
        # Create regular test users
        test_users = [
            {
                "email": f"provider_{uuid.uuid4().hex[:8]}@test.com",
                "password": "testpass123",
                "firstName": "Jean",
                "lastName": "Provider",
                "role": "provider"
            },
            {
                "email": f"requester_{uuid.uuid4().hex[:8]}@test.com", 
                "password": "testpass123",
                "firstName": "Marie",
                "lastName": "Requester",
                "role": "requester"
            }
        ]
        
        # Register test users
        for user_data in test_users:
            response = self.make_request("POST", "/auth/register", data=user_data)
            if response and response.status_code == 200:
                result = response.json()
                self.tokens[user_data["role"]] = result["token"]
                self.users[user_data["role"]] = result["user"]
                print(f"✅ Created {user_data['role']}: {user_data['email']}")
            else:
                print(f"❌ Failed to create {user_data['role']}: {response.text if response else 'No response'}")
        
        # Login admin users
        for i, admin_creds in enumerate(ADMIN_CREDENTIALS):
            admin_key = f"admin{i+1}"
            response = self.make_request("POST", "/auth/login", data=admin_creds)
            if response and response.status_code == 200:
                result = response.json()
                self.tokens[admin_key] = result["token"]
                self.users[admin_key] = result["user"]
                print(f"✅ Logged in {admin_key}: {admin_creds['email']}")
            else:
                print(f"❌ Failed to login {admin_key}: {response.text if response else 'No response'}")
        
        print()
    
    def test_service_creation_with_photos(self):
        """Test POST /api/services with photos (max 3, 5MB limit)"""
        print("📸 Testing service creation with photos...")
        
        # Create a small test image (base64)
        test_image_data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        # Test 1: Service with 1 photo
        service_data = {
            "title": "Service de jardinage avec photos",
            "description": "Entretien de jardin professionnel avec photos avant/après",
            "category": "Jardinage",
            "duration": 2.0,
            "type": "offer",
            "location": "Paris 15ème",
            "coordinates": {"latitude": 48.8566, "longitude": 2.3522},
            "photos": [test_image_data]
        }
        
        response = self.make_request("POST", "/services", token=self.tokens["provider"], data=service_data)
        if response and response.status_code == 200:
            result = response.json()
            self.services["with_photos"] = result["serviceId"]
            self.log_test("Service creation with 1 photo", True, f"Service ID: {result['serviceId']}")
        else:
            self.log_test("Service creation with 1 photo", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 2: Service with 3 photos (max allowed)
        service_data["photos"] = [test_image_data, test_image_data, test_image_data]
        service_data["title"] = "Service avec 3 photos"
        
        response = self.make_request("POST", "/services", token=self.tokens["provider"], data=service_data)
        if response and response.status_code == 200:
            self.log_test("Service creation with 3 photos", True, "Maximum photos allowed")
        else:
            self.log_test("Service creation with 3 photos", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test 3: Service with 4 photos (should fail)
        service_data["photos"] = [test_image_data] * 4
        service_data["title"] = "Service avec 4 photos (should fail)"
        
        response = self.make_request("POST", "/services", token=self.tokens["provider"], data=service_data)
        if response and response.status_code == 400:
            self.log_test("Service creation with 4 photos (validation)", True, "Correctly rejected >3 photos")
        else:
            self.log_test("Service creation with 4 photos (validation)", False, "Should have rejected >3 photos")
        
        # Create a simple service for exchange testing
        simple_service = {
            "title": "Cours de français",
            "description": "Cours particuliers de français pour débutants",
            "category": "Education",
            "duration": 1.5,
            "type": "offer",
            "location": "Lyon",
            "coordinates": {"latitude": 45.7640, "longitude": 4.8357}
        }
        
        response = self.make_request("POST", "/services", token=self.tokens["provider"], data=simple_service)
        if response and response.status_code == 200:
            result = response.json()
            self.services["main_test"] = result["serviceId"]
            self.log_test("Simple service creation for exchange testing", True, f"Service ID: {result['serviceId']}")
        else:
            self.log_test("Simple service creation for exchange testing", False, "Failed to create test service")
    
    def test_exchange_acceptance(self):
        """Test POST /api/services/{service_id}/accept-exchange"""
        print("🤝 Testing exchange acceptance...")
        
        if "main_test" not in self.services:
            self.log_test("Exchange acceptance", False, "No test service available")
            return
        
        service_id = self.services["main_test"]
        
        # Test 1: Valid exchange acceptance
        exchange_data = {"message": "Je suis très intéressé par votre cours de français !"}
        
        response = self.make_request("POST", f"/services/{service_id}/accept-exchange", 
                                   token=self.tokens["requester"], data=exchange_data)
        
        if response and response.status_code == 200:
            result = response.json()
            self.exchanges["main"] = result["exchangeId"]
            self.chats["main"] = result["chatId"]
            self.log_test("Exchange acceptance", True, 
                         f"Exchange ID: {result['exchangeId']}, Chat ID: {result['chatId']}")
        else:
            self.log_test("Exchange acceptance", False, 
                         f"Status: {response.status_code if response else 'No response'}")
            return
        
        # Test 2: Try to accept own service (should fail)
        response = self.make_request("POST", f"/services/{service_id}/accept-exchange",
                                   token=self.tokens["provider"], data=exchange_data)
        
        if response and response.status_code == 400:
            self.log_test("Exchange acceptance - own service rejection", True, "Correctly rejected self-acceptance")
        else:
            self.log_test("Exchange acceptance - own service rejection", False, "Should reject self-acceptance")
        
        # Test 3: Try to accept already locked service (should fail)
        response = self.make_request("POST", f"/services/{service_id}/accept-exchange",
                                   token=self.tokens["requester"], data=exchange_data)
        
        if response and response.status_code == 400:
            self.log_test("Exchange acceptance - locked service rejection", True, "Correctly rejected locked service")
        else:
            self.log_test("Exchange acceptance - locked service rejection", False, "Should reject locked service")
    
    def test_exchange_retrieval(self):
        """Test GET /api/exchanges/{exchange_id}"""
        print("📋 Testing exchange retrieval...")
        
        if "main" not in self.exchanges:
            self.log_test("Exchange retrieval", False, "No exchange available")
            return
        
        exchange_id = self.exchanges["main"]
        
        # Test 1: Provider retrieves exchange
        response = self.make_request("GET", f"/exchanges/{exchange_id}", token=self.tokens["provider"])
        
        if response and response.status_code == 200:
            result = response.json()
            expected_fields = ["_id", "serviceId", "providerId", "requesterId", "status", "service", "provider", "requester"]
            missing_fields = [field for field in expected_fields if field not in result]
            
            if not missing_fields:
                self.log_test("Exchange retrieval - provider", True, "All required fields present")
            else:
                self.log_test("Exchange retrieval - provider", False, f"Missing fields: {missing_fields}")
        else:
            self.log_test("Exchange retrieval - provider", False, 
                         f"Status: {response.status_code if response else 'No response'}")
        
        # Test 2: Requester retrieves exchange
        response = self.make_request("GET", f"/exchanges/{exchange_id}", token=self.tokens["requester"])
        
        if response and response.status_code == 200:
            self.log_test("Exchange retrieval - requester", True, "Requester can access exchange")
        else:
            self.log_test("Exchange retrieval - requester", False, "Requester should access exchange")
        
        # Test 3: Unauthorized user tries to access (should fail)
        if "admin1" in self.tokens:
            response = self.make_request("GET", f"/exchanges/{exchange_id}", token=self.tokens["admin1"])
            
            if response and response.status_code == 403:
                self.log_test("Exchange retrieval - unauthorized access", True, "Correctly blocked unauthorized access")
            else:
                self.log_test("Exchange retrieval - unauthorized access", False, "Should block unauthorized access")
    
    def test_exchange_confirmation(self):
        """Test POST /api/exchanges/{exchange_id}/confirm-completion (double validation)"""
        print("✅ Testing exchange confirmation (double validation)...")
        
        if "main" not in self.exchanges:
            self.log_test("Exchange confirmation", False, "No exchange available")
            return
        
        exchange_id = self.exchanges["main"]
        
        # Test 1: Provider confirms first
        response = self.make_request("POST", f"/exchanges/{exchange_id}/confirm-completion", 
                                   token=self.tokens["provider"])
        
        if response and response.status_code == 200:
            result = response.json()
            if "providerConfirmed" in result and result["providerConfirmed"]:
                self.log_test("Exchange confirmation - provider first", True, "Provider confirmation recorded")
            else:
                self.log_test("Exchange confirmation - provider first", False, "Provider confirmation not recorded")
        else:
            self.log_test("Exchange confirmation - provider first", False, 
                         f"Status: {response.status_code if response else 'No response'}")
        
        # Test 2: Provider tries to confirm again (should fail)
        response = self.make_request("POST", f"/exchanges/{exchange_id}/confirm-completion", 
                                   token=self.tokens["provider"])
        
        if response and response.status_code == 400:
            self.log_test("Exchange confirmation - double confirmation prevention", True, "Correctly prevented double confirmation")
        else:
            self.log_test("Exchange confirmation - double confirmation prevention", False, "Should prevent double confirmation")
        
        # Test 3: Requester confirms (should complete exchange and transfer hours)
        response = self.make_request("POST", f"/exchanges/{exchange_id}/confirm-completion", 
                                   token=self.tokens["requester"])
        
        if response and response.status_code == 200:
            result = response.json()
            if result.get("status") == "completed" and "hoursTransferred" in result and "xpAwarded" in result:
                self.log_test("Exchange confirmation - completion", True, 
                             f"Exchange completed, {result['hoursTransferred']}h transferred, {result['xpAwarded']} XP awarded")
            else:
                self.log_test("Exchange confirmation - completion", False, "Exchange not properly completed")
        else:
            self.log_test("Exchange confirmation - completion", False, 
                         f"Status: {response.status_code if response else 'No response'}")
    
    def test_exchange_cancellation(self):
        """Test POST /api/exchanges/{exchange_id}/cancel with penalties"""
        print("❌ Testing exchange cancellation with penalties...")
        
        # Create a new service and exchange for cancellation testing
        service_data = {
            "title": "Service pour test d'annulation",
            "description": "Service créé spécialement pour tester l'annulation",
            "category": "Test",
            "duration": 1.0,
            "type": "offer",
            "location": "Test City"
        }
        
        response = self.make_request("POST", "/services", token=self.tokens["provider"], data=service_data)
        if not response or response.status_code != 200:
            self.log_test("Exchange cancellation setup", False, "Failed to create test service")
            return
        
        cancel_service_id = response.json()["serviceId"]
        
        # Accept the exchange
        exchange_data = {"message": "Test pour annulation"}
        response = self.make_request("POST", f"/services/{cancel_service_id}/accept-exchange",
                                   token=self.tokens["requester"], data=exchange_data)
        
        if not response or response.status_code != 200:
            self.log_test("Exchange cancellation setup", False, "Failed to create test exchange")
            return
        
        cancel_exchange_id = response.json()["exchangeId"]
        
        # Test 1: Cancel without prior confirmation (no penalty)
        cancel_data = {"reason": "Changement de programme"}
        response = self.make_request("POST", f"/exchanges/{cancel_exchange_id}/cancel",
                                   token=self.tokens["requester"], data=cancel_data)
        
        if response and response.status_code == 200:
            result = response.json()
            if not result.get("penaltyApplied"):
                self.log_test("Exchange cancellation - no penalty", True, "No penalty applied for early cancellation")
            else:
                self.log_test("Exchange cancellation - no penalty", False, "Penalty incorrectly applied")
        else:
            self.log_test("Exchange cancellation - no penalty", False, 
                         f"Status: {response.status_code if response else 'No response'}")
        
        # Test cancellation with penalty (create another exchange, confirm, then cancel)
        service_data["title"] = "Service pour test pénalité"
        response = self.make_request("POST", "/services", token=self.tokens["provider"], data=service_data)
        if response and response.status_code == 200:
            penalty_service_id = response.json()["serviceId"]
            
            # Accept exchange
            response = self.make_request("POST", f"/services/{penalty_service_id}/accept-exchange",
                                       token=self.tokens["requester"], data=exchange_data)
            if response and response.status_code == 200:
                penalty_exchange_id = response.json()["exchangeId"]
                
                # Provider confirms
                self.make_request("POST", f"/exchanges/{penalty_exchange_id}/confirm-completion",
                                token=self.tokens["provider"])
                
                # Requester cancels (should have penalty)
                response = self.make_request("POST", f"/exchanges/{penalty_exchange_id}/cancel",
                                           token=self.tokens["requester"], data=cancel_data)
                
                if response and response.status_code == 200:
                    result = response.json()
                    if result.get("penaltyApplied") and result.get("penaltyHours", 0) > 0:
                        self.log_test("Exchange cancellation - with penalty", True, 
                                     f"Penalty applied: {result['penaltyHours']}h, {result['penaltyXP']} XP")
                    else:
                        self.log_test("Exchange cancellation - with penalty", False, "Penalty not applied")
                else:
                    self.log_test("Exchange cancellation - with penalty", False, "Cancellation failed")
    
    def test_my_exchanges(self):
        """Test GET /api/exchanges/my/all"""
        print("📜 Testing my exchanges retrieval...")
        
        # Test provider's exchanges
        response = self.make_request("GET", "/exchanges/my/all", token=self.tokens["provider"])
        
        if response and response.status_code == 200:
            result = response.json()
            if isinstance(result, list):
                provider_exchanges = len(result)
                self.log_test("My exchanges - provider", True, f"Found {provider_exchanges} exchanges")
            else:
                self.log_test("My exchanges - provider", False, "Response not a list")
        else:
            self.log_test("My exchanges - provider", False, 
                         f"Status: {response.status_code if response else 'No response'}")
        
        # Test requester's exchanges
        response = self.make_request("GET", "/exchanges/my/all", token=self.tokens["requester"])
        
        if response and response.status_code == 200:
            result = response.json()
            if isinstance(result, list):
                requester_exchanges = len(result)
                self.log_test("My exchanges - requester", True, f"Found {requester_exchanges} exchanges")
                
                # Check enriched data
                if result and "service" in result[0] and "otherUser" in result[0]:
                    self.log_test("My exchanges - enriched data", True, "Service and otherUser data present")
                else:
                    self.log_test("My exchanges - enriched data", False, "Missing enriched data")
            else:
                self.log_test("My exchanges - requester", False, "Response not a list")
        else:
            self.log_test("My exchanges - requester", False, 
                         f"Status: {response.status_code if response else 'No response'}")
    
    def test_rating_system(self):
        """Test POST /api/exchanges/{exchange_id}/rate and GET /api/users/{user_id}/ratings"""
        print("⭐ Testing rating system...")
        
        if "main" not in self.exchanges:
            self.log_test("Rating system", False, "No completed exchange available")
            return
        
        exchange_id = self.exchanges["main"]
        
        # Test 1: Rate the exchange (requester rates provider)
        rating_data = {
            "rating": 5,
            "review": "Excellent professeur de français ! Très pédagogue et patient."
        }
        
        response = self.make_request("POST", f"/exchanges/{exchange_id}/rate",
                                   token=self.tokens["requester"], data=rating_data)
        
        if response and response.status_code == 200:
            result = response.json()
            if "newAverage" in result:
                self.log_test("Rating creation", True, f"Rating submitted, new average: {result['newAverage']}")
            else:
                self.log_test("Rating creation", False, "Rating submitted but no average returned")
        else:
            self.log_test("Rating creation", False, 
                         f"Status: {response.status_code if response else 'No response'}")
        
        # Test 2: Try to rate again (should fail)
        response = self.make_request("POST", f"/exchanges/{exchange_id}/rate",
                                   token=self.tokens["requester"], data=rating_data)
        
        if response and response.status_code == 400:
            self.log_test("Rating - double rating prevention", True, "Correctly prevented double rating")
        else:
            self.log_test("Rating - double rating prevention", False, "Should prevent double rating")
        
        # Test 3: Invalid rating (should fail)
        invalid_rating = {"rating": 6, "review": "Invalid rating"}
        response = self.make_request("POST", f"/exchanges/{exchange_id}/rate",
                                   token=self.tokens["provider"], data=invalid_rating)
        
        if response and response.status_code == 400:
            self.log_test("Rating - validation", True, "Correctly rejected invalid rating")
        else:
            self.log_test("Rating - validation", False, "Should reject invalid rating")
        
        # Test 4: Valid rating from provider
        provider_rating = {"rating": 4, "review": "Étudiant sérieux et motivé"}
        response = self.make_request("POST", f"/exchanges/{exchange_id}/rate",
                                   token=self.tokens["provider"], data=provider_rating)
        
        if response and response.status_code == 200:
            self.log_test("Rating - provider rating", True, "Provider successfully rated requester")
        else:
            self.log_test("Rating - provider rating", False, "Provider rating failed")
        
        # Test 5: Get user ratings
        provider_id = self.users["provider"]["_id"]
        response = self.make_request("GET", f"/users/{provider_id}/ratings")
        
        if response and response.status_code == 200:
            result = response.json()
            expected_fields = ["averageRating", "ratingCount", "ratings"]
            missing_fields = [field for field in expected_fields if field not in result]
            
            if not missing_fields and result["ratingCount"] > 0:
                self.log_test("User ratings retrieval", True, 
                             f"Average: {result['averageRating']}, Count: {result['ratingCount']}")
            else:
                self.log_test("User ratings retrieval", False, f"Missing fields or no ratings: {missing_fields}")
        else:
            self.log_test("User ratings retrieval", False, 
                         f"Status: {response.status_code if response else 'No response'}")
    
    def test_reports_system(self):
        """Test POST /api/reports, GET /api/admin/reports, PUT /api/admin/reports/{id}/status"""
        print("🚨 Testing reports system...")
        
        # Test 1: Create service report
        service_id = self.services.get("main_test")
        if not service_id:
            self.log_test("Reports system setup", False, "No service available for reporting")
            return
        
        report_data = {
            "targetType": "service",
            "targetId": service_id,
            "reason": "Spam",
            "description": "Ce service semble être du spam répétitif"
        }
        
        response = self.make_request("POST", "/reports", token=self.tokens["requester"], data=report_data)
        
        if response and response.status_code == 200:
            result = response.json()
            self.reports["service"] = result["reportId"]
            self.log_test("Report creation - service", True, f"Report ID: {result['reportId']}")
        else:
            self.log_test("Report creation - service", False, 
                         f"Status: {response.status_code if response else 'No response'}")
        
        # Test 2: Create user report
        provider_id = self.users["provider"]["_id"]
        user_report_data = {
            "targetType": "user",
            "targetId": provider_id,
            "reason": "Comportement inapproprié",
            "description": "Utilisateur impoli dans les messages"
        }
        
        response = self.make_request("POST", "/reports", token=self.tokens["requester"], data=user_report_data)
        
        if response and response.status_code == 200:
            result = response.json()
            self.reports["user"] = result["reportId"]
            self.log_test("Report creation - user", True, f"Report ID: {result['reportId']}")
        else:
            self.log_test("Report creation - user", False, 
                         f"Status: {response.status_code if response else 'No response'}")
        
        # Test 3: Admin retrieves all reports
        if "admin1" not in self.tokens:
            self.log_test("Admin reports retrieval", False, "No admin token available")
            return
        
        response = self.make_request("GET", "/admin/reports", token=self.tokens["admin1"])
        
        if response and response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) >= 2:
                self.log_test("Admin reports retrieval", True, f"Found {len(result)} reports")
                
                # Check enriched data
                if result[0].get("reporter") and result[0].get("reported"):
                    self.log_test("Admin reports - enriched data", True, "Reporter and reported data present")
                else:
                    self.log_test("Admin reports - enriched data", False, "Missing enriched data")
            else:
                self.log_test("Admin reports retrieval", False, "No reports found or invalid format")
        else:
            self.log_test("Admin reports retrieval", False, 
                         f"Status: {response.status_code if response else 'No response'}")
        
        # Test 4: Filter reports by status
        response = self.make_request("GET", "/admin/reports", token=self.tokens["admin1"], params={"status": "pending"})
        
        if response and response.status_code == 200:
            result = response.json()
            pending_reports = [r for r in result if r["status"] == "pending"]
            if len(pending_reports) == len(result):
                self.log_test("Admin reports - status filter", True, f"Found {len(pending_reports)} pending reports")
            else:
                self.log_test("Admin reports - status filter", False, "Filter not working correctly")
        else:
            self.log_test("Admin reports - status filter", False, "Status filter failed")
        
        # Test 5: Update report status
        if "service" in self.reports:
            report_id = self.reports["service"]
            response = self.make_request("PUT", f"/admin/reports/{report_id}/status",
                                       token=self.tokens["admin1"], data={"status": "reviewed"})
            
            if response and response.status_code == 200:
                self.log_test("Report status update", True, "Status updated to reviewed")
            else:
                self.log_test("Report status update", False, 
                             f"Status: {response.status_code if response else 'No response'}")
        
        # Test 6: Non-admin tries to access reports (should fail)
        response = self.make_request("GET", "/admin/reports", token=self.tokens["requester"])
        
        if response and response.status_code == 403:
            self.log_test("Admin reports - access control", True, "Correctly blocked non-admin access")
        else:
            self.log_test("Admin reports - access control", False, "Should block non-admin access")
    
    def test_enriched_user_profile(self):
        """Test GET /api/users/{user_id}/profile (enriched profile)"""
        print("👤 Testing enriched user profile...")
        
        provider_id = self.users["provider"]["_id"]
        response = self.make_request("GET", f"/users/{provider_id}/profile")
        
        if response and response.status_code == 200:
            result = response.json()
            expected_fields = ["name", "photo", "level", "xp", "badges", "rating", "completedExchanges", "recentRatings"]
            missing_fields = [field for field in expected_fields if field not in result]
            
            if not missing_fields:
                self.log_test("Enriched user profile", True, 
                             f"Level: {result['level']}, XP: {result['xp']}, Completed: {result['completedExchanges']}")
                
                # Check rating info
                if "average" in result["rating"] and "count" in result["rating"]:
                    self.log_test("Enriched profile - rating info", True, 
                                 f"Rating: {result['rating']['average']}/5 ({result['rating']['count']} reviews)")
                else:
                    self.log_test("Enriched profile - rating info", False, "Missing rating details")
                
                # Check recent ratings
                if isinstance(result["recentRatings"], list):
                    self.log_test("Enriched profile - recent ratings", True, 
                                 f"Found {len(result['recentRatings'])} recent ratings")
                else:
                    self.log_test("Enriched profile - recent ratings", False, "Recent ratings not a list")
            else:
                self.log_test("Enriched user profile", False, f"Missing fields: {missing_fields}")
        else:
            self.log_test("Enriched user profile", False, 
                         f"Status: {response.status_code if response else 'No response'}")
    
    def test_security_scenarios(self):
        """Test security scenarios and edge cases"""
        print("🔒 Testing security scenarios...")
        
        # Test 1: Insufficient balance (create user with low balance)
        low_balance_user = {
            "email": f"lowbalance_{uuid.uuid4().hex[:8]}@test.com",
            "password": "testpass123",
            "firstName": "Poor",
            "lastName": "User"
        }
        
        response = self.make_request("POST", "/auth/register", data=low_balance_user)
        if response and response.status_code == 200:
            low_balance_token = response.json()["token"]
            
            # Try to accept a service with insufficient balance
            if "main_test" in self.services:
                # First create a new service since the main one is locked
                service_data = {
                    "title": "Service coûteux",
                    "description": "Service qui coûte plus que le solde disponible",
                    "category": "Test",
                    "duration": 5.0,  # 5 hours, more than default 2h balance
                    "type": "offer",
                    "location": "Test"
                }
                
                response = self.make_request("POST", "/services", token=self.tokens["provider"], data=service_data)
                if response and response.status_code == 200:
                    expensive_service_id = response.json()["serviceId"]
                    
                    # Try to accept with insufficient balance
                    response = self.make_request("POST", f"/services/{expensive_service_id}/accept-exchange",
                                               token=low_balance_token, data={"message": "Test"})
                    
                    if response and response.status_code == 400 and "insuffisant" in response.text.lower():
                        self.log_test("Security - insufficient balance", True, "Correctly blocked insufficient balance")
                    else:
                        self.log_test("Security - insufficient balance", False, "Should block insufficient balance")
        
        # Test 2: Access control on exchanges
        if "main" in self.exchanges:
            exchange_id = self.exchanges["main"]
            
            # Create another user and try to access the exchange
            other_user = {
                "email": f"other_{uuid.uuid4().hex[:8]}@test.com",
                "password": "testpass123",
                "firstName": "Other",
                "lastName": "User"
            }
            
            response = self.make_request("POST", "/auth/register", data=other_user)
            if response and response.status_code == 200:
                other_token = response.json()["token"]
                
                response = self.make_request("GET", f"/exchanges/{exchange_id}", token=other_token)
                
                if response and response.status_code == 403:
                    self.log_test("Security - exchange access control", True, "Correctly blocked unauthorized access")
                else:
                    self.log_test("Security - exchange access control", False, "Should block unauthorized access")
    
    def run_comprehensive_test(self):
        """Run all tests in sequence"""
        print("🚀 Starting comprehensive TimeSwap Vinted-style exchange system testing...")
        print("=" * 80)
        
        # Setup
        self.setup_test_users()
        
        # Core functionality tests
        self.test_service_creation_with_photos()
        self.test_exchange_acceptance()
        self.test_exchange_retrieval()
        self.test_exchange_confirmation()
        self.test_exchange_cancellation()
        self.test_my_exchanges()
        
        # Rating system tests
        self.test_rating_system()
        
        # Reports system tests
        self.test_reports_system()
        
        # Enriched profile tests
        self.test_enriched_user_profile()
        
        # Security tests
        self.test_security_scenarios()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t["success"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print()
        
        if failed_tests > 0:
            print("❌ FAILED TESTS:")
            for test in self.test_results:
                if not test["success"]:
                    print(f"  - {test['test']}: {test['message']}")
            print()
        
        print("🎯 CRITICAL FUNCTIONALITY STATUS:")
        critical_tests = [
            "Exchange acceptance",
            "Exchange confirmation - completion", 
            "Rating creation",
            "Report creation - service",
            "Admin reports retrieval",
            "Enriched user profile"
        ]
        
        for critical_test in critical_tests:
            test_result = next((t for t in self.test_results if t["test"] == critical_test), None)
            if test_result:
                status = "✅" if test_result["success"] else "❌"
                print(f"  {status} {critical_test}")
            else:
                print(f"  ⚠️  {critical_test} (not tested)")
        
        print("\n" + "=" * 80)

if __name__ == "__main__":
    tester = TimeSwapTester()
    tester.run_comprehensive_test()