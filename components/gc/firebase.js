// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    getAuth, 
    sendPasswordResetEmail,
} from "firebase/auth";
import { getUserData, addUserToFirestore } from "./firestore";
import { cleanUpLocalStorage } from "../helpers/storageHelper";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBZc2mqlsdKvSEOh58EkSuQINGEP81nbxk",
    authDomain: "project-404109.firebaseapp.com",
    projectId: "youtube-project-404109",
    storageBucket: "youtube-project-404109.appspot.com",
    messagingSenderId: "335940396294",
    appId: "1:335940396294:web:3822351b0028a6ae5caa87",
    measurementId: "G-G77MRMVNNP"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
//const analytics = getAnalytics(app);

export const signInUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        let user = userCredential.user;
        await completeUserData(user);
        cleanUpLocalStorage(true);
        console.log("User signed in:", user);
        return user;
    } catch (error) {
        console.error("Error signing in:", error.msage);
        const userConfirmed = window.confirm("Error signing in. Would you like to reset your password?");
        if (userConfirmed) {
            await sendPasswordResetEmail(auth, email);
            alert("Password reset email sent. Please check your email and follow the instructions to reset your password.");
        } else {
            console.log("Password reset email not sent.");
        }
    }
};

export const signUpUser = async (userName, email, password) => {
    try {
        cleanUpLocalStorage(true);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await addUserToFirestore(user.uid, userName);
        const userData = await getUserData(user.uid);
        user.username = userData.username;
        console.log("User signed up:", user);
        return user;
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.error("Email already in use.");
            const userConfirmed = window.confirm("The email is already in use. Would you like to reset your password?");
            if (userConfirmed) {
                await sendPasswordResetEmail(auth, email);
                alert("Password reset email sent. Please check your email and follow the instructions to reset your password.");
            } else {
                console.log("Password reset email not sent.");
            }
        } else {
            console.error("Error signing up:", error.message);
        }
    }
};

export const signOutUser = async () => {
    try {
        await signOut(auth);
        cleanUpLocalStorage(true);
        console.log("User signed out");
    } catch (error) {
        console.error("Error signing out:", error.message);
    }
};

export async function completeUserData(user) {
    if (!user) {
        return;
    }
    if (!user.username) {
        const userData = await getUserData(user.uid);
        user.username = userData.username;
    }
}
