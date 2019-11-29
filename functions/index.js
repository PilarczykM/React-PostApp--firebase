const app = require("express")();
const functions = require("firebase-functions");

const {
  commentOnScream,
  deleteScream,
  getAllScreams,
  getScream,
  likeScream,
  postOneScream,
  unlikeScream
} = require("./handlers/screams");
const {
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  login,
  markNotificationsRead,
  signUp,
  uploadImage
} = require("./handlers/users");

const FBAuth = require("./util/FBAuth");

const { db } = require("./util/admin");

// * === Scream routes === *
// =========================
app.get("/screams", getAllScreams);
app.post("/scream", FBAuth, postOneScream);
app.get("/scream/:screamId", getScream);
app.delete("/scream/:screamId", FBAuth, deleteScream);
app.get("/scream/:screamId/like", FBAuth, likeScream);
app.get("/scream/:screamId/unlike", FBAuth, unlikeScream);
app.post("/scream/:screamId/comment", FBAuth, commentOnScream);

// * === User routes === *
// =======================
app.post("/signup", signUp);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.get("/user/:handle", getUserDetails);

// * === Notification routes === *
// =======================
app.post("/notifications", FBAuth, markNotificationsRead);

exports.api = functions.region("europe-west2").https.onRequest(app);

// * === On like notification === *
// ================================
exports.createNotificationOnLike = functions
  .region("europe-west2")
  .firestore.document("/likes/{id}")
  .onCreate(snapshot => {
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            screamId: doc.id
          });
        }
      })
      .then(() => {
        return;
      })
      .catch(err => {
        console.err(err);
        return;
      });
  });

// * === On comment notification === *
// ===================================
exports.createNotificationOnComment = functions
  .region("europe-west2")
  .firestore.document("/comments/{id}")
  .onCreate(snapshot => {
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            screamId: doc.id
          });
        }
      })
      .then(() => {
        return;
      })
      .catch(err => {
        console.err(err);
        return;
      });
  });

// * === Delete notification on unlike === *
// =========================================
exports.deleteNotificationOnUnLike = functions
  .region("europe-west2")
  .firestore.document("likes/{id}")
  .onDelete(snapshot => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch(err => {
        console.error(err);
        return;
      });
  });
