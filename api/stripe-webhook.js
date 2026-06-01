import Stripe from "stripe";
import admin from "firebase-admin";
import { buffer } from "micro";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
    api: {
        bodyParser: false
    }
};

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
    console.log("=== STRIPE WEBHOOK START ===");

    if (req.method !== "POST") {
        return res.status(405).send("Method not allowed");
    }

    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("Missing STRIPE_SECRET_KEY");
        }

        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error("Missing STRIPE_WEBHOOK_SECRET");
        }

        initFirebaseAdmin();

        const signature = req.headers["stripe-signature"];
        const rawBody = await buffer(req);

        const event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        console.log("Webhook event:", event.type);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const uid = session.client_reference_id;

            console.log("Session client_reference_id:", uid);

            if (!uid) {
                throw new Error("Missing client_reference_id on Stripe session");
            }

            await admin.firestore()
                .collection("users")
                .doc(uid)
                .set(
                    {
                        hasPremium: true,
                        premiumPurchasedAt: admin.firestore.FieldValue.serverTimestamp()
                    },
                    { merge: true }
                );

            console.log("User upgraded to premium:", uid);
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error("Webhook error message:", error.message);
        console.error("Webhook full error:", error);

        return res.status(400).send(`Webhook Error: ${error.message}`);
    }
}