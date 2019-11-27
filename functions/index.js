const app = require("express")();
const functions = require("firebase-functions");

const { getAllScreams, postOneScream } = require("./handlers/screams");
const {
  addUserDetails,
  getAuthenticatedUser,
  login,
  signUp,
  uploadImage
} = require("./handlers/users");

const FBAuth = require("./util/FBAuth");

// * === Scream routes === *
// =========================
app.get("/screams", getAllScreams);
app.post("/scream", FBAuth, postOneScream);

// * === User routes === *
// =========================
app.post("/signup", signUp);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

exports.api = functions.region("europe-west2").https.onRequest(app);
