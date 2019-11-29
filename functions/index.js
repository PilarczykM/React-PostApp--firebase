const app = require("express")();
const functions = require("firebase-functions");

const {
  commentOnScream,
  getAllScreams,
  getScream,
  likeScream,
  postOneScream,
  unlikeScream
} = require("./handlers/screams");
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
app.get("/scream/:screamId", getScream);
// Todo: delete scream
app.get("/scream/:screamId/like", FBAuth, likeScream);
app.get("/scream/:screamId/unlike", FBAuth, unlikeScream);
app.post("/scream/:screamId/comment", FBAuth, commentOnScream);

// * === User routes === *
// =========================
app.post("/signup", signUp);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

exports.api = functions.region("europe-west2").https.onRequest(app);
