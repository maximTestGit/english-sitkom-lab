import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "./firebase";

//const db = getFirestore(app);

export const addUserToFirestore = async (uid, username, language) => {
    await setDoc(doc(getFirestore(app), "users", uid), {
        username: username,
        language: language,
    });
    console.log("LingFlix:  added to Firestore:", uid);
    return uid;
};

export const getUserData = async (uid) => {
    if (!app) {
        return null;
    }
    const userDoc = await getDoc(doc(getFirestore(app), "users", uid));
    if (userDoc.exists()) {
        return { username: userDoc.data().username, language: userDoc.data().language??'en-US' };
    }
    return null;
};