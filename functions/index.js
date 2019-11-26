const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
var cors = require("cors");

admin.initializeApp();
const app = express();
app.use(cors());

app.get("/screams", (req, res) => {
  admin
    .firestore()
    .collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        });
        return res.json(screams);
      });
    })
    .catch(err => console.log(err));
});

app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
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
    });
});

exports.api = functions.region("europe-west2").https.onRequest(app);
