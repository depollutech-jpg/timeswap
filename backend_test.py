#!/usr/bin/env python3
"""
Backend Test Suite for TimeSwap Calendar Feature
Testing GET /api/exchanges/my/all endpoint
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import time

# Configuration
BASE_URL = "https://hours-exchange.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class TimeSwapTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.headers = HEADERS.copy()
        self.test_users = []
        self.test_services = []
        self.test_exchanges = []
        self.tokens = {}
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def register_test_user(self, email_suffix):
        """Register a test user and return token"""
        user_data = {
            "email": f"testuser_{email_suffix}@example.com",
            "password": "TestPassword123!",
            "firstName": f"Test{email_suffix}",
            "lastName": "User"
        }
        
        try:
            response = requests.post(f"{self.base_url}/auth/register", 
                                   json=user_data, headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                token = data.get("token")
                user_id = data.get("user", {}).get("_id")
                self.log(f"✅ User registered: {user_data['email']} (ID: {user_id})")
                self.test_users.append({"email": user_data["email"], "id": user_id, "token": token})
                self.tokens[user_id] = token
                return token, user_id
            else:
                # Try to login if user already exists
                login_response = requests.post(f"{self.base_url}/auth/login",
                                             json={"email": user_data["email"], "password": user_data["password"]},
                                             headers=self.headers)
                if login_response.status_code == 200:
                    data = login_response.json()
                    token = data.get("token")
                    user_id = data.get("user", {}).get("_id")
                    self.log(f"✅ User logged in: {user_data['email']} (ID: {user_id})")
                    self.test_users.append({"email": user_data["email"], "id": user_id, "token": token})
                    self.tokens[user_id] = token
                    return token, user_id
                else:
                    self.log(f"❌ Failed to register/login user: {response.status_code} - {response.text}", "ERROR")
                    return None, None
                    
        except Exception as e:
            self.log(f"❌ Exception during user registration: {str(e)}", "ERROR")
            return None, None
    
    def create_test_service(self, token, user_id, service_type="offer", title_suffix=""):
        """Create a test service"""
        service_data = {
            "title": f"Test Service {title_suffix} - {service_type}",
            "description": f"Test service description for {service_type}",
            "category": "Informatique",
            "duration": 2.0,
            "type": service_type,
            "location": "Paris, France",
            "coordinates": {"latitude": 48.8566, "longitude": 2.3522}
        }
        
        try:
            auth_headers = self.headers.copy()
            auth_headers["Authorization"] = f"Bearer {token}"
            
            response = requests.post(f"{self.base_url}/services", 
                                   json=service_data, headers=auth_headers)
            
            if response.status_code == 200:
                data = response.json()
                service_id = data.get("serviceId")
                self.log(f"✅ Service created: {service_data['title']} (ID: {service_id})")
                self.test_services.append({
                    "id": service_id, 
                    "user_id": user_id, 
                    "type": service_type,
                    "title": service_data["title"]
                })
                return service_id
            else:
                self.log(f"❌ Failed to create service: {response.status_code} - {response.text}", "ERROR")
                return None
                
        except Exception as e:
            self.log(f"❌ Exception during service creation: {str(e)}", "ERROR")
            return None
    
    def accept_exchange(self, requester_token, service_id):
        """Accept an exchange from a service"""
        try:
            auth_headers = self.headers.copy()
            auth_headers["Authorization"] = f"Bearer {requester_token}"
            
            exchange_data = {"message": "Je souhaite accepter cet échange"}
            
            response = requests.post(f"{self.base_url}/services/{service_id}/accept-exchange",
                                   json=exchange_data, headers=auth_headers)
            
            if response.status_code == 200:
                data = response.json()
                exchange_id = data.get("exchangeId")
                chat_id = data.get("chatId")
                self.log(f"✅ Exchange accepted: {exchange_id}")
                self.test_exchanges.append({
                    "id": exchange_id,
                    "service_id": service_id,
                    "chat_id": chat_id
                })
                return exchange_id
            else:
                self.log(f"❌ Failed to accept exchange: {response.status_code} - {response.text}", "ERROR")
                return None
                
        except Exception as e:
            self.log(f"❌ Exception during exchange acceptance: {str(e)}", "ERROR")
            return None
    
    def complete_exchange(self, exchange_id, provider_token, requester_token):
        """Complete an exchange with double validation"""
        try:
            # Provider confirms first
            auth_headers = self.headers.copy()
            auth_headers["Authorization"] = f"Bearer {provider_token}"
            
            response1 = requests.post(f"{self.base_url}/exchanges/{exchange_id}/confirm-completion",
                                    headers=auth_headers)
            
            if response1.status_code != 200:
                self.log(f"❌ Provider confirmation failed: {response1.status_code} - {response1.text}", "ERROR")
                return False
            
            # Requester confirms second
            auth_headers["Authorization"] = f"Bearer {requester_token}"
            
            response2 = requests.post(f"{self.base_url}/exchanges/{exchange_id}/confirm-completion",
                                    headers=auth_headers)
            
            if response2.status_code == 200:
                self.log(f"✅ Exchange completed: {exchange_id}")
                return True
            else:
                self.log(f"❌ Requester confirmation failed: {response2.status_code} - {response2.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Exception during exchange completion: {str(e)}", "ERROR")
            return False

    def test_authentication(self):
        """Test 1: Authentication requirements"""
        self.log("🧪 Testing authentication requirements...")
        
        # Test without token
        try:
            response = requests.get(f"{self.base_url}/exchanges/my/all", headers=self.headers)
            if response.status_code in [401, 403]:
                self.log("✅ No token correctly rejected")
            else:
                self.log(f"❌ No token should be rejected, got: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Exception testing no token: {str(e)}", "ERROR")
            return False
        
        # Test with invalid token
        try:
            invalid_headers = self.headers.copy()
            invalid_headers["Authorization"] = "Bearer invalid_token_123"
            
            response = requests.get(f"{self.base_url}/exchanges/my/all", headers=invalid_headers)
            if response.status_code in [401, 403]:
                self.log("✅ Invalid token correctly rejected")
            else:
                self.log(f"❌ Invalid token should be rejected, got: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Exception testing invalid token: {str(e)}", "ERROR")
            return False
        
        return True
    
    def test_exchange_retrieval(self):
        """Test 2: Exchange retrieval and sorting"""
        self.log("🧪 Testing exchange retrieval...")
        
        # Create test users
        token1, user1_id = self.register_test_user("calendar1")
        token2, user2_id = self.register_test_user("calendar2")
        
        if not token1 or not token2:
            self.log("❌ Failed to create test users", "ERROR")
            return False
        
        # Create services
        service1_id = self.create_test_service(token1, user1_id, "offer", "Calendar1")
        service2_id = self.create_test_service(token2, user2_id, "offer", "Calendar2")
        
        if not service1_id or not service2_id:
            self.log("❌ Failed to create test services", "ERROR")
            return False
        
        # Create exchanges
        # User2 accepts User1's service
        exchange1_id = self.accept_exchange(token2, service1_id)
        time.sleep(1)  # Ensure different timestamps
        
        # User1 accepts User2's service  
        exchange2_id = self.accept_exchange(token1, service2_id)
        
        if not exchange1_id or not exchange2_id:
            self.log("❌ Failed to create test exchanges", "ERROR")
            return False
        
        # Test User1's exchanges
        try:
            auth_headers = self.headers.copy()
            auth_headers["Authorization"] = f"Bearer {token1}"
            
            response = requests.get(f"{self.base_url}/exchanges/my/all", headers=auth_headers)
            
            if response.status_code != 200:
                self.log(f"❌ Failed to get User1 exchanges: {response.status_code} - {response.text}", "ERROR")
                return False
            
            exchanges = response.json()
            
            if len(exchanges) < 2:
                self.log(f"❌ User1 should have at least 2 exchanges, got: {len(exchanges)}", "ERROR")
                return False
            
            # Check if exchanges are sorted by date (descending)
            timestamps = [datetime.fromisoformat(ex["createdAt"].replace("Z", "+00:00")) for ex in exchanges]
            if timestamps != sorted(timestamps, reverse=True):
                self.log("❌ Exchanges not sorted by date descending", "ERROR")
                return False
            
            self.log(f"✅ User1 has {len(exchanges)} exchanges, properly sorted")
            
            # Test User2's exchanges
            auth_headers["Authorization"] = f"Bearer {token2}"
            
            response = requests.get(f"{self.base_url}/exchanges/my/all", headers=auth_headers)
            
            if response.status_code != 200:
                self.log(f"❌ Failed to get User2 exchanges: {response.status_code} - {response.text}", "ERROR")
                return False
            
            exchanges = response.json()
            
            if len(exchanges) < 2:
                self.log(f"❌ User2 should have at least 2 exchanges, got: {len(exchanges)}", "ERROR")
                return False
            
            self.log(f"✅ User2 has {len(exchanges)} exchanges")
            
        except Exception as e:
            self.log(f"❌ Exception during exchange retrieval test: {str(e)}", "ERROR")
            return False
        
        return True
    
    def test_enriched_data(self):
        """Test 3: Enriched data structure"""
        self.log("🧪 Testing enriched data structure...")
        
        if not self.test_users or len(self.test_users) < 2:
            self.log("❌ Need at least 2 test users for enriched data test", "ERROR")
            return False
        
        try:
            user = self.test_users[0]
            auth_headers = self.headers.copy()
            auth_headers["Authorization"] = f"Bearer {user['token']}"
            
            response = requests.get(f"{self.base_url}/exchanges/my/all", headers=auth_headers)
            
            if response.status_code != 200:
                self.log(f"❌ Failed to get exchanges for enriched data test: {response.status_code}", "ERROR")
                return False
            
            exchanges = response.json()
            
            if not exchanges:
                self.log("❌ No exchanges found for enriched data test", "ERROR")
                return False
            
            # Check first exchange structure
            exchange = exchanges[0]
            
            # Required exchange properties
            required_props = ["_id", "status", "duration", "createdAt", "serviceId", "providerId", "requesterId"]
            for prop in required_props:
                if prop not in exchange:
                    self.log(f"❌ Missing exchange property: {prop}", "ERROR")
                    return False
            
            # Check service object
            if "service" not in exchange:
                self.log("❌ Missing service object in exchange", "ERROR")
                return False
            
            service = exchange["service"]
            service_required = ["_id", "title"]
            for prop in service_required:
                if prop not in service:
                    self.log(f"❌ Missing service property: {prop}", "ERROR")
                    return False
            
            # Check otherUser object
            if "otherUser" not in exchange:
                self.log("❌ Missing otherUser object in exchange", "ERROR")
                return False
            
            other_user = exchange["otherUser"]
            user_required = ["_id", "name"]
            for prop in user_required:
                if prop not in other_user:
                    self.log(f"❌ Missing otherUser property: {prop}", "ERROR")
                    return False
            
            # Verify otherUser is correctly determined
            current_user_id = user["id"]
            if exchange["providerId"] == current_user_id:
                expected_other_id = exchange["requesterId"]
            else:
                expected_other_id = exchange["providerId"]
            
            if other_user["_id"] != expected_other_id:
                self.log("❌ otherUser not correctly determined", "ERROR")
                return False
            
            self.log("✅ Enriched data structure is correct")
            
        except Exception as e:
            self.log(f"❌ Exception during enriched data test: {str(e)}", "ERROR")
            return False
        
        return True
    
    def test_user_isolation(self):
        """Test 4: User isolation"""
        self.log("🧪 Testing user isolation...")
        
        if len(self.test_users) < 2:
            self.log("❌ Need at least 2 test users for isolation test", "ERROR")
            return False
        
        try:
            # Get exchanges for User1
            user1 = self.test_users[0]
            auth_headers = self.headers.copy()
            auth_headers["Authorization"] = f"Bearer {user1['token']}"
            
            response1 = requests.get(f"{self.base_url}/exchanges/my/all", headers=auth_headers)
            
            if response1.status_code != 200:
                self.log(f"❌ Failed to get User1 exchanges: {response1.status_code}", "ERROR")
                return False
            
            user1_exchanges = response1.json()
            
            # Get exchanges for User2
            user2 = self.test_users[1]
            auth_headers["Authorization"] = f"Bearer {user2['token']}"
            
            response2 = requests.get(f"{self.base_url}/exchanges/my/all", headers=auth_headers)
            
            if response2.status_code != 200:
                self.log(f"❌ Failed to get User2 exchanges: {response2.status_code}", "ERROR")
                return False
            
            user2_exchanges = response2.json()
            
            # Verify each user only sees their own exchanges
            for exchange in user1_exchanges:
                if exchange["providerId"] != user1["id"] and exchange["requesterId"] != user1["id"]:
                    self.log(f"❌ User1 sees exchange they're not part of: {exchange['_id']}", "ERROR")
                    return False
            
            for exchange in user2_exchanges:
                if exchange["providerId"] != user2["id"] and exchange["requesterId"] != user2["id"]:
                    self.log(f"❌ User2 sees exchange they're not part of: {exchange['_id']}", "ERROR")
                    return False
            
            self.log("✅ User isolation working correctly")
            
        except Exception as e:
            self.log(f"❌ Exception during user isolation test: {str(e)}", "ERROR")
            return False
        
        return True
    
    def run_all_tests(self):
        """Run all calendar endpoint tests"""
        self.log("🚀 Starting TimeSwap Calendar Backend Tests")
        self.log("=" * 60)
        
        tests = [
            ("Authentication", self.test_authentication),
            ("Exchange Retrieval", self.test_exchange_retrieval),
            ("Enriched Data", self.test_enriched_data),
            ("User Isolation", self.test_user_isolation)
        ]
        
        results = {}
        
        for test_name, test_func in tests:
            self.log(f"\n📋 Running {test_name} Test...")
            try:
                result = test_func()
                results[test_name] = result
                if result:
                    self.log(f"✅ {test_name} Test: PASSED")
                else:
                    self.log(f"❌ {test_name} Test: FAILED")
            except Exception as e:
                self.log(f"❌ {test_name} Test: EXCEPTION - {str(e)}", "ERROR")
                results[test_name] = False
        
        # Summary
        self.log("\n" + "=" * 60)
        self.log("📊 TEST SUMMARY")
        self.log("=" * 60)
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            self.log(f"{test_name}: {status}")
        
        self.log(f"\nOverall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
        
        if passed == total:
            self.log("🎉 ALL TESTS PASSED - Calendar endpoint is working correctly!")
            return True
        else:
            self.log("⚠️  Some tests failed - Calendar endpoint needs attention")
            return False

if __name__ == "__main__":
    tester = TimeSwapTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)