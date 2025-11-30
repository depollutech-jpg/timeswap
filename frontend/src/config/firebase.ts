import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMWNH_AtZ0-b6LDL4RuCN6SkZ_vGJVHiY",
  authDomain: "timeswap-755ac.firebaseapp.com",
  projectId: "timeswap-755ac",
  storageBucket: "timeswap-755ac.firebasestorage.app",
  messagingSenderId: "219683140780",
  appId: "1:219683140780:web:135eb06476578d01f89b09",
  measurementId: "G-EFZNZ6PMQQ"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Analytics (only on web for now)
let analytics: Analytics | null = null;

if (Platform.OS === 'web') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('✅ Firebase Analytics initialized');
    }
  });
}

export { app, analytics };
