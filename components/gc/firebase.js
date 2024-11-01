import { initializeApp } from "firebase/app";
import Swal from 'sweetalert2';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    getAuth,
    sendPasswordResetEmail,
} from "firebase/auth";
import { getUserData, addUserToFirestore } from "./firestore";
import { cleanUpLocalStorage } from "../helpers/storageHelper";
import { languages, getLanguageName } from "../data/configurator";

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
        document.body.style.cursor = 'wait';
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        let user = userCredential.user;
        await completeUserData(user);
        cleanUpLocalStorage(true);
        console.log("User signed in:", user);
        return user;
    } catch (error) {
        console.error("Error signing in:", error.msage);
        const { isConfirmed } = await Swal.fire({
            title: 'Error signing in',
            text: 'Would you like to reset your password?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel'
        });
        if (isConfirmed) {
            await sendPasswordResetEmail(auth, email);
            Swal.fire({
                title: 'Password Reset Email Sent',
                text: 'Please check your email and follow the instructions to reset your password.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        } else {
            console.log("Password reset email not sent.");
        }
    } finally {                
        document.body.style.cursor = 'default';
    }
};

export const signUpUser = async (userName, email, password, language) => {
    try {
        document.body.style.cursor = 'wait';
        cleanUpLocalStorage(true);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await addUserToFirestore(user.uid, userName, language);
        completeUserData(user);
        console.log("User signed up:", user);
        return user;
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.error("Email already in use.");
            const { isConfirmed } = await Swal.fire({
                title: 'Email Already in Use',
                text: 'Would you like to reset your password?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel'
            });
            if (isConfirmed) {
                await sendPasswordResetEmail(auth, email);
                Swal.fire({
                    title: 'Password Reset Email Sent',
                    text: 'Please check your email and follow the instructions to reset your password.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } else {
                console.log("Password reset email not sent.");
            }
        } else {
            console.error("Error signing up:", error.message);
        }
    } finally {
        document.body.style.cursor = 'default';
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
        user.language = userData.language;
    }
    console.log("LingFlix: User data completed:", user);
    return user;
}
