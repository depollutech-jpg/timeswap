#!/usr/bin/env python3
"""
FOCUSED TEST for Appointment Date Validation Bug Fix
According to review request specifications
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import sys

BASE_URL = "https://servicetrade.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

def register_user(email, password, first_name, last_name):
    """Register a new user and return token and user_id"""
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
            data = response.json()
            return data.get("token"), data.get("user", {}).get("_id")
        else:
            print(f"Registration failed: {response.status_code} - {response.text}")
            return None, None
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return None, None

def create_service_and_chat(token_a, token_b, user_a_id, user_b_id):
    """Create service and chat for testing"""
    try:
        # Create service
        headers_a = {**HEADERS, "Authorization": f"Bearer {token_a}"}
        service_data = {
            "title": "Test Service for Appointment Validation",
            "description": "Service for testing date validation",
            "category": "Test",
            "duration": 1.0,
            "type": "offer",
            "location": "Test Location"
        }
        
        response = requests.post(f"{BASE_URL}/services", headers=headers_a, json=service_data)
        if response.status_code not in [200, 201]:
            print(f"Service creation failed: {response.status_code}")
            return None
            
        service_id = response.json().get("serviceId")
        
        # Accept exchange to create chat
        headers_b = {**HEADERS, "Authorization": f"Bearer {token_b}"}
        response = requests.post(f"{BASE_URL}/services/{service_id}/accept-exchange",
                               headers=headers_b,
                               json={"message": "Test exchange"})
        
        if response.status_code not in [200, 201]:
            print(f"Exchange acceptance failed: {response.status_code}")
            return None
            
        return response.json().get("chatId")
        
    except Exception as e:
        print(f"Setup error: {str(e)}")
        return None

def test_appointment_validation():
    """Main test function focusing on validation"""
    print("🚀 FOCUSED APPOINTMENT VALIDATION TESTING")
    print("=" * 60)
    
    # Setup users
    print("\n🔧 Setting up test environment...")
    user_a_email = f"validation_test_a_{uuid.uuid4().hex[:8]}@test.com"
    user_b_email = f"validation_test_b_{uuid.uuid4().hex[:8]}@test.com"
    
    token_a, user_a_id = register_user(user_a_email, "TestPass123!", "Alice", "Validation")
    token_b, user_b_id = register_user(user_b_email, "TestPass123!", "Bob", "Test")
    
    if not token_a or not token_b:
        print("❌ Failed to create users")
        return False
        
    print(f"✅ Users created: {user_a_email}, {user_b_email}")
    
    # Create chat
    chat_id = create_service_and_chat(token_a, token_b, user_a_id, user_b_id)
    if not chat_id:
        print("❌ Failed to create chat")
        return False
        
    print(f"✅ Chat created: {chat_id}")
    
    headers_a = {**HEADERS, "Authorization": f"Bearer {token_a}"}
    
    # TEST 1 (CRITICAL): Date dans le passé
    print("\n🧪 TEST 1 (CRITIQUE): Validation - Date dans le passé")
    yesterday = datetime.utcnow() - timedelta(days=1)
    past_date = yesterday.isoformat() + "Z"
    
    appointment_data = {
        "chatId": chat_id,
        "otherUserId": user_b_id,
        "date": past_date,
        "title": "Rendez-vous hier",
        "description": "Ce RDV devrait être rejeté"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/appointments", headers=headers_a, json=appointment_data)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 400:
            try:
                error_data = response.json()
                error_message = error_data.get("detail", "")
                print(f"   Error Message: {error_message}")
                
                if "futur" in error_message.lower():
                    print("✅ TEST 1 PASSED: Date validation working correctly")
                    test1_passed = True
                else:
                    print("❌ TEST 1 FAILED: Wrong error message")
                    test1_passed = False
            except:
                print("❌ TEST 1 FAILED: Invalid JSON response")
                test1_passed = False
        else:
            print("❌ TEST 1 FAILED: Past date was accepted (should be rejected with 400)")
            test1_passed = False
            
    except Exception as e:
        print(f"❌ TEST 1 ERROR: {str(e)}")
        test1_passed = False
    
    # TEST 2: Format de date invalide
    print("\n🧪 TEST 2: Validation - Format de date invalide")
    appointment_data = {
        "chatId": chat_id,
        "otherUserId": user_b_id,
        "date": "invalid-date-format",
        "title": "Test format invalide",
        "description": "Test format"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/appointments", headers=headers_a, json=appointment_data)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 400:
            try:
                error_data = response.json()
                error_message = error_data.get("detail", "")
                print(f"   Error Message: {error_message}")
                
                if "format" in error_message.lower() and "invalide" in error_message.lower():
                    print("✅ TEST 2 PASSED: Date format validation working")
                    test2_passed = True
                else:
                    print("❌ TEST 2 FAILED: Wrong error message")
                    test2_passed = False
            except:
                print("❌ TEST 2 FAILED: Invalid JSON response")
                test2_passed = False
        else:
            print("❌ TEST 2 FAILED: Invalid date format was accepted")
            test2_passed = False
            
    except Exception as e:
        print(f"❌ TEST 2 ERROR: {str(e)}")
        test2_passed = False
    
    # TEST 3: Titre vide
    print("\n🧪 TEST 3: Validation - Titre vide")
    future_date = (datetime.utcnow() + timedelta(days=1)).isoformat() + "Z"
    appointment_data = {
        "chatId": chat_id,
        "otherUserId": user_b_id,
        "date": future_date,
        "title": "",  # Empty title
        "description": "Test titre vide"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/appointments", headers=headers_a, json=appointment_data)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 400:
            try:
                error_data = response.json()
                error_message = error_data.get("detail", "")
                print(f"   Error Message: {error_message}")
                
                if "titre" in error_message.lower() and "obligatoire" in error_message.lower():
                    print("✅ TEST 3 PASSED: Title validation working")
                    test3_passed = True
                else:
                    print("❌ TEST 3 FAILED: Wrong error message")
                    test3_passed = False
            except:
                print("❌ TEST 3 FAILED: Invalid JSON response")
                test3_passed = False
        else:
            print("❌ TEST 3 FAILED: Empty title was accepted")
            test3_passed = False
            
    except Exception as e:
        print(f"❌ TEST 3 ERROR: {str(e)}")
        test3_passed = False
    
    # TEST 4: Rendez-vous valide (date future)
    print("\n🧪 TEST 4: Créer un rendez-vous valide (date future)")
    future_date = (datetime.utcnow() + timedelta(days=1)).isoformat() + "Z"
    appointment_data = {
        "chatId": chat_id,
        "otherUserId": user_b_id,
        "date": future_date,
        "title": "Rendez-vous valide demain",
        "description": "Ce RDV devrait être créé"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/appointments", headers=headers_a, json=appointment_data)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code in [200, 201]:
            try:
                data = response.json()
                appointment_id = data.get("appointmentId")
                if appointment_id:
                    print(f"✅ TEST 4 PASSED: Valid appointment created with ID: {appointment_id}")
                    test4_passed = True
                else:
                    print("❌ TEST 4 FAILED: No appointment ID returned")
                    test4_passed = False
            except:
                print("❌ TEST 4 FAILED: Invalid JSON response")
                test4_passed = False
        else:
            print("❌ TEST 4 FAILED: Valid appointment was rejected")
            test4_passed = False
            
    except Exception as e:
        print(f"❌ TEST 4 ERROR: {str(e)}")
        test4_passed = False
    
    # TEST 5: Récupérer mes rendez-vous
    print("\n🧪 TEST 5: Récupérer mes rendez-vous")
    try:
        response = requests.get(f"{BASE_URL}/appointments/my", headers=headers_a)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                appointments = response.json()
                if isinstance(appointments, list):
                    print(f"   Found {len(appointments)} appointments")
                    if len(appointments) > 0:
                        # Check structure
                        apt = appointments[0]
                        required_fields = ["_id", "date", "title", "status"]
                        missing = [f for f in required_fields if f not in apt]
                        if not missing:
                            print("✅ TEST 5 PASSED: Get appointments working correctly")
                            test5_passed = True
                        else:
                            print(f"❌ TEST 5 FAILED: Missing fields: {missing}")
                            test5_passed = False
                    else:
                        print("✅ TEST 5 PASSED: No appointments (empty list)")
                        test5_passed = True
                else:
                    print("❌ TEST 5 FAILED: Response is not a list")
                    test5_passed = False
            except:
                print("❌ TEST 5 FAILED: Invalid JSON response")
                test5_passed = False
        else:
            print("❌ TEST 5 FAILED: Request failed")
            test5_passed = False
            
    except Exception as e:
        print(f"❌ TEST 5 ERROR: {str(e)}")
        test5_passed = False
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 VALIDATION TEST SUMMARY")
    print("=" * 60)
    
    tests = [
        ("Date dans le passé (CRITIQUE)", test1_passed),
        ("Format de date invalide", test2_passed),
        ("Titre vide", test3_passed),
        ("Rendez-vous valide", test4_passed),
        ("Récupérer mes rendez-vous", test5_passed)
    ]
    
    passed = sum(1 for _, result in tests if result)
    total = len(tests)
    
    print(f"Tests passés: {passed}/{total} ({(passed/total)*100:.1f}%)")
    print()
    
    for test_name, result in tests:
        status = "✅" if result else "❌"
        print(f"{status} {test_name}")
    
    print("\n🎯 CRITICAL BUG STATUS:")
    if test1_passed:
        print("✅ DATE VALIDATION BUG FIXED - Past dates correctly rejected")
    else:
        print("❌ DATE VALIDATION BUG STILL EXISTS - Past dates accepted")
    
    print("=" * 60)
    
    return passed == total

if __name__ == "__main__":
    success = test_appointment_validation()
    sys.exit(0 if success else 1)