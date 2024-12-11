// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import{getFirestore} from "firebase/firestore"
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAR3lOzSri2_ZUfI6ccRVlm-UyrdMNvHyQ",
  authDomain: "aiventure-travel.firebaseapp.com",
  projectId: "aiventure-travel",
  storageBucket: "aiventure-travel.firebasestorage.app",
  messagingSenderId: "174071291899",
  appId: "1:174071291899:web:dc704b00163193ab0e755e"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app);
export const db =getFirestore(app)