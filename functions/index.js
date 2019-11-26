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
    .get()
    .then(data => {
      let screams = [];
      if (data.length == 0) {
        return res.status(200).json({ message: "There is no screams" });
      }
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(screams);
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
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
