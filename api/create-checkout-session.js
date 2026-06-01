import Stripe from "stripe";
import admin from "firebase-admin";

function initFirebaseAdmin() {
    if (admin.apps.length) return;

    if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64");
    }

    const serviceAccountJson = Buffer
        .from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64")
        .toString("utf8");

    const serviceAccount = JSON.parse(serviceAccountJson);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

export default async function handler(req, res) {
    console.log("=== CHECKOUT START ===");
    console.log("STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);
    console.log("STRIPE_PRICE_ID exists:", !!process.env.STRIPE_PRICE_ID);
    console.log("SITE_URL:", process.env.SITE_URL);
    console.log("FIREBASE_SERVICE_ACCOUNT_BASE64 exists:", !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64);

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("Missing STRIPE_SECRET_KEY");
        }

        if (!process.env.STRIPE_PRICE_ID) {
            throw new Error("Missing STRIPE_PRICE_ID");
        }

        if (!process.env.SITE_URL) {
            throw new Error("Missing SITE_URL");
        }

        initFirebaseAdmin();

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const authHeader = req.headers.authorization || "";
        const token = authHeader.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ error: "Missing Firebase token" });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        const uid = decodedToken.uid;

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            client_reference_id: uid,
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1
                }
            ],
            success_url: `${process.env.SITE_URL}/memoire.html?payment=success`,
            cancel_url: `${process.env.SITE_URL}/memoire.html?payment=cancel`
        });

        return res.status(200).json({ url: session.url });
    } catch (error) {
        console.error("Checkout error message:", error.message);
        console.error("Checkout full error:", error);

        return res.status(500).json({
            error: error.message
        });
    }
}