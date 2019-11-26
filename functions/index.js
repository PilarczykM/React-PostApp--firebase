const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

exports.getScreams = functions
  .region("europe-west2")
  .https.onRequest((request, response) => {
    if (req.method !== "GET") {
      return res.status(400).json({ error: "Method not allowed" });
    }

    admin
      .firestore()
      .collection("screams")
      .get()
      .then(data => {
        let screams = [];
        data.forEach(doc => {
          screams.push(doc.data());
        });
        return response.json(screams);
      })
      .catch(err => console.log(err));
  });

exports.createScream = functions
  .region("europe-west2")
  .https.onRequest((req, res) => {
    if (req.method !== "POST") {
      return res.status(400).json({ error: "Method not allowed" });
    }

    const newScream = {
      body: req.body.body,
      userHandle: req.body.userHandle,
      createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };

    admin
      .firestore()
      .collection("screams")
      .add(newScream)
      .then(doc => {
        res.json({ message: `Document ${doc.id} created successfully` });
      })
      .catch(err => {
        res.status(500).json({
          error: "Something went wrong",
          errorLog: err
        });
        console.error(err);
      });
  });
