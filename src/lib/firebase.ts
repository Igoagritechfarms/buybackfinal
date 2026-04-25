import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAKOGn_UfIH0iPuNLaJwfiwVYiN-O-Zg2c',
  authDomain: 'igobuyback-6d1a2.firebaseapp.com',
  projectId: 'igobuyback-6d1a2',
  storageBucket: 'igobuyback-6d1a2.firebasestorage.app',
  messagingSenderId: '405553256479',
  appId: '1:405553256479:web:8d8c9c92965b59c3ac9d2a',
  measurementId: 'G-WZFYGX5XHS',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const firebaseAuth = getAuth(app);
