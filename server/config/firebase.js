const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase with Standard Settings
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Standard settings (safe and stable)
db.settings({ ignoreUndefinedProperties: true });

module.exports = { admin, db };
