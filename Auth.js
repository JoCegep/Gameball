import { app } from "./base.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export let currentUser = null;
export let userStats = null;

const btnConnexionGoogle = document.getElementById("btnConnexionGoogle");
const btnCreationGoogle = document.getElementById("btnCreationGoogle");

async function ensureUserDoc(user) {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        const newUserData = {
            username: user.displayName,
            email: user.email,
            bestAttempts: null,
            bestTime: null,
            freeGames: 2,
            hasPremium: false
        };

        await setDoc(ref, newUserData);
        return newUserData;
    }

    const data = snap.data();
    const updates = {};

    if (data.freeGames === undefined) {
        updates.freeGames = 2;
    }

    if (data.hasPremium === undefined) {
        updates.hasPremium = false;
    }

    if (data.email === undefined) {
        updates.email = user.email;
    }

    if (Object.keys(updates).length > 0) {
        await updateDoc(ref, updates);
        return {
            ...data,
            ...updates
        };
    }

    return data;
}

async function loginWithGoogle() {
    try {
        await signInWithPopup(auth, provider);

        const overlay = document.getElementById("loginSuccessOverlay");

        if (overlay) {
            overlay.classList.remove("hidden");
        }
    } catch (err) {
        console.error("Google login failed:", err);
    }
}

if (btnConnexionGoogle) {
    btnConnexionGoogle.addEventListener("click", loginWithGoogle);
}

if (btnCreationGoogle) {
    btnCreationGoogle.addEventListener("click", loginWithGoogle);
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        currentUser = null;
        userStats = null;
        localStorage.removeItem("uid");

        document.dispatchEvent(new Event("user-logged-out"));
        return;
    }

    currentUser = user;
    localStorage.setItem("uid", user.uid);

    userStats = await ensureUserDoc(user);

    console.log("Connected as:", user.displayName, user.email);

    document.dispatchEvent(new Event("user-logged-in"));
});

export async function getUserData(uid) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        return null;
    }

    return snap.data();
}