import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCaainZHY5q4uqndUmd3zeTiBJv_ie7uXo",
  authDomain: "kedai-ku-3ba0a.firebaseapp.com",
  projectId: "kedai-ku-3ba0a",
  storageBucket: "kedai-ku-3ba0a.firebasestorage.app",
  messagingSenderId: "775874771569",
  appId: "1:775874771569:web:3e9557b3503b23399af9d0",
  measurementId: "G-J3SDTXJ5V1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };