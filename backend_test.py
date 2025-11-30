#!/usr/bin/env python3
"""
Backend Testing Suite for Coup de Pouce - Appointment System
Tests all appointment endpoints according to the review request specifications.
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import sys
import traceback

# Configuration
BASE_URL = "https://servicexchange.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

print(f"🔗 Testing Appointment System at: {BASE_URL}")

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

def create_test_user(email_suffix=""):
    """Create a test user and return user data with token"""
    user_data = {
        "email": f"testuser{email_suffix}_{uuid.uuid4().hex[:8]}@example.com",
        "password": "TestPassword123!",
        "firstName": "Test",
        "lastName": f"User{email_suffix}"
    }
    
    try:
        response = requests.post(f"{API_BASE}/auth/register", json=user_data, headers=HEADERS)
        if response.status_code == 200:
            data = response.json()
            return {
                "user_id": data["user"]["_id"],
                "token": data["token"],
                "email": user_data["email"]
            }
        else:
            print(f"Failed to create user: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        return None

def create_test_service(token, title="Service de test"):
    """Create a test service and return service ID"""
    service_data = {
        "title": title,
        "description": "Service créé pour les tests de suppression",
        "category": "Aide ménagère",
        "duration": 2.0,
        "type": "offer",
        "location": "Paris, France"
    }
    
    headers = {**HEADERS, "Authorization": f"Bearer {token}"}
    
    try:
        response = requests.post(f"{API_BASE}/services", json=service_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            return data.get("serviceId")
        else:
            print(f"Failed to create service: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error creating service: {str(e)}")
        return None
def test_successful_deletion():
    """Test 1: Successful service deletion"""
    results = TestResults()
    
    print("\n🧪 TEST 1: SUCCESSFUL SERVICE DELETION")
    print("-" * 50)
    
    # Create user and service
    user = create_test_user("_deletion")
    if not user:
        results.add_result("Create test user", False, "Failed to create user")
        return results
    
    results.add_result("Create test user", True, f"User created: {user['email']}")
    
    service_id = create_test_service(user["token"], "Service à supprimer")
    if not service_id:
        results.add_result("Create test service", False, "Failed to create service")
        return results
    
    results.add_result("Create test service", True, f"Service created: {service_id}")
    
    # Verify service exists before deletion
    headers = {**HEADERS, "Authorization": f"Bearer {user['token']}"}
    try:
        response = requests.get(f"{API_BASE}/services/{service_id}", headers=headers)
        if response.status_code == 200:
            results.add_result("Verify service exists", True, "Service found before deletion")
        else:
            results.add_result("Verify service exists", False, f"Service not found: {response.status_code}")
            return results
    except Exception as e:
        results.add_result("Verify service exists", False, f"Error: {str(e)}")
        return results
    
    # Delete the service
    try:
        response = requests.delete(f"{API_BASE}/services/{service_id}", headers=headers)
        
        if response.status_code in [200, 204]:
            results.add_result("DELETE request status", True, f"Status: {response.status_code}")
            
            # Verify service is deleted (should return 404 or be marked as deleted)
            check_response = requests.get(f"{API_BASE}/services/{service_id}", headers=headers)
            if check_response.status_code == 404:
                results.add_result("Service deleted from database", True, "Service not found after deletion")
            elif check_response.status_code == 200:
                service_data = check_response.json()
                if service_data.get("status") == "deleted":
                    results.add_result("Service soft deleted", True, "Service marked as deleted")
                else:
                    results.add_result("Service deletion verification", False, f"Service still active: {service_data.get('status')}")
            else:
                results.add_result("Service deletion verification", False, f"Unexpected status: {check_response.status_code}")
            
            # Verify service doesn't appear in GET /api/services
            try:
                services_response = requests.get(f"{API_BASE}/services", headers=headers)
                if services_response.status_code == 200:
                    services = services_response.json()
                    service_found = any(s.get("_id") == service_id for s in services)
                    if not service_found:
                        results.add_result("Service filtered from list", True, "Service not in active services list")
                    else:
                        results.add_result("Service filtered from list", False, "Service still appears in active list")
                else:
                    results.add_result("Check services list", False, f"Failed to get services: {services_response.status_code}")
            except Exception as e:
                results.add_result("Check services list", False, f"Error: {str(e)}")
                
        else:
            results.add_result("DELETE request status", False, f"Status: {response.status_code} - {response.text}")
            
    except Exception as e:
        results.add_result("DELETE request", False, f"Error: {str(e)}")
    
    return results
def test_security_other_user_service():
    """Test 2: Security - Try to delete another user's service"""
    results = TestResults()
    
    print("\n🧪 TEST 2: SECURITY - DELETE OTHER USER'S SERVICE")
    print("-" * 50)
    
    # Create User A and their service
    user_a = create_test_user("_a")
    if not user_a:
        results.add_result("Create User A", False, "Failed to create User A")
        return results
    
    results.add_result("Create User A", True, f"User A created: {user_a['email']}")
    
    service_id = create_test_service(user_a["token"], "Service de User A")
    if not service_id:
        results.add_result("Create User A's service", False, "Failed to create service")
        return results
    
    results.add_result("Create User A's service", True, f"Service created: {service_id}")
    
    # Create User B
    user_b = create_test_user("_b")
    if not user_b:
        results.add_result("Create User B", False, "Failed to create User B")
        return results
    
    results.add_result("Create User B", True, f"User B created: {user_b['email']}")
    
    # User B tries to delete User A's service
    headers_b = {**HEADERS, "Authorization": f"Bearer {user_b['token']}"}
    
    try:
        response = requests.delete(f"{API_BASE}/services/{service_id}", headers=headers_b)
        
        if response.status_code == 403:
            results.add_result("Security check - 403 Forbidden", True, "Correctly rejected unauthorized deletion")
            
            # Verify service still exists
            headers_a = {**HEADERS, "Authorization": f"Bearer {user_a['token']}"}
            check_response = requests.get(f"{API_BASE}/services/{service_id}", headers=headers_a)
            if check_response.status_code == 200:
                service_data = check_response.json()
                if service_data.get("status") != "deleted":
                    results.add_result("Service still exists", True, "Service was not deleted by unauthorized user")
                else:
                    results.add_result("Service still exists", False, "Service was incorrectly deleted")
            else:
                results.add_result("Service still exists", False, f"Cannot verify service existence: {check_response.status_code}")
                
        else:
            results.add_result("Security check - 403 Forbidden", False, f"Expected 403, got {response.status_code} - {response.text}")
            
    except Exception as e:
        results.add_result("Security test", False, f"Error: {str(e)}")
    
    return results
