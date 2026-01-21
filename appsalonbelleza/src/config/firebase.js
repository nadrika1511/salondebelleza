import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA2ICkTu6xa_GKLAOsg9fYwKl5PxOwID4g",
  authDomain: "salondebelleza-cac99.firebaseapp.com",
  projectId: "salondebelleza-cac99",
  storageBucket: "salondebelleza-cac99.firebasestorage.app",
  messagingSenderId: "1056056034411",
  appId: "1:1056056034411:web:7868cd642e6ca405085d2e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
