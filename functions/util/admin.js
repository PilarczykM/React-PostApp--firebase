const admin = require("firebase-admin");
const serviceAccount = require("./keys/socialapp-21a4f-firebase-adminsdk-v4ory-cecbf15bfd.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://socialapp-21a4f.firebaseio.com",
  storageBucket: "gs://socialapp-21a4f.appspot.com"
});

const db = admin.firestore();

module.exports = { admin, db };
