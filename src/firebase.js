import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "jidelnicek-e5b5c.firebaseapp.com",
  projectId: "jidelnicek-e5b5c",
  storageBucket: "jidelnicek-e5b5c.firebasestorage.app",
  messagingSenderId: "628965092324",
  appId: "1:628965092324:web:2f2bd859f5a7e0443635f1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
