import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Nahraď těmito hodnotami z Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAtP06ME1i5fp4gP24HOup6u2gC6J_vY9U",
  authDomain: "jidelnicek-e5b5c.firebaseapp.com",
  projectId: "jidelnicek-e5b5c",
  storageBucket: "jidelnicek-e5b5c.firebasestorage.app",
  messagingSenderId: "628965092324",
  appId: "1:628965092324:web:2f2bd859f5a7e0443635f1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
