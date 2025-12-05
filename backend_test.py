#!/usr/bin/env python3
"""
Test complet du système de rendez-vous - Acceptation/Refus
Selon la review request pour l'application Coup de Pouce

TESTS PRIORITAIRES (NOUVEAUX ENDPOINTS):
1. POST /api/appointments/{appointment_id}/accept (NOUVEAU - PRIORITAIRE)
2. POST /api/appointments/{appointment_id}/reject (NOUVEAU - PRIORITAIRE)
3. Tests de validation (double acceptation/refus, authentification)
4. Flux complet end-to-end
5. Tests de régression des anciens endpoints

Focus: Tester les nouveaux endpoints d'acceptation et de refus des rendez-vous
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import sys
import traceback

# Configuration
BASE_URL = "https://servicetrade.preview.emergentagent.com/api"
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
    """Main test function for appointment system - Focus on Accept/Reject endpoints"""
    results = TestResults()
    
    print("🚀 TEST DU SYSTÈME DE RENDEZ-VOUS COMPLET - ACCEPTATION/REFUS")
    print("=" * 70)
    print(f"Testing against: {BASE_URL}")
    
    # Test data
    user_a_email = f"marie_{uuid.uuid4().hex[:8]}@test.com"
    user_b_email = f"pierre_{uuid.uuid4().hex[:8]}@test.com"
    password = "TestPassword123!"
    
    # Setup: Create users
    print("\n🔧 CRÉATION DES UTILISATEURS DE TEST...")
    token_a = register_user(user_a_email, password, "Marie", "Dupont")
    token_b = register_user(user_b_email, password, "Pierre", "Martin")
    
    if not token_a or not token_b:
        print("❌ Failed to create test users. Aborting tests.")
        return results
    
    print(f"✅ Created User A (Marie): {user_a_email}")
    print(f"✅ Created User B (Pierre): {user_b_email}")
    
    # Setup: Create service and exchange to get chat ID
    print("\n🔧 CONFIGURATION INITIALE...")
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
    
    # Store appointment IDs for later tests
    appointment_for_accept = None
    appointment_for_reject = None
    
    print(f"\n🎯 TESTS PRIORITAIRES - NOUVEAUX ENDPOINTS ACCEPT/REJECT")
    print("=" * 70)
    
    # TEST 1: Create appointment for acceptance test
    print(f"\n1️⃣ PRÉPARATION: Créer rendez-vous pour test d'acceptation")
    try:
        future_date = (datetime.utcnow() + timedelta(days=1)).replace(hour=14, minute=0, second=0, microsecond=0).isoformat()
        appointment_data = {
            "chatId": chat_id,
            "otherUserId": user_b_id,
            "date": future_date,
            "title": "Réunion de travail importante",
            "description": "Discussion sur le projet Coup de Pouce"
        }
        
        response = requests.post(f"{BASE_URL}/appointments", headers=headers_a, json=appointment_data)
        
        if response.status_code in [200, 201]:
            response_data = response.json()
            appointment_for_accept = response_data.get("appointmentId")
            results.add_test("Création RDV pour acceptation", True, f"ID: {appointment_for_accept}")
            print(f"✅ Rendez-vous créé pour test d'acceptation: {appointment_for_accept}")
        else:
            results.add_test("Création RDV pour acceptation", False, f"Status: {response.status_code}")
            print(f"❌ Échec création RDV: {response.status_code} - {response.text}")
            
    except Exception as e:
        results.add_test("Création RDV pour acceptation", False, f"Exception: {str(e)}")
        print(f"❌ Exception: {str(e)}")
    
    # TEST 2: POST /api/appointments/{appointment_id}/accept (PRIORITAIRE)
    print(f"\n2️⃣ TEST PRIORITAIRE: POST /api/appointments/{{id}}/accept")
    if appointment_for_accept:
        try:
            # B accepte le rendez-vous créé par A
            response = requests.post(f"{BASE_URL}/appointments/{appointment_for_accept}/accept", headers=headers_b)
            
            if response.status_code == 200:
                # Vérifier que le statut a changé à "scheduled"
                check_response = requests.get(f"{BASE_URL}/appointments/my", headers=headers_b)
                if check_response.status_code == 200:
                    appointments = check_response.json()
                    accepted_apt = next((apt for apt in appointments if apt["_id"] == appointment_for_accept), None)
                    
                    if accepted_apt and accepted_apt["status"] == "scheduled":
                        results.add_test("Accept endpoint - Status change", True, "Status passé à 'scheduled'")
                        print(f"✅ Status correctement passé à 'scheduled'")
                        
                        # Vérifier les notifications pour A
                        notif_response = requests.get(f"{BASE_URL}/notifications", headers=headers_a)
                        if notif_response.status_code == 200:
                            notifications = notif_response.json()
                            accept_notif = next((n for n in notifications if n.get("type") == "appointment_accepted"), None)
                            if accept_notif:
                                results.add_test("Accept endpoint - Notification", True, "Notification créée pour A")
                                print(f"✅ Notification d'acceptation créée pour le créateur")
                            else:
                                results.add_test("Accept endpoint - Notification", False, "Notification manquante")
                                print(f"❌ Notification d'acceptation manquante")
                    else:
                        results.add_test("Accept endpoint - Status change", False, f"Status incorrect: {accepted_apt.get('status') if accepted_apt else 'RDV non trouvé'}")
                        print(f"❌ Status incorrect après acceptation")
            else:
                results.add_test("Accept endpoint", False, f"Status: {response.status_code}, Response: {response.text}")
                print(f"❌ Échec acceptation: {response.status_code} - {response.text}")
                
        except Exception as e:
            results.add_test("Accept endpoint", False, f"Exception: {str(e)}")
            print(f"❌ Exception lors de l'acceptation: {str(e)}")
    else:
        results.add_test("Accept endpoint", False, "Pas de RDV à accepter")
        print(f"❌ Pas de rendez-vous disponible pour le test d'acceptation")
    
    # TEST 3: Create appointment for rejection test
    print(f"\n3️⃣ PRÉPARATION: Créer rendez-vous pour test de refus")
    try:
        future_date = (datetime.utcnow() + timedelta(days=2)).replace(hour=10, minute=0, second=0, microsecond=0).isoformat()
        appointment_data = {
            "chatId": chat_id,
            "otherUserId": user_b_id,
            "date": future_date,
            "title": "Rendez-vous à refuser",
            "description": "Test de refus de rendez-vous"
        }
        
        response = requests.post(f"{BASE_URL}/appointments", headers=headers_a, json=appointment_data)
        
        if response.status_code in [200, 201]:
            response_data = response.json()
            appointment_for_reject = response_data.get("appointmentId")
            results.add_test("Création RDV pour refus", True, f"ID: {appointment_for_reject}")
            print(f"✅ Rendez-vous créé pour test de refus: {appointment_for_reject}")
        else:
            results.add_test("Création RDV pour refus", False, f"Status: {response.status_code}")
            print(f"❌ Échec création RDV: {response.status_code} - {response.text}")
            
    except Exception as e:
        results.add_test("Création RDV pour refus", False, f"Exception: {str(e)}")
        print(f"❌ Exception: {str(e)}")
    
    # TEST 4: POST /api/appointments/{appointment_id}/reject (PRIORITAIRE)
    print(f"\n4️⃣ TEST PRIORITAIRE: POST /api/appointments/{{id}}/reject")
    if appointment_for_reject:
        try:
            # B refuse le rendez-vous créé par A
            response = requests.post(f"{BASE_URL}/appointments/{appointment_for_reject}/reject", headers=headers_b)
            
            if response.status_code == 200:
                # Vérifier que le statut a changé à "rejected"
                check_response = requests.get(f"{BASE_URL}/appointments/my", headers=headers_b)
                if check_response.status_code == 200:
                    appointments = check_response.json()
                    rejected_apt = next((apt for apt in appointments if apt["_id"] == appointment_for_reject), None)
                    
                    if rejected_apt and rejected_apt["status"] == "rejected":
                        results.add_test("Reject endpoint - Status change", True, "Status passé à 'rejected'")
                        print(f"✅ Status correctement passé à 'rejected'")
                        
                        # Vérifier les notifications pour A
                        notif_response = requests.get(f"{BASE_URL}/notifications", headers=headers_a)
                        if notif_response.status_code == 200:
                            notifications = notif_response.json()
                            reject_notif = next((n for n in notifications if n.get("type") == "appointment_rejected"), None)
                            if reject_notif:
                                results.add_test("Reject endpoint - Notification", True, "Notification créée pour A")
                                print(f"✅ Notification de refus créée pour le créateur")
                            else:
                                results.add_test("Reject endpoint - Notification", False, "Notification manquante")
                                print(f"❌ Notification de refus manquante")
                    else:
                        results.add_test("Reject endpoint - Status change", False, f"Status incorrect: {rejected_apt.get('status') if rejected_apt else 'RDV non trouvé'}")
                        print(f"❌ Status incorrect après refus")
            else:
                results.add_test("Reject endpoint", False, f"Status: {response.status_code}, Response: {response.text}")
                print(f"❌ Échec refus: {response.status_code} - {response.text}")
                
        except Exception as e:
            results.add_test("Reject endpoint", False, f"Exception: {str(e)}")
            print(f"❌ Exception lors du refus: {str(e)}")
    else:
        results.add_test("Reject endpoint", False, "Pas de RDV à refuser")
        print(f"❌ Pas de rendez-vous disponible pour le test de refus")
    
    print(f"\n🔍 TESTS DE VALIDATION")
    print("=" * 50)
    
    # TEST 5: Validation - Double acceptation
    print(f"\n5️⃣ VALIDATION: Tentative de double acceptation")
    if appointment_for_accept:
        try:
            # Tenter d'accepter à nouveau le même rendez-vous
            response = requests.post(f"{BASE_URL}/appointments/{appointment_for_accept}/accept", headers=headers_b)
            
            if response.status_code == 400:
                results.add_test("Validation - Double acceptation", True, "Double acceptation correctement rejetée")
                print(f"✅ Double acceptation correctement rejetée (400)")
            else:
                results.add_test("Validation - Double acceptation", False, f"Status: {response.status_code} (attendu: 400)")
                print(f"❌ Double acceptation devrait être rejetée: {response.status_code}")
                
        except Exception as e:
            results.add_test("Validation - Double acceptation", False, f"Exception: {str(e)}")
            print(f"❌ Exception: {str(e)}")
    
    # TEST 6: Validation - Authentification requise
    print(f"\n6️⃣ VALIDATION: Authentification requise")
    if appointment_for_reject:
        try:
            # Tenter d'accepter sans token
            response = requests.post(f"{BASE_URL}/appointments/{appointment_for_reject}/accept", headers=HEADERS)
            
            if response.status_code in [401, 403]:
                results.add_test("Validation - Auth requise", True, f"Auth correctement requise ({response.status_code})")
                print(f"✅ Authentification correctement requise: {response.status_code}")
            else:
                results.add_test("Validation - Auth requise", False, f"Status: {response.status_code} (attendu: 401/403)")
                print(f"❌ Authentification devrait être requise: {response.status_code}")
                
        except Exception as e:
            results.add_test("Validation - Auth requise", False, f"Exception: {str(e)}")
            print(f"❌ Exception: {str(e)}")
    
    # TEST 7: Validation - RDV inexistant
    print(f"\n7️⃣ VALIDATION: Rendez-vous inexistant")
    try:
        fake_id = str(uuid.uuid4())
        response = requests.post(f"{BASE_URL}/appointments/{fake_id}/accept", headers=headers_b)
        
        if response.status_code == 404:
            results.add_test("Validation - RDV inexistant", True, "404 pour RDV inexistant")
            print(f"✅ RDV inexistant correctement géré: 404")
        else:
            results.add_test("Validation - RDV inexistant", False, f"Status: {response.status_code} (attendu: 404)")
            print(f"❌ RDV inexistant devrait retourner 404: {response.status_code}")
            
    except Exception as e:
        results.add_test("Validation - RDV inexistant", False, f"Exception: {str(e)}")
        print(f"❌ Exception: {str(e)}")
    
    print(f"\n🔄 FLUX COMPLET END-TO-END")
    print("=" * 50)
    
    # TEST 8: Flux complet E2E
    print(f"\n8️⃣ FLUX COMPLET: A crée → B accepte → Vérifications")
    try:
        # A crée un nouveau rendez-vous
        future_date = (datetime.utcnow() + timedelta(days=3)).replace(hour=16, minute=30, second=0, microsecond=0).isoformat()
        appointment_data = {
            "chatId": chat_id,
            "otherUserId": user_b_id,
            "date": future_date,
            "title": "Consultation médicale",
            "description": "Rendez-vous chez le médecin"
        }
        
        create_response = requests.post(f"{BASE_URL}/appointments", headers=headers_a, json=appointment_data)
        
        if create_response.status_code in [200, 201]:
            e2e_appointment_id = create_response.json().get("appointmentId")
            results.add_test("E2E - Création", True, "A crée RDV avec B")
            print(f"✅ A crée un rendez-vous avec B: {e2e_appointment_id}")
            
            # B accepte le rendez-vous
            accept_response = requests.post(f"{BASE_URL}/appointments/{e2e_appointment_id}/accept", headers=headers_b)
            
            if accept_response.status_code == 200:
                results.add_test("E2E - Acceptation", True, "B accepte le RDV")
                print(f"✅ B accepte le rendez-vous")
                
                # Vérifier que A reçoit une notification
                notif_response = requests.get(f"{BASE_URL}/notifications", headers=headers_a)
                if notif_response.status_code == 200:
                    notifications = notif_response.json()
                    accept_notif = next((n for n in notifications if n.get("type") == "appointment_accepted"), None)
                    if accept_notif:
                        results.add_test("E2E - Notification A", True, "A reçoit notification")
                        print(f"✅ A reçoit une notification d'acceptation")
                    else:
                        results.add_test("E2E - Notification A", False, "Notification manquante")
                        print(f"❌ Notification pour A manquante")
                
                # Vérifier que le RDV apparaît avec status="scheduled" pour A et B
                for user_headers, user_name in [(headers_a, "A"), (headers_b, "B")]:
                    my_appointments = requests.get(f"{BASE_URL}/appointments/my", headers=user_headers)
                    if my_appointments.status_code == 200:
                        appointments = my_appointments.json()
                        scheduled_apt = next((apt for apt in appointments if apt["_id"] == e2e_appointment_id and apt["status"] == "scheduled"), None)
                        if scheduled_apt:
                            results.add_test(f"E2E - Status {user_name}", True, f"RDV visible pour {user_name} avec status='scheduled'")
                            print(f"✅ RDV visible pour {user_name} avec status='scheduled'")
                        else:
                            results.add_test(f"E2E - Status {user_name}", False, f"RDV non trouvé ou status incorrect pour {user_name}")
                            print(f"❌ RDV non trouvé ou status incorrect pour {user_name}")
            else:
                results.add_test("E2E - Acceptation", False, f"Status: {accept_response.status_code}")
                print(f"❌ Échec acceptation E2E: {accept_response.status_code}")
        else:
            results.add_test("E2E - Création", False, f"Status: {create_response.status_code}")
            print(f"❌ Échec création E2E: {create_response.status_code}")
            
    except Exception as e:
        results.add_test("E2E Flow", False, f"Exception: {str(e)}")
        print(f"❌ Exception E2E: {str(e)}")
    
    print(f"\n🔄 TESTS DE RÉGRESSION")
    print("=" * 50)
    
    # TEST 9: Régression - POST /api/appointments
    print(f"\n9️⃣ RÉGRESSION: POST /api/appointments")
    try:
        future_date = (datetime.utcnow() + timedelta(days=1)).isoformat()
        appointment_data = {
            "chatId": chat_id,
            "otherUserId": user_b_id,
            "date": future_date,
            "title": "Test régression création",
            "description": "Vérification que la création fonctionne toujours"
        }
        
        response = requests.post(f"{BASE_URL}/appointments", headers=headers_a, json=appointment_data)
        
        if response.status_code in [200, 201]:
            results.add_test("Régression - POST appointments", True, "Création fonctionne")
            print(f"✅ POST /api/appointments fonctionne")
        else:
            results.add_test("Régression - POST appointments", False, f"Status: {response.status_code}")
            print(f"❌ POST /api/appointments échoue: {response.status_code}")
            
    except Exception as e:
        results.add_test("Régression - POST appointments", False, f"Exception: {str(e)}")
        print(f"❌ Exception: {str(e)}")
    
    # TEST 10: Régression - GET /api/appointments/my
    print(f"\n🔟 RÉGRESSION: GET /api/appointments/my")
    try:
        response = requests.get(f"{BASE_URL}/appointments/my", headers=headers_a)
        
        if response.status_code == 200:
            appointments = response.json()
            results.add_test("Régression - GET appointments/my", True, f"{len(appointments)} RDV trouvés")
            print(f"✅ GET /api/appointments/my fonctionne: {len(appointments)} rendez-vous")
        else:
            results.add_test("Régression - GET appointments/my", False, f"Status: {response.status_code}")
            print(f"❌ GET /api/appointments/my échoue: {response.status_code}")
            
    except Exception as e:
        results.add_test("Régression - GET appointments/my", False, f"Exception: {str(e)}")
        print(f"❌ Exception: {str(e)}")
    
    # TEST 11: Régression - PUT /api/appointments/{id}
    print(f"\n1️⃣1️⃣ RÉGRESSION: PUT /api/appointments/{{id}}")
    if appointment_for_accept:
        try:
            update_data = {"status": "completed"}
            response = requests.put(f"{BASE_URL}/appointments/{appointment_for_accept}", headers=headers_a, json=update_data)
            
            if response.status_code == 200:
                results.add_test("Régression - PUT appointments", True, "Mise à jour fonctionne")
                print(f"✅ PUT /api/appointments/{{id}} fonctionne")
            else:
                results.add_test("Régression - PUT appointments", False, f"Status: {response.status_code}")
                print(f"❌ PUT /api/appointments/{{id}} échoue: {response.status_code}")
                
        except Exception as e:
            results.add_test("Régression - PUT appointments", False, f"Exception: {str(e)}")
            print(f"❌ Exception: {str(e)}")
    
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