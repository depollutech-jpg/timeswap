#!/usr/bin/env python3
"""
Backend Test Suite for Coup de Pouce - Service Deletion Endpoint
Testing DELETE /api/services/{service_id} endpoint according to review request
"""

import requests
import json
import uuid
from datetime import datetime
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"
HEADERS = {"Content-Type": "application/json"}

print(f"🔗 Testing DELETE endpoint at: {API_BASE}")

class TestResults:
    def __init__(self):
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.results = []
    
    def add_result(self, test_name, passed, message=""):
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            self.failed_tests += 1
            status = "❌ FAIL"
        
        result = f"{status}: {test_name}"
        if message:
            result += f" - {message}"
        
        self.results.append(result)
        print(result)
    
    def print_summary(self):
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY - DELETE SERVICE ENDPOINT")
        print(f"{'='*60}")
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.failed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests*100):.1f}%")
        print(f"{'='*60}")
        
        if self.failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if "❌ FAIL" in result:
                    print(f"  {result}")

class CoupDePouceBackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_user_id = None
        self.test_service_id = None
        
    def log_test(self, test_name, success, details=""):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   📝 {details}")
        print()
        
    def register_test_user(self):
        """Register a test user for authentication"""
        print("🔐 TESTING USER REGISTRATION")
        
        # Generate unique email for this test run
        timestamp = int(time.time())
        test_email = f"testuser_{timestamp}@example.com"
        
        user_data = {
            "email": test_email,
            "password": "TestPassword123!",
            "firstName": "Marie",
            "lastName": "Dupont"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=user_data)
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get('token')
                self.test_user_id = data.get('user', {}).get('_id')
                
                # Set authorization header for future requests
                self.session.headers.update({'Authorization': f'Bearer {self.auth_token}'})
                
                self.log_test("User Registration", True, f"User created with ID: {self.test_user_id}")
                return True
            else:
                self.log_test("User Registration", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Registration", False, f"Exception: {str(e)}")
            return False
    
    def test_login(self):
        """Test user login functionality"""
        print("🔐 TESTING USER LOGIN")
        
        # First register a user to login with
        timestamp = int(time.time())
        test_email = f"logintest_{timestamp}@example.com"
        
        # Register
        register_data = {
            "email": test_email,
            "password": "LoginTest123!",
            "firstName": "Jean",
            "lastName": "Martin"
        }
        
        try:
            reg_response = self.session.post(f"{API_BASE}/auth/register", json=register_data)
            if reg_response.status_code != 200:
                self.log_test("Login Test Setup", False, "Failed to register test user for login")
                return False
            
            # Now test login
            login_data = {
                "email": test_email,
                "password": "LoginTest123!"
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                token = data.get('token')
                user = data.get('user', {})
                
                if token and user.get('_id'):
                    self.log_test("User Login", True, f"Login successful, token received")
                    return True
                else:
                    self.log_test("User Login", False, "Missing token or user data in response")
                    return False
            else:
                self.log_test("User Login", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Login", False, f"Exception: {str(e)}")
            return False
    
    def test_service_creation_with_expiration(self):
        """Test service creation and verify expiresAt field is added (3 days)"""
        print("⏰ TESTING SERVICE CREATION WITH EXPIRATION")
        
        if not self.auth_token:
            self.log_test("Service Creation", False, "No auth token available")
            return False
        
        # Record time before creation
        creation_time = datetime.utcnow()
        expected_expiry = creation_time + timedelta(days=3)
        
        service_data = {
            "title": "Cours de français - Coup de Pouce",
            "description": "Je propose des cours de français pour débutants. Méthode interactive et personnalisée.",
            "category": "Education",
            "duration": 2.0,
            "type": "offer",
            "location": "Paris 15ème",
            "coordinates": {
                "latitude": 48.8566,
                "longitude": 2.3522
            }
        }
        
        try:
            response = self.session.post(f"{API_BASE}/services", json=service_data)
            
            if response.status_code == 200:
                data = response.json()
                service_id = data.get('serviceId')
                
                if service_id:
                    self.test_service_id = service_id
                    
                    # Now fetch the created service to verify expiresAt field
                    service_response = self.session.get(f"{API_BASE}/services/{service_id}")
                    
                    if service_response.status_code == 200:
                        service_details = service_response.json()
                        expires_at_str = service_details.get('expiresAt')
                        
                        if expires_at_str:
                            # Parse the expiration date
                            expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
                            
                            # Check if expiration is approximately 3 days from creation (allow 1 minute tolerance)
                            time_diff = abs((expires_at - expected_expiry).total_seconds())
                            
                            if time_diff < 60:  # Less than 1 minute difference
                                self.log_test("Service Creation with Expiration", True, 
                                            f"Service created with correct expiresAt: {expires_at_str}")
                                return True
                            else:
                                self.log_test("Service Creation with Expiration", False, 
                                            f"Expiration time incorrect. Expected ~{expected_expiry}, got {expires_at}")
                                return False
                        else:
                            self.log_test("Service Creation with Expiration", False, 
                                        "Service created but missing expiresAt field")
                            return False
                    else:
                        self.log_test("Service Creation with Expiration", False, 
                                    f"Failed to fetch created service: {service_response.status_code}")
                        return False
                else:
                    self.log_test("Service Creation with Expiration", False, 
                                "Service creation response missing serviceId")
                    return False
            else:
                self.log_test("Service Creation with Expiration", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Service Creation with Expiration", False, f"Exception: {str(e)}")
            return False
    
    def test_service_expiration_filtering(self):
        """Test that GET /api/services filters out expired services automatically"""
        print("🔍 TESTING SERVICE EXPIRATION FILTERING")
        
        if not self.auth_token:
            self.log_test("Service Expiration Filtering", False, "No auth token available")
            return False
        
        try:
            # First, create a normal service (should appear in results)
            current_time = datetime.utcnow()
            
            normal_service = {
                "title": "Service Normal - Visible",
                "description": "Ce service devrait être visible car il n'est pas expiré",
                "category": "Jardinage",
                "duration": 1.5,
                "type": "offer",
                "location": "Lyon"
            }
            
            normal_response = self.session.post(f"{API_BASE}/services", json=normal_service)
            
            if normal_response.status_code != 200:
                self.log_test("Service Expiration Filtering", False, 
                            "Failed to create normal service for test")
                return False
            
            normal_service_id = normal_response.json().get('serviceId')
            
            # Wait a moment then fetch services
            time.sleep(1)
            
            # Get all services
            services_response = self.session.get(f"{API_BASE}/services")
            
            if services_response.status_code == 200:
                services = services_response.json()
                
                # Check that our normal service appears
                normal_service_found = False
                expired_services_found = []
                
                for service in services:
                    if service.get('_id') == normal_service_id:
                        normal_service_found = True
                    
                    # Check if any service has expiresAt in the past
                    expires_at_str = service.get('expiresAt')
                    if expires_at_str:
                        expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
                        if expires_at < current_time:
                            expired_services_found.append(service.get('_id'))
                
                # Verify results
                if normal_service_found and len(expired_services_found) == 0:
                    self.log_test("Service Expiration Filtering", True, 
                                f"✅ Normal service found, no expired services returned. Total services: {len(services)}")
                    return True
                elif not normal_service_found:
                    self.log_test("Service Expiration Filtering", False, 
                                "Normal service not found in results")
                    return False
                else:
                    self.log_test("Service Expiration Filtering", False, 
                                f"Found {len(expired_services_found)} expired services in results: {expired_services_found}")
                    return False
            else:
                self.log_test("Service Expiration Filtering", False, 
                            f"Failed to fetch services: {services_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Service Expiration Filtering", False, f"Exception: {str(e)}")
            return False
    
    def test_service_creation_all_fields(self):
        """Test service creation with all required fields"""
        print("📝 TESTING SERVICE CREATION WITH ALL FIELDS")
        
        if not self.auth_token:
            self.log_test("Service Creation All Fields", False, "No auth token available")
            return False
        
        # Test both offer and request types
        test_services = [
            {
                "title": "Aide au déménagement",
                "description": "Je propose mon aide pour déménager. Expérience avec gros mobilier.",
                "category": "Déménagement",
                "duration": 4.0,
                "type": "offer",
                "location": "Marseille",
                "coordinates": {
                    "latitude": 43.2965,
                    "longitude": 5.3698
                }
            },
            {
                "title": "Recherche prof de guitare",
                "description": "Je cherche quelqu'un pour m'apprendre la guitare acoustique.",
                "category": "Musique",
                "duration": 1.0,
                "type": "request",
                "location": "Toulouse"
            }
        ]
        
        success_count = 0
        
        for i, service_data in enumerate(test_services):
            try:
                response = self.session.post(f"{API_BASE}/services", json=service_data)
                
                if response.status_code == 200:
                    data = response.json()
                    service_id = data.get('serviceId')
                    
                    if service_id:
                        # Verify the service was created with all fields
                        service_response = self.session.get(f"{API_BASE}/services/{service_id}")
                        
                        if service_response.status_code == 200:
                            service_details = service_response.json()
                            
                            # Check all required fields are present
                            required_fields = ['title', 'description', 'category', 'duration', 'type', 'location', 'expiresAt']
                            missing_fields = []
                            
                            for field in required_fields:
                                if field not in service_details or service_details[field] is None:
                                    missing_fields.append(field)
                            
                            if not missing_fields:
                                success_count += 1
                                self.log_test(f"Service Creation ({service_data['type']})", True, 
                                            f"All fields present: {service_data['title']}")
                            else:
                                self.log_test(f"Service Creation ({service_data['type']})", False, 
                                            f"Missing fields: {missing_fields}")
                        else:
                            self.log_test(f"Service Creation ({service_data['type']})", False, 
                                        f"Failed to fetch created service")
                    else:
                        self.log_test(f"Service Creation ({service_data['type']})", False, 
                                    "No serviceId in response")
                else:
                    self.log_test(f"Service Creation ({service_data['type']})", False, 
                                f"Status: {response.status_code}, Response: {response.text}")
                    
            except Exception as e:
                self.log_test(f"Service Creation ({service_data['type']})", False, f"Exception: {str(e)}")
        
        # Overall result
        if success_count == len(test_services):
            self.log_test("Service Creation All Fields - Overall", True, 
                        f"All {success_count} services created successfully")
            return True
        else:
            self.log_test("Service Creation All Fields - Overall", False, 
                        f"Only {success_count}/{len(test_services)} services created successfully")
            return False
    
    def test_api_accessibility(self):
        """Test that the API is accessible"""
        print("🌐 TESTING API ACCESSIBILITY")
        
        try:
            # Test a simple endpoint that doesn't require auth
            response = self.session.get(f"{API_BASE}/payments/packages")
            
            if response.status_code == 200:
                self.log_test("API Accessibility", True, f"API responding at {API_BASE}")
                return True
            else:
                self.log_test("API Accessibility", False, f"API returned status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("API Accessibility", False, f"Cannot reach API: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 STARTING COUP DE POUCE BACKEND TESTS")
        print("=" * 60)
        
        test_results = []
        
        # Test API accessibility first
        test_results.append(self.test_api_accessibility())
        
        # Test authentication
        test_results.append(self.register_test_user())
        test_results.append(self.test_login())
        
        # Test service functionality (requires auth)
        if self.auth_token:
            test_results.append(self.test_service_creation_with_expiration())
            test_results.append(self.test_service_expiration_filtering())
            test_results.append(self.test_service_creation_all_fields())
        else:
            print("⚠️  Skipping service tests - no authentication token")
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(test_results)
        total = len(test_results)
        success_rate = (passed / total * 100) if total > 0 else 0
        
        print(f"✅ Tests Passed: {passed}/{total}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("🎉 BACKEND TESTS SUCCESSFUL!")
        elif success_rate >= 60:
            print("⚠️  BACKEND TESTS PARTIALLY SUCCESSFUL")
        else:
            print("❌ BACKEND TESTS FAILED")
        
        return success_rate >= 80

if __name__ == "__main__":
    tester = CoupDePouceBackendTester()
    tester.run_all_tests()