import { getFirestore } from "firebase/firestore";

const firebaseSetup = {
  apiKey: "AIzaSyBMyfRZJmDgBiwJZ6yoDW5F3DV7QL67d-Q",
  authDomain: "saferpdf.firebaseapp.com",
  projectId: "saferpdf",
  storageBucket: "saferpdf.appspot.com",
  messagingSenderId: "471901970775",
  appId: "1:471901970775:web:50880afe74552a427c1e12",
  measurementId: "G-YZGF2P3R1Z",
};

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const app = initializeApp(firebaseSetup);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
