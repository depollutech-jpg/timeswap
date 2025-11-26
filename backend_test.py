#!/usr/bin/env python3
"""
Backend API Tests for TimeSwap Notification System
Tests the real-time notification system implementation
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Optional

# Configuration
BASE_URL = "https://swap-community.preview.emergentagent.com/api"

# Test credentials
USER1_CREDENTIALS = {
    "email": "testuser1@gmail.com",
    "password": "testpass123"
}

USER2_CREDENTIALS = {
    "email": "testuser2@gmail.com", 
    "password": "testpass123"
}

class NotificationTester:
    def __init__(self):
        self.user1_token = None
        self.user2_token = None
        self.user1_id = None
        self.user2_id = None
        self.test_chat_id = None
        self.test_service_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
    
    def authenticate_users(self) -> bool:
        """Authenticate both test users"""
        print("\n🔐 AUTHENTICATION TESTS")
        print("=" * 50)
        
        # Authenticate User 1
        try:
            response = requests.post(f"{BASE_URL}/auth/login", json=USER1_CREDENTIALS)
            if response.status_code == 200:
                data = response.json()
                self.user1_token = data["token"]
                self.user1_id = data["user"]["_id"]
                self.log_test("User1 Authentication", True, f"Successfully authenticated user1 (ID: {self.user1_id})")
            else:
                self.log_test("User1 Authentication", False, f"Failed to authenticate user1: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("User1 Authentication", False, f"Exception during user1 auth: {str(e)}")
            return False
        
        # Authenticate User 2
        try:
            response = requests.post(f"{BASE_URL}/auth/login", json=USER2_CREDENTIALS)
            if response.status_code == 200:
                data = response.json()
                self.user2_token = data["token"]
                self.user2_id = data["user"]["_id"]
                self.log_test("User2 Authentication", True, f"Successfully authenticated user2 (ID: {self.user2_id})")
            else:
                self.log_test("User2 Authentication", False, f"Failed to authenticate user2: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("User2 Authentication", False, f"Exception during user2 auth: {str(e)}")
            return False
        
        return True
    
    def setup_test_data(self) -> bool:
        """Create test service and chat for notification testing"""
        print("\n🏗️ TEST DATA SETUP")
        print("=" * 50)
        
        # Create a test service by User1
        service_data = {
            "title": "Test Service for Notifications",
            "description": "Service created for testing notification system",
            "category": "Informatique",
            "duration": 1.0,
            "type": "offer",
            "location": "Paris, France",
            "coordinates": {"latitude": 48.8566, "longitude": 2.3522}
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.user1_token}"}
            response = requests.post(f"{BASE_URL}/services", json=service_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                self.test_service_id = data["serviceId"]
                self.log_test("Test Service Creation", True, f"Created test service (ID: {self.test_service_id})")
            else:
                self.log_test("Test Service Creation", False, f"Failed to create service: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_test("Test Service Creation", False, f"Exception: {str(e)}")
            return False
        
        # Create a chat between User1 and User2
        chat_data = {
            "serviceId": self.test_service_id,
            "participantId": self.user2_id
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.user1_token}"}
            response = requests.post(f"{BASE_URL}/chats", json=chat_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                self.test_chat_id = data["_id"]
                self.log_test("Test Chat Creation", True, f"Created test chat (ID: {self.test_chat_id})")
            else:
                self.log_test("Test Chat Creation", False, f"Failed to create chat: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_test("Test Chat Creation", False, f"Exception: {str(e)}")
            return False
        
        return True
    
    def test_automatic_notification_creation(self) -> bool:
        """Test that notifications are automatically created when messages are sent"""
        print("\n📨 AUTOMATIC NOTIFICATION CREATION TESTS")
        print("=" * 50)
        
        # Get initial notification count for User2
        try:
            headers = {"Authorization": f"Bearer {self.user2_token}"}
            response = requests.get(f"{BASE_URL}/notifications", headers=headers)
            
            if response.status_code == 200:
                initial_notifications = response.json()
                initial_count = len(initial_notifications)
                self.log_test("Initial Notification Count", True, f"User2 has {initial_count} notifications initially")
            else:
                self.log_test("Initial Notification Count", False, f"Failed to get notifications: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Initial Notification Count", False, f"Exception: {str(e)}")
            return False
        
        # User1 sends a message to User2
        message_data = {"content": "Hello! This is a test message for notification system."}
        
        try:
            headers = {"Authorization": f"Bearer {self.user1_token}"}
            response = requests.post(f"{BASE_URL}/chats/{self.test_chat_id}/messages", json=message_data, headers=headers)
            
            if response.status_code == 200:
                message = response.json()
                self.log_test("Message Sending", True, f"User1 sent message (ID: {message['_id']})")
            else:
                self.log_test("Message Sending", False, f"Failed to send message: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_test("Message Sending", False, f"Exception: {str(e)}")
            return False
        
        # Wait a moment for notification to be created
        time.sleep(1)
        
        # Check if notification was created for User2
        try:
            headers = {"Authorization": f"Bearer {self.user2_token}"}
            response = requests.get(f"{BASE_URL}/notifications", headers=headers)
            
            if response.status_code == 200:
                new_notifications = response.json()
                new_count = len(new_notifications)
                
                if new_count > initial_count:
                    # Find the new notification
                    latest_notification = new_notifications[0]  # Should be sorted by timestamp desc
                    
                    # Verify notification structure
                    required_fields = ["_id", "userId", "type", "messageId", "chatId", "senderId", "senderName", "content", "timestamp", "read"]
                    missing_fields = [field for field in required_fields if field not in latest_notification]
                    
                    if not missing_fields:
                        if (latest_notification["userId"] == self.user2_id and 
                            latest_notification["type"] == "message" and
                            latest_notification["senderId"] == self.user1_id and
                            latest_notification["chatId"] == self.test_chat_id and
                            latest_notification["read"] == False):
                            
                            self.log_test("Notification Structure", True, 
                                        f"Notification created with correct structure",
                                        f"Type: {latest_notification['type']}, Sender: {latest_notification['senderName']}, Read: {latest_notification['read']}")
                        else:
                            self.log_test("Notification Structure", False, 
                                        "Notification created but with incorrect data",
                                        f"Expected userId={self.user2_id}, got {latest_notification.get('userId')}")
                    else:
                        self.log_test("Notification Structure", False, 
                                    f"Notification missing required fields: {missing_fields}")
                else:
                    self.log_test("Notification Creation", False, 
                                f"No new notification created. Count remained {new_count}")
                    return False
            else:
                self.log_test("Notification Verification", False, f"Failed to get notifications: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Notification Verification", False, f"Exception: {str(e)}")
            return False
        
        return True
    
    def test_get_notifications_endpoint(self) -> bool:
        """Test GET /api/notifications endpoint with different parameters"""
        print("\n📋 GET NOTIFICATIONS ENDPOINT TESTS")
        print("=" * 50)
        
        # Test getting all notifications
        try:
            headers = {"Authorization": f"Bearer {self.user2_token}"}
            response = requests.get(f"{BASE_URL}/notifications", headers=headers)
            
            if response.status_code == 200:
                all_notifications = response.json()
                self.log_test("Get All Notifications", True, 
                            f"Retrieved {len(all_notifications)} notifications",
                            f"First notification type: {all_notifications[0]['type'] if all_notifications else 'None'}")
            else:
                self.log_test("Get All Notifications", False, f"Failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_test("Get All Notifications", False, f"Exception: {str(e)}")
            return False
        
        # Test getting only unread notifications
        try:
            headers = {"Authorization": f"Bearer {self.user2_token}"}
            response = requests.get(f"{BASE_URL}/notifications?unread_only=true", headers=headers)
            
            if response.status_code == 200:
                unread_notifications = response.json()
                # Verify all returned notifications are unread
                all_unread = all(not notif["read"] for notif in unread_notifications)
                
                if all_unread:
                    self.log_test("Get Unread Notifications", True, 
                                f"Retrieved {len(unread_notifications)} unread notifications")
                else:
                    self.log_test("Get Unread Notifications", False, 
                                "Some returned notifications were already read")
            else:
                self.log_test("Get Unread Notifications", False, f"Failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Unread Notifications", False, f"Exception: {str(e)}")
            return False
        
        # Test authentication requirement
        try:
            response = requests.get(f"{BASE_URL}/notifications")  # No auth header
            
            if response.status_code == 401:
                self.log_test("Notifications Auth Required", True, "Correctly rejected unauthenticated request")
            else:
                self.log_test("Notifications Auth Required", False, 
                            f"Should have returned 401, got {response.status_code}")
        except Exception as e:
            self.log_test("Notifications Auth Required", False, f"Exception: {str(e)}")
        
        return True
    
    def test_mark_notification_read(self) -> bool:
        """Test POST /api/notifications/{id}/mark-read endpoint"""
        print("\n✅ MARK NOTIFICATION READ TESTS")
        print("=" * 50)
        
        # Get an unread notification
        try:
            headers = {"Authorization": f"Bearer {self.user2_token}"}
            response = requests.get(f"{BASE_URL}/notifications?unread_only=true", headers=headers)
            
            if response.status_code == 200:
                unread_notifications = response.json()
                if not unread_notifications:
                    self.log_test("Find Unread Notification", False, "No unread notifications found for testing")
                    return False
                
                test_notification = unread_notifications[0]
                notification_id = test_notification["_id"]
                
                self.log_test("Find Unread Notification", True, f"Found notification to test (ID: {notification_id})")
            else:
                self.log_test("Find Unread Notification", False, f"Failed to get notifications: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Find Unread Notification", False, f"Exception: {str(e)}")
            return False
        
        # Mark the notification as read
        try:
            headers = {"Authorization": f"Bearer {self.user2_token}"}
            response = requests.post(f"{BASE_URL}/notifications/{notification_id}/mark-read", headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    self.log_test("Mark Notification Read", True, f"Successfully marked notification as read")
                else:
                    self.log_test("Mark Notification Read", False, "API returned success=false")
                    return False
            else:
                self.log_test("Mark Notification Read", False, f"Failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_test("Mark Notification Read", False, f"Exception: {str(e)}")
            return False
        
        # Verify the notification is now marked as read
        try:
            headers = {"Authorization": f"Bearer {self.user2_token}"}
            response = requests.get(f"{BASE_URL}/notifications", headers=headers)
            
            if response.status_code == 200:
                all_notifications = response.json()
                marked_notification = next((n for n in all_notifications if n["_id"] == notification_id), None)
                
                if marked_notification and marked_notification["read"]:
                    self.log_test("Verify Notification Read", True, "Notification is now marked as read")
                else:
                    self.log_test("Verify Notification Read", False, "Notification is still unread")
                    return False
            else:
                self.log_test("Verify Notification Read", False, f"Failed to verify: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Verify Notification Read", False, f"Exception: {str(e)}")
            return False
        
        # Test security: User1 tries to mark User2's notification
        try:
            headers = {"Authorization": f"Bearer {self.user1_token}"}
            response = requests.post(f"{BASE_URL}/notifications/{notification_id}/mark-read", headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                if not result.get("success"):
                    self.log_test("Security - Cross-user Access", True, "Correctly prevented cross-user notification access")
                else:
                    self.log_test("Security - Cross-user Access", False, "User1 was able to mark User2's notification")
            else:
                self.log_test("Security - Cross-user Access", True, f"Correctly rejected with status {response.status_code}")
        except Exception as e:
            self.log_test("Security - Cross-user Access", False, f"Exception: {str(e)}")
        
        return True
    
    def test_mark_all_notifications_read(self) -> bool:
        """Test POST /api/notifications/mark-all-read endpoint"""
        print("\n✅ MARK ALL NOTIFICATIONS READ TESTS")
        print("=" * 50)
        
        # Send a few more messages to create more notifications
        for i in range(3):
            message_data = {"content": f"Test message {i+2} for bulk read testing"}
            try:
                headers = {"Authorization": f"Bearer {self.user1_token}"}
                response = requests.post(f"{BASE_URL}/chats/{self.test_chat_id}/messages", json=message_data, headers=headers)
                if response.status_code == 200:
                    self.log_test(f"Create Test Message {i+2}", True, f"Created additional test message")
                else:
                    self.log_test(f"Create Test Message {i+2}", False, f"Failed to create message: {response.status_code}")
            except Exception as e:
                self.log_test(f"Create Test Message {i+2}", False, f"Exception: {str(e)}")
        
        time.sleep(2)  # Wait for notifications to be created
        
        # Get count of unread notifications
        try:
            headers = {"Authorization": f"Bearer {self.user2_token}"}
            response = requests.get(f"{BASE_URL}/notifications?unread_only=true", headers=headers)
            
            if response.status_code == 200:
                unread_notifications = response.json()
                unread_count = len(unread_notifications)
                self.log_test("Count Unread Before Bulk", True, f"Found {unread_count} unread notifications")
            else:
                self.log_test("Count Unread Before Bulk", False, f"Failed: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Count Unread Before Bulk", False, f"Exception: {str(e)}")
            return False
        
        # Mark all notifications as read
        try:
            headers = {"Authorization": f"Bearer {self.user2_token}"}
            response = requests.post(f"{BASE_URL}/notifications/mark-all-read", headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                marked_count = result.get("marked_read", 0)
                
                if marked_count > 0:
                    self.log_test("Mark All Read", True, f"Marked {marked_count} notifications as read")
                else:
                    self.log_test("Mark All Read", False, "No notifications were marked as read")
                    return False
            else:
                self.log_test("Mark All Read", False, f"Failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_test("Mark All Read", False, f"Exception: {str(e)}")
            return False
        
        # Verify no unread notifications remain
        try:
            headers = {"Authorization": f"Bearer {self.user2_token}"}
            response = requests.get(f"{BASE_URL}/notifications?unread_only=true", headers=headers)
            
            if response.status_code == 200:
                remaining_unread = response.json()
                if len(remaining_unread) == 0:
                    self.log_test("Verify All Read", True, "All notifications are now marked as read")
                else:
                    self.log_test("Verify All Read", False, f"{len(remaining_unread)} notifications still unread")
                    return False
            else:
                self.log_test("Verify All Read", False, f"Failed to verify: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Verify All Read", False, f"Exception: {str(e)}")
            return False
        
        return True
    
    def test_notification_security(self) -> bool:
        """Test that users can only see their own notifications"""
        print("\n🔒 NOTIFICATION SECURITY TESTS")
        print("=" * 50)
        
        # User1 tries to access User2's notifications by getting all notifications
        try:
            headers = {"Authorization": f"Bearer {self.user1_token}"}
            response = requests.get(f"{BASE_URL}/notifications", headers=headers)
            
            if response.status_code == 200:
                user1_notifications = response.json()
                
                # Check if any notification belongs to User2
                user2_notifications = [n for n in user1_notifications if n["userId"] == self.user2_id]
                
                if len(user2_notifications) == 0:
                    self.log_test("User Isolation", True, "User1 cannot see User2's notifications")
                else:
                    self.log_test("User Isolation", False, f"User1 can see {len(user2_notifications)} of User2's notifications")
                    return False
            else:
                self.log_test("User Isolation", False, f"Failed to get User1 notifications: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("User Isolation", False, f"Exception: {str(e)}")
            return False
        
        return True
    
    def run_all_tests(self):
        """Run all notification system tests"""
        print("🚀 STARTING TIMESWAP NOTIFICATION SYSTEM TESTS")
        print("=" * 60)
        print(f"Testing against: {BASE_URL}")
        print(f"Test Users: {USER1_CREDENTIALS['email']} & {USER2_CREDENTIALS['email']}")
        print("=" * 60)
        
        # Run tests in sequence
        tests = [
            ("Authentication", self.authenticate_users),
            ("Test Data Setup", self.setup_test_data),
            ("Automatic Notification Creation", self.test_automatic_notification_creation),
            ("Get Notifications Endpoint", self.test_get_notifications_endpoint),
            ("Mark Notification Read", self.test_mark_notification_read),
            ("Mark All Notifications Read", self.test_mark_all_notifications_read),
            ("Notification Security", self.test_notification_security)
        ]
        
        failed_tests = []
        
        for test_name, test_func in tests:
            try:
                success = test_func()
                if not success:
                    failed_tests.append(test_name)
                    print(f"\n⚠️  {test_name} failed - continuing with remaining tests...")
            except Exception as e:
                failed_tests.append(test_name)
                print(f"\n💥 {test_name} crashed with exception: {str(e)}")
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed_tests = len(tests) - len(failed_tests)
        print(f"✅ Passed: {passed_tests}/{len(tests)} test suites")
        print(f"❌ Failed: {len(failed_tests)}/{len(tests)} test suites")
        
        if failed_tests:
            print(f"\n❌ Failed test suites: {', '.join(failed_tests)}")
        
        # Print detailed results
        print(f"\n📋 DETAILED RESULTS ({len(self.test_results)} individual tests)")
        print("-" * 60)
        
        passed_individual = sum(1 for r in self.test_results if r["success"])
        failed_individual = len(self.test_results) - passed_individual
        
        print(f"✅ Individual tests passed: {passed_individual}")
        print(f"❌ Individual tests failed: {failed_individual}")
        
        if failed_individual > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['message']}")
                    if result["details"]:
                        print(f"     Details: {result['details']}")
        
        print("\n" + "=" * 60)
        
        return len(failed_tests) == 0

if __name__ == "__main__":
    tester = NotificationTester()
    success = tester.run_all_tests()
    
    if success:
        print("🎉 ALL TESTS PASSED! Notification system is working correctly.")
        exit(0)
    else:
        print("💥 SOME TESTS FAILED! Check the details above.")
        exit(1)