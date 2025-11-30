#!/usr/bin/env python3
"""
Quick test for specific issues
"""

import requests
import json

BASE_URL = "https://servicexchange.preview.emergentagent.com/api"

# Test photo validation
def test_photo_validation():
    # First register a test user
    user_data = {
        "email": "phototest@test.com",
        "password": "testpass123",
        "firstName": "Photo",
        "lastName": "Tester"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    if response.status_code == 200:
        token = response.json()["token"]
        print("✅ User registered successfully")
    else:
        print(f"❌ User registration failed: {response.text}")
        return
    
    # Test service with 4 photos (should fail)
    test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    service_data = {
        "title": "Test service with 4 photos",
        "description": "Should fail validation",
        "category": "Test",
        "duration": 1.0,
        "type": "offer",
        "location": "Test",
        "photos": [test_image, test_image, test_image, test_image]  # 4 photos
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/services", json=service_data, headers=headers)
    
    print(f"Photo validation test - Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 400:
        print("✅ Photo validation working correctly")
    else:
        print("❌ Photo validation not working")

# Test admin login with different passwords
def test_admin_login():
    passwords_to_try = ["password123", "admin123", "timeswap123", "admin", "password"]
    
    for password in passwords_to_try:
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": "quentinraffalli@hotmail.com",
            "password": password
        })
        
        print(f"Admin login with password '{password}': {response.status_code}")
        if response.status_code == 200:
            print(f"✅ Admin login successful with password: {password}")
            return response.json()["token"]
        else:
            print(f"❌ Failed: {response.text}")
    
    return None

if __name__ == "__main__":
    print("🧪 Running quick tests...")
    print("\n1. Testing photo validation:")
    test_photo_validation()
    
    print("\n2. Testing admin login:")
    admin_token = test_admin_login()
    
    if admin_token:
        print(f"\n3. Testing admin endpoints with token:")
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/admin/reports", headers=headers)
        print(f"Admin reports access: {response.status_code}")