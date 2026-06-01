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

async function getRawBody(req) {
    if (req.body) {
        if (typeof req.body === "string") {
            return Buffer.from(req.body);
        }

        if (Buffer.isBuffer(req.body)) {
            return req.body;
        }

        return Buffer.from(JSON.stringify(req.body));
    }

    const chunks = [];

    for await (const chunk of req) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }

    return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    console.log("=== STRIPE WEBHOOK START ===");
    console.log("STRIPE_WEBHOOK_SECRET exists:", !!process.env.STRIPE_WEBHOOK_SECRET);
    console.log("FIREBASE_SERVICE_ACCOUNT_BASE64 exists:", !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64);
    console.log("SKIP_STRIPE_SIGNATURE_CHECK:", process.env.SKIP_STRIPE_SIGNATURE_CHECK);

    if (req.method !== "POST") {
        return res.status(405).send("Method not allowed");
    }

    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("Missing STRIPE_SECRET_KEY");
        }

        initFirebaseAdmin();

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const rawBody = await getRawBody(req);
        const rawBodyString = rawBody.toString("utf8");

        console.log("Raw body length:", rawBody.length);

        let event;

        if (process.env.SKIP_STRIPE_SIGNATURE_CHECK === "true") {
            console.warn("Skipping Stripe signature verification. Local testing only.");

            if (!rawBodyString) {
                throw new Error("Webhook body is empty");
            }

            event = JSON.parse(rawBodyString);
        } else {
            if (!process.env.STRIPE_WEBHOOK_SECRET) {
                throw new Error("Missing STRIPE_WEBHOOK_SECRET");
            }

            const signature = req.headers["stripe-signature"];

            event = stripe.webhooks.constructEvent(
                rawBody,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        }

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