// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAT-MEaTjJP_LdDtWsrTQSVDdcgBIw7vNI",
  authDomain: "webtrain-3a2cf.firebaseapp.com",
  databaseURL: "https://webtrain-3a2cf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "webtrain-3a2cf",
  storageBucket: "webtrain-3a2cf.appspot.com",
  messagingSenderId: "1019671179590",
  appId: "1:1019671179590:web:b0ff8a84baa2549a6cf547",
  measurementId: "G-8XNC10VJGR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();


createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
    alert('congrats! user created successfully');
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
    alert('invalid user');
  });
  window.addEventListener('scroll', scrollPosLive);
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Function to display alert if not a mobile device
function showAlertIfNotMobile() {
    if (!isMobileDevice()) {
        window.location.replace("main/login.html");
    }
}

// Call the function when the page loads
window.onload = showAlertIfNotMobile;