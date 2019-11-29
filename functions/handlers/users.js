const { admin, db } = require("../util/admin");
const {
  validateSignUpData,
  validateLoginData,
  reduceUserDetails
} = require("../util/validators");

const config = require("../util/keys/config");

const firebase = require("firebase");

firebase.initializeApp(config);

/**
 * @desc Post method to add user details.
 * @param any $req - The request.
 * @param any $res - The response.
 * @return void - Response of the server.
 */
exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);

  db.doc(`/users/${req.user.handle}`)
    .update(userDetails)
    .then(() => {
      return res.json({ message: "Details updated successfully" });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

/**
 * @desc Get method to get data of authenticated uder for client.
 * @param any $req - The request.
 * @param any $res - The response.
 * @return void - Response of the server.
 */
exports.getAuthenticatedUser = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.user.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db
          .collection("likes")
          .where("userHandle", "==", req.user.handle)
          .get();
      }
    })
    .then(data => {
      userData.likes = [];
      data.forEach(doc => {
        userData.likes.push(doc.data());
      });
      return res.json(userData);
    })
    .catch(err => {
      return res.status(500).json({ error: err.code });
    });
};

/**
 * @desc Post method to login user.
 * @param any $req - The request.
 * @param any $res - The response.
 * @return void - Response of the server.
 */
exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  const { errors, valid } = validateLoginData(user);

  if (!valid) return res.status(400).json(errors);

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
};

/**
 * @desc Post method to sign up new user.
 * @param any $req - The request.
 * @param any $res - The response.
 * @return void - Response of the server.
 */
exports.signUp = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  const { valid, errors } = validateSignUpData(newUser);
  if (!valid) return res.status(400).json({ errors });

  const noImg = "no-img.png";

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
        userId,
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`
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
};

/**
 * @desc Post method to upload image for user.
 * @param any $req - The request.
 * @param any $res - The response.
 * @return void - Response of the server.
 */
exports.uploadImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({
    headers: req.headers
  });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on("file", (fieldName, file, fileName, encoding, mimetype) => {
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({
        error: "Wrong file type submitted. Try .jpeg || .jpg || .png"
      });
    }

    // Getting filetype (eg. .png, /jpg ...)
    const imageExtension = fileName.split(".")[fileName.split(".").length - 1];

    // 1345657562252573457347.png
    imageFileName = `${Math.round(
      Math.random() * 100000000
    )}.${imageExtension}`;

    const filePath = path.join(os.tmpdir(), imageFileName);

    imageToBeUploaded = { filePath, mimetype };

    file.pipe(fs.createWriteStream(filePath));
  });

  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filePath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
      })
      .then(() => {
        return res.json({ message: "Image uploaded successfully!" });
      })
      .catch(err => {
        res.status(500).json({ error: err });
      });
  });

  busboy.end(req.rawBody);
};