def test_authentication_required():
    """Test 3: Authentication required - no JWT token"""
    results = TestResults()
    
    print("\n🧪 TEST 3: AUTHENTICATION REQUIRED")
    print("-" * 50)
    
    # Create a service first (need valid user for this)
    user = create_test_user("_auth")
    if not user:
        results.add_result("Create test user", False, "Failed to create user")
        return results
    
    service_id = create_test_service(user["token"], "Service pour test auth")
    if not service_id:
        results.add_result("Create test service", False, "Failed to create service")
        return results
    
    results.add_result("Setup test service", True, f"Service created: {service_id}")
    
    # Try to delete without authentication
    try:
        response = requests.delete(f"{API_BASE}/services/{service_id}", headers=HEADERS)
        
        if response.status_code in [401, 403]:
            results.add_result("Authentication required", True, f"Correctly rejected unauthenticated request: {response.status_code}")
        else:
            results.add_result("Authentication required", False, f"Expected 401/403, got {response.status_code} - {response.text}")
            
    except Exception as e:
        results.add_result("Authentication test", False, f"Error: {str(e)}")
    
    return results
def test_nonexistent_service():
    """Test 4: Try to delete non-existent service"""
    results = TestResults()
    
    print("\n🧪 TEST 4: DELETE NON-EXISTENT SERVICE")
    print("-" * 50)
    
    # Create user for authentication
    user = create_test_user("_nonexistent")
    if not user:
        results.add_result("Create test user", False, "Failed to create user")
        return results
    
    results.add_result("Create test user", True, f"User created: {user['email']}")
    
    # Try to delete non-existent service
    fake_service_id = str(uuid.uuid4())
    headers = {**HEADERS, "Authorization": f"Bearer {user['token']}"}
    
    try:
        response = requests.delete(f"{API_BASE}/services/{fake_service_id}", headers=headers)
        
        if response.status_code == 404:
            results.add_result("404 Not Found", True, "Correctly returned 404 for non-existent service")
        else:
            results.add_result("404 Not Found", False, f"Expected 404, got {response.status_code} - {response.text}")
            
    except Exception as e:
        results.add_result("Non-existent service test", False, f"Error: {str(e)}")
    
    return results

def main():
    """Run all tests for DELETE service endpoint"""
    print("🚀 STARTING BACKEND TESTS FOR DELETE SERVICE ENDPOINT")
    print("=" * 60)
    print("Testing DELETE /api/services/{service_id}")
    print("Base URL:", API_BASE)
    print("=" * 60)
    
    all_results = TestResults()
    
    # Run all test scenarios
    test_scenarios = [
        ("Successful Deletion", test_successful_deletion),
        ("Security - Other User Service", test_security_other_user_service),
        ("Authentication Required", test_authentication_required),
        ("Non-existent Service", test_nonexistent_service)
    ]
    
    for scenario_name, test_func in test_scenarios:
        try:
            scenario_results = test_func()
            
            # Merge results
            all_results.total_tests += scenario_results.total_tests
            all_results.passed_tests += scenario_results.passed_tests
            all_results.failed_tests += scenario_results.failed_tests
            all_results.results.extend(scenario_results.results)
            
        except Exception as e:
            print(f"\n❌ ERROR in {scenario_name}: {str(e)}")
            all_results.total_tests += 1
            all_results.failed_tests += 1
            all_results.results.append(f"❌ FAIL: {scenario_name} - Exception: {str(e)}")
    
    # Print final summary
    all_results.print_summary()
    
    # Return exit code based on results
    return 0 if all_results.failed_tests == 0 else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)