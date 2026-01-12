import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { app } from "./base.js";

export let currentUser = null;
export let userStats = null;

const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        currentUser = null;
        userStats = null;
        document.dispatchEvent(new Event("user-logged-out"));
        return;
    }

    currentUser = user;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    userStats = snap.exists() ? snap.data() : null;

    document.dispatchEvent(new Event("user-logged-in"));
});
