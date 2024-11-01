import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "./firebase";

//const db = getFirestore(app);

export const addUserToFirestore = async (uid, username, language) => {
    try {
        document.body.style.cursor = 'wait';
        await setDoc(doc(getFirestore(app), "users", uid), {
            username: username,
            language: language,
        });
    } finally {
        document.body.style.cursor = 'default';
    }
    console.log("LingFlix:  added to Firestore:", uid);
    return uid;
};

export const getUserData = async (uid) => {
    let result = null
    try {
        document.body.style.cursor = 'wait';
        if (app) {
            const userDoc = await getDoc(doc(getFirestore(app), "users", uid));
            if (userDoc.exists()) {
                result = { username: userDoc.data().username, language: userDoc.data().language ?? 'en-US' };
            }
        }
    } finally {
        document.body.style.cursor = 'default';
    } 
    return result;
};