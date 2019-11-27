var cors = require("cors");
const app = require("express")();
const firebase = require("firebase");
const admin = require("firebase-admin");
const functions = require("firebase-functions");

const firebaseConfig = {
  apiKey: "AIzaSyBXO3evM8uE8TudrkzkGMUii9ga0XJjqAs",
  authDomain: "socialapp-21a4f.firebaseapp.com",
  databaseURL: "https://socialapp-21a4f.firebaseio.com",
  projectId: "socialapp-21a4f",
  storageBucket: "socialapp-21a4f.appspot.com",
  messagingSenderId: "484727440827",
  appId: "1:484727440827:web:86538b4ef56be33904309e"
};

admin.initializeApp();
app.use(cors());
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get("/screams", (req, res) => {
  db.collection("screams")
    .get()
    .then(data => {
      let screams = [];
      if (data.length == 0) {
        return res.status(200).json({ message: "There are no screams" });
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

  db.collection("screams")
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

const isEmpty = string => {
  return string.trim() == "" ? true : false;
};

validateEmail = email => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  let errors = {};

  // * Data validation
  if (isEmpty(newUser.email)) {
    errors.email = "Must not be empty!";
  } else if (!validateEmail(newUser.email)) {
    errors.email = "Must be a valid email address!";
  }

  if (isEmpty(newUser.password)) {
    errors.password = "Must not be empty";
  } else if (newUser.password !== newUser.confirmPassword) {
    errors.confirmPassword = "Passwords must match";
  }

  if (isEmpty(newUser.handle)) {
    errors.handle = "Must not be empty!";
  }

  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  // * End of data validation

  let userToken, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({
          handle: "This handle is already taken!"
        });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(token => {
      userToken = token;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId: userId
      };

      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token: userToken });
    })
    .catch(err => {
      if (err.code == "auth/email-already-in-use") {
        res.status(400).json({ email: "Email is alreadry used!" });
      }
      res.status(500).json({ error: err.code });
    });
});

app.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  let errors = {};

  if (isEmpty(user.email)) errors.email = "Must not be empty!";
  if (isEmpty(user.password)) errors.password = "Must not be empty!";

  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  // * Auth * //

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      if (err.code == "auth/wrong-password")
        return res
          .status(405)
          .json({ general: "Wrong credentials please try again" });

      return res.status(500).json({ error: err.code });
    });
});

exports.api = functions.region("europe-west2").https.onRequest(app);
