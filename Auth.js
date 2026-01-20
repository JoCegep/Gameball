import { app } from "./base.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getFirestore, doc, getDoc, setDoc, updateDoc } from
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAFvJWMS7bGKlQ5tK726fpcDc4MN2B0sog",
    authDomain: "gameball-19d86.firebaseapp.com",
    projectId: "gameball-19d86"
};

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// logique pop up connexion
const btnConnexionGoogle = document.getElementById("btnConnexionGoogle");
const btnCreationGoogle = document.getElementById("btnCreationGoogle");

if (btnConnexionGoogle){
    btnConnexionGoogle.addEventListener("click", async () => {
        try {
            await signInWithPopup(auth, provider);

            // Show success screen
            document
                .getElementById("loginSuccessOverlay")
                .classList.remove("hidden");
        } catch (err) {
            console.error(err);
        }
    });
}


if (btnCreationGoogle){
    //logique pop up creation
    document.getElementById("btnCreationGoogle").addEventListener("click", async () => {
        try {
            await signInWithPopup(auth, provider);

            // Show success screen
            document
                .getElementById("loginSuccessOverlay")
                .classList.remove("hidden");
        } catch (err) {
            console.error(err);
        }
    });
}

// creation donnees si nouveau compte
const db = getFirestore();

async function ensureUserDoc(user) {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        await setDoc(ref, {
            username: user.displayName,
            bestAttempts: null,
            bestTime: null,
            freeGames: 2,
            hasPremium: false
        });
    } else {
        // Existing user → check for missing fields
        const data = snap.data();

        if (data.freeGames === undefined) {
            await updateDoc(ref, {
                freeGames: 2
            });
        }
        if (data.hasPremium === undefined) {
            await updateDoc(ref, {
                hasPremium: false
            });
        }
    }
}

// detection user connecte
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Connected as:", user.displayName, user.email);

        // Example: update UI (add when player info will be displayed on main page
        //document.getElementById("pseudo").innerText = user.displayName;

        // Store minimal info locally if you want
        localStorage.setItem("uid", user.uid);

        ensureUserDoc(user);
    } else {
        console.log("Not logged in");
    }
});

// helper for user data
export async function getUserData(uid) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        return null;
    }

    return snap.data();
}