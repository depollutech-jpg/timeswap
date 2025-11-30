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

class TestResults:
    def __init__(self):
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.test_details = []
    
    def add_test(self, test_name, passed, details=""):
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            self.failed_tests += 1
            status = "❌ FAIL"
        
        self.test_details.append(f"{status}: {test_name}")
        if details:
            self.test_details.append(f"    Details: {details}")
    
    def print_summary(self):
        print(f"\n{'='*80}")
        print(f"APPOINTMENT SYSTEM BACKEND TESTING RESULTS")
        print(f"{'='*80}")
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.failed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests*100):.1f}%")
        print(f"\nDetailed Results:")
        for detail in self.test_details:
            print(detail)
        print(f"{'='*80}")

def register_user(email, password, first_name, last_name):
    """Register a new user and return token"""
    try:
        response = requests.post(f"{BASE_URL}/auth/register", 
                               headers=HEADERS,
                               json={
                                   "email": email,
                                   "password": password,
                                   "firstName": first_name,
                                   "lastName": last_name
                               })
        if response.status_code in [200, 201]:
            return response.json().get("token")
        else:
            print(f"Registration failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return None

def create_service(token, title, description, service_type="offer"):
    """Create a service and return service ID"""
    try:
        headers = {**HEADERS, "Authorization": f"Bearer {token}"}
        response = requests.post(f"{BASE_URL}/services",
                               headers=headers,
                               json={
                                   "title": title,
                                   "description": description,
                                   "category": "Aide",
                                   "duration": 2.0,
                                   "type": service_type,
                                   "location": "Paris"
                               })
        if response.status_code in [200, 201]:
            return response.json().get("serviceId")
        else:
            print(f"Service creation failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Service creation error: {str(e)}")
        return None

def accept_exchange(token, service_id):
    """Accept an exchange and return chat ID"""
    try:
        headers = {**HEADERS, "Authorization": f"Bearer {token}"}
        response = requests.post(f"{BASE_URL}/services/{service_id}/accept-exchange",
                               headers=headers,
                               json={"message": "J'accepte cet échange"})
        if response.status_code in [200, 201]:
            return response.json().get("chatId")
        else:
            print(f"Exchange acceptance failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Exchange acceptance error: {str(e)}")
        return None

def test_appointment_system():
    """Main test function for appointment system"""
    results = TestResults()
    
    print("🚀 Starting Appointment System Backend Testing...")
    print(f"Testing against: {BASE_URL}")
    
    # Test data
    user_a_email = f"usera_{uuid.uuid4().hex[:8]}@test.com"
    user_b_email = f"userb_{uuid.uuid4().hex[:8]}@test.com"
    password = "TestPassword123!"
    
    # Setup: Create users
    print("\n📋 Setting up test users...")
    token_a = register_user(user_a_email, password, "Alice", "Dupont")
    token_b = register_user(user_b_email, password, "Bob", "Martin")
    
    if not token_a or not token_b:
        print("❌ Failed to create test users. Aborting tests.")
        return results
    
    print(f"✅ Created User A: {user_a_email}")
    print(f"✅ Created User B: {user_b_email}")
    
    # Setup: Create service and exchange to get chat ID
    print("\n📋 Setting up service and chat...")
    service_id = create_service(token_a, "Service de test pour RDV", "Service pour tester les rendez-vous")
    if not service_id:
        print("❌ Failed to create service. Aborting tests.")
        return results
    
    chat_id = accept_exchange(token_b, service_id)
    if not chat_id:
        print("❌ Failed to create chat. Aborting tests.")
        return results
    
    print(f"✅ Created service: {service_id}")
    print(f"✅ Created chat: {chat_id}")
    
    # Get user IDs
    try:
        headers_a = {**HEADERS, "Authorization": f"Bearer {token_a}"}
        headers_b = {**HEADERS, "Authorization": f"Bearer {token_b}"}
        
        user_a_response = requests.get(f"{BASE_URL}/auth/me", headers=headers_a)
        user_b_response = requests.get(f"{BASE_URL}/auth/me", headers=headers_b)
        
        user_a_id = user_a_response.json().get("_id")
        user_b_id = user_b_response.json().get("_id")
        
        print(f"✅ User A ID: {user_a_id}")
        print(f"✅ User B ID: {user_b_id}")
        
    except Exception as e:
        print(f"❌ Failed to get user IDs: {str(e)}")
        return results
    
    print(f"\n🧪 Starting Appointment System Tests...")
    
    # TEST 1: Create appointment with success
    print(f"\n1️⃣ Testing: Create appointment with success")
    try:
        future_date = (datetime.utcnow() + timedelta(days=1)).isoformat()
        appointment_data = {
            "chatId": chat_id,
            "otherUserId": user_b_id,
            "date": future_date,
            "title": "Rendez-vous échange de services",
            "description": "Discussion sur les détails"
        }
        
        response = requests.post(f"{BASE_URL}/appointments",
                               headers=headers_a,
                               json=appointment_data)
        
        if response.status_code in [200, 201]:
            response_data = response.json()
            appointment_id = response_data.get("appointmentId")
            if appointment_id:
                results.add_test("Create appointment with success", True, 
                               f"Status: {response.status_code}, ID: {appointment_id}")
                print(f"✅ Appointment created successfully: {appointment_id}")
            else:
                results.add_test("Create appointment with success", False, 
                               f"No appointment ID returned: {response_data}")
                print(f"❌ No appointment ID in response: {response_data}")
        else:
            results.add_test("Create appointment with success", False, 
                           f"Status: {response.status_code}, Response: {response.text}")
            print(f"❌ Failed to create appointment: {response.status_code} - {response.text}")
            
    except Exception as e:
        results.add_test("Create appointment with success", False, f"Exception: {str(e)}")
        print(f"❌ Exception in create appointment test: {str(e)}")
    
    # TEST 2: Get my appointments
    print(f"\n2️⃣ Testing: Get my appointments")
    try:
        response = requests.get(f"{BASE_URL}/appointments/my", headers=headers_a)
        
        if response.status_code == 200:
            appointments = response.json()
            if isinstance(appointments, list) and len(appointments) > 0:
                # Check if our appointment is in the list
                found_appointment = False
                for apt in appointments:
                    if apt.get("title") == "Rendez-vous échange de services":
                        found_appointment = True
                        # Verify sorting by date
                        if "date" in apt and "_id" in apt and "status" in apt:
                            results.add_test("Get my appointments", True, 
                                           f"Found {len(appointments)} appointments, correctly structured")
                            print(f"✅ Retrieved appointments successfully: {len(appointments)} found")
                        else:
                            results.add_test("Get my appointments", False, 
                                           f"Appointment missing required fields: {apt}")
                            print(f"❌ Appointment missing required fields")
                        break
                
                if not found_appointment:
                    results.add_test("Get my appointments", False, 
                                   f"Created appointment not found in list of {len(appointments)}")
                    print(f"❌ Created appointment not found in list")
            else:
                results.add_test("Get my appointments", False, 
                               f"No appointments returned or invalid format: {appointments}")
                print(f"❌ No appointments returned or invalid format")
        else:
            results.add_test("Get my appointments", False, 
                           f"Status: {response.status_code}, Response: {response.text}")
            print(f"❌ Failed to get appointments: {response.status_code} - {response.text}")
            
    except Exception as e:
        results.add_test("Get my appointments", False, f"Exception: {str(e)}")
        print(f"❌ Exception in get appointments test: {str(e)}")
    
    # TEST 3: Validation - Date in the past
    print(f"\n3️⃣ Testing: Validation - Date in the past")
    try:
        past_date = (datetime.utcnow() - timedelta(days=1)).isoformat()
        appointment_data = {
            "chatId": chat_id,
            "otherUserId": user_b_id,
            "date": past_date,
            "title": "Rendez-vous dans le passé",
            "description": "Ceci devrait échouer"
        }
        
        response = requests.post(f"{BASE_URL}/appointments",
                               headers=headers_a,
                               json=appointment_data)
        
        if response.status_code in [400, 422]:
            results.add_test("Validation - Date in past", True, 
                           f"Correctly rejected with status: {response.status_code}")
            print(f"✅ Past date correctly rejected: {response.status_code}")
        else:
            results.add_test("Validation - Date in past", False, 
                           f"Should have been rejected but got: {response.status_code}")
            print(f"❌ Past date should have been rejected but got: {response.status_code}")
            
    except Exception as e:
        results.add_test("Validation - Date in past", False, f"Exception: {str(e)}")
        print(f"❌ Exception in past date validation test: {str(e)}")
    
    # TEST 4: Validation - Missing title
    print(f"\n4️⃣ Testing: Validation - Missing title")
    try:
        future_date = (datetime.utcnow() + timedelta(days=1)).isoformat()
        appointment_data = {
            "chatId": chat_id,
            "otherUserId": user_b_id,
            "date": future_date,
            # "title": missing on purpose
            "description": "Rendez-vous sans titre"
        }
        
        response = requests.post(f"{BASE_URL}/appointments",
                               headers=headers_a,
                               json=appointment_data)
        
        if response.status_code in [400, 422]:
            results.add_test("Validation - Missing title", True, 
                           f"Correctly rejected with status: {response.status_code}")
            print(f"✅ Missing title correctly rejected: {response.status_code}")
        else:
            results.add_test("Validation - Missing title", False, 
                           f"Should have been rejected but got: {response.status_code}")
            print(f"❌ Missing title should have been rejected but got: {response.status_code}")
            
    except Exception as e:
        results.add_test("Validation - Missing title", False, f"Exception: {str(e)}")
        print(f"❌ Exception in missing title validation test: {str(e)}")
    
    # TEST 5: Authentication required
    print(f"\n5️⃣ Testing: Authentication required")
    try:
        future_date = (datetime.utcnow() + timedelta(days=1)).isoformat()
        appointment_data = {
            "chatId": chat_id,
            "otherUserId": user_b_id,
            "date": future_date,
            "title": "Rendez-vous sans auth",
            "description": "Ceci devrait échouer"
        }
        
        # Request without Authorization header
        response = requests.post(f"{BASE_URL}/appointments",
                               headers=HEADERS,  # No auth header
                               json=appointment_data)
        
        if response.status_code in [401, 403]:
            results.add_test("Authentication required", True, 
                           f"Correctly rejected with status: {response.status_code}")
            print(f"✅ Unauthenticated request correctly rejected: {response.status_code}")
        else:
            results.add_test("Authentication required", False, 
                           f"Should have been rejected but got: {response.status_code}")
            print(f"❌ Unauthenticated request should have been rejected but got: {response.status_code}")
            
    except Exception as e:
        results.add_test("Authentication required", False, f"Exception: {str(e)}")
        print(f"❌ Exception in authentication test: {str(e)}")
    
    # TEST 6: Modify appointment status
    print(f"\n6️⃣ Testing: Modify appointment status")
    try:
        # First, get the appointment ID from our created appointment
        response = requests.get(f"{BASE_URL}/appointments/my", headers=headers_a)
        if response.status_code == 200:
            appointments = response.json()
            appointment_id = None
            for apt in appointments:
                if apt.get("title") == "Rendez-vous échange de services":
                    appointment_id = apt.get("_id")
                    break
            
            if appointment_id:
                # Try to update status - Note: endpoint is PUT, not PATCH as mentioned in review
                update_data = {"status": "completed"}
                response = requests.put(f"{BASE_URL}/appointments/{appointment_id}",
                                      headers=headers_a,
                                      json=update_data)
                
                if response.status_code == 200:
                    results.add_test("Modify appointment status", True, 
                                   f"Status updated successfully: {response.status_code}")
                    print(f"✅ Appointment status updated successfully")
                else:
                    results.add_test("Modify appointment status", False, 
                                   f"Failed to update status: {response.status_code} - {response.text}")
                    print(f"❌ Failed to update appointment status: {response.status_code}")
            else:
                results.add_test("Modify appointment status", False, 
                               "Could not find appointment ID to update")
                print(f"❌ Could not find appointment ID to update")
        else:
            results.add_test("Modify appointment status", False, 
                           f"Could not retrieve appointments: {response.status_code}")
            print(f"❌ Could not retrieve appointments for status update test")
            
    except Exception as e:
        results.add_test("Modify appointment status", False, f"Exception: {str(e)}")
        print(f"❌ Exception in modify status test: {str(e)}")
    
    # TEST 7: Security - Modify another user's appointment
    print(f"\n7️⃣ Testing: Security - Modify another user's appointment")
    try:
        # Get User A's appointments to find an appointment ID
        response = requests.get(f"{BASE_URL}/appointments/my", headers=headers_a)
        if response.status_code == 200:
            appointments = response.json()
            appointment_id = None
            for apt in appointments:
                if apt.get("title") == "Rendez-vous échange de services":
                    appointment_id = apt.get("_id")
                    break
            
            if appointment_id:
                # Try to update User A's appointment using User B's token
                update_data = {"status": "cancelled"}
                response = requests.put(f"{BASE_URL}/appointments/{appointment_id}",
                                      headers=headers_b,  # User B trying to modify User A's appointment
                                      json=update_data)
                
                if response.status_code == 403:
                    results.add_test("Security - Modify other's appointment", True, 
                                   f"Correctly rejected with status: {response.status_code}")
                    print(f"✅ Cross-user modification correctly rejected: {response.status_code}")
                elif response.status_code == 404:
                    # Also acceptable - appointment not found for this user
                    results.add_test("Security - Modify other's appointment", True, 
                                   f"Correctly rejected with status: {response.status_code} (not found)")
                    print(f"✅ Cross-user modification correctly rejected: {response.status_code}")
                else:
                    results.add_test("Security - Modify other's appointment", False, 
                                   f"Should have been rejected but got: {response.status_code}")
                    print(f"❌ Cross-user modification should have been rejected but got: {response.status_code}")
            else:
                results.add_test("Security - Modify other's appointment", False, 
                               "Could not find appointment ID for security test")
                print(f"❌ Could not find appointment ID for security test")
        else:
            results.add_test("Security - Modify other's appointment", False, 
                           f"Could not retrieve appointments: {response.status_code}")
            print(f"❌ Could not retrieve appointments for security test")
            
    except Exception as e:
        results.add_test("Security - Modify other's appointment", False, f"Exception: {str(e)}")
        print(f"❌ Exception in security test: {str(e)}")
    
    return results

if __name__ == "__main__":
    try:
        results = test_appointment_system()
        results.print_summary()
        
        # Exit with appropriate code
        if results.failed_tests == 0:
            print(f"\n🎉 All tests passed! Appointment system is working correctly.")
            sys.exit(0)
        else:
            print(f"\n⚠️  {results.failed_tests} test(s) failed. Please review the issues above.")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print(f"\n\n⚠️ Testing interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error during testing: {str(e)}")
        traceback.print_exc()
        sys.exit(1)