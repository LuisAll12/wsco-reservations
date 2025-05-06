import admin from "firebase-admin";
import path from "path";
import fs from "fs";

// Construct an absolute path to your service account key
const serviceAccountPath = path.resolve(__dirname, "../credentials/serviceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
    throw new Error("serviceAccountKey.json not found at: " + serviceAccountPath);
}

admin.initializeApp({
    credential: admin.credential.cert(
        require(serviceAccountPath)
    ),
});

const db = admin.firestore();

export { admin, db };