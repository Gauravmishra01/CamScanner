const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let serviceAccount;

// Logic: Check if we are in Production (Render) or Local
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // PRODUCTION: Parse the JSON string from the Environment Variable
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT variable:", error);
  }
} else {
  // LOCAL: Read the file from disk
  try {
    serviceAccount = require("./serviceAccountKey.json");
  } catch (error) {
    console.error(
      "Error: serviceAccountKey.json not found. Make sure you set the Env Variable or have the file locally.",
    );
  }
}

// Initialize Firebase
if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Standard settings
db.settings({ ignoreUndefinedProperties: true });

module.exports = { admin, db };
