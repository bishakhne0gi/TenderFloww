const express = require("express");
const { format } = require("util");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const authorization = require("../middleware/authorization");
const mysql = require("mysql");
const { Storage } = require("@google-cloud/storage");
const {
  createNewTableBidders,
  insertBiddersData,
  loginBidders,
  getProfileData,
  updateBiddersProfileImage,
} = require("../database/queries");
const validateEmail = require("../middleware/validateEmail");

const {
  generateUniqueId,
  generateHashpassword,
  validateHashpassword,
} = require("../utils/utils");
const db_config = require("../database/cloudsql");

// JWT Secret
const secretToken = process.env.JWT_SECRET;

// Bidder's authentication
// [name, email, registration, address, password]
router.post("/signup", validateEmail, async (request, response) => {
  const { name, email, registration, address, password } = request.body;
  if (!name || !email || !registration || !address || !password) {
    response.status(400).json({ message: "bad request" });
    return;
  }
  // Encrypt the Password
  const hashPassword = await generateHashpassword(password);

  try {
    const db = mysql.createConnection(db_config);
    db.query(createNewTableBidders, (error, result) => {
      if (error) {
        response.status(500).json({ message: error });
        return;
      }

      db.query(
        insertBiddersData,
        [name, email, registration, address, hashPassword],
        (error, rows) => {
          if (error) {
            if (error.code === "ER_DUP_ENTRY") {
              response.status(400).json({ message: "data already exists" });
              return;
            }
            response.status(500).json({ message: error });
            return;
          }
          response.status(200).json({ message: "registration successful" });

          db.end((error) => {
            if (error) {
              response.status(500).json({ message: error });
              return;
            }
          });
        }
      );
    });
  } catch (error) {
    response.status(500).json({ message: error });
    return;
  }
});

// Bidder's login [Email , Password]
router.post("/login", validateEmail, async (request, response) => {
  const { email, password } = request.body;
  if (!email || !password) {
    response.status(400).json({ message: "bad request" });
    return;
  }

  try {
    const db = mysql.createConnection(db_config);

    db.query(loginBidders, [email], async (error, result) => {
      if (error) {
        response.status(500).json({ message: error });
        return;
      }

      // Validate User password
      const isPasswordValid = await validateHashpassword(
        password,
        result[0].password.toString(),
        password
      );

      // If not valid
      if (!isPasswordValid) {
        response.status(400).json({ message: "invalid credentials" });
        return;
      }

      // Generate JWT Token
      const username = result[0].name;
      const registration = result[0].registration;
      const token = jwt.sign({ username, registration, email }, secretToken);

      response.cookie("authorization", `bearer ${token}`, {
        secure: true,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 Hours
      });

      response.json({
        message: "logged in successfully",
        data: { username, email, registration },
      });

      db.end((error) => {
        if (error) {
          response.status(500).json({ message: error });
          return;
        }
      });
    });
  } catch (error) {
    response.status(500).json({ message: error });
    return;
  }
});

// Initialize Cloud Storage
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
});

const bucketName = process.env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);
// Process file
let processFile = multer({
  storage: multer.memoryStorage(),
});

// Bidder's Image upload to Google Cloud Storage
router.post(
  "/upload/image",
  processFile.single("file"),
  authorization,
  (request, response) => {
    // If there is no image file
    if (!request.file) {
      response.status(400).json({ message: "no image found" });
      return;
    }

    // Get user payload
    const payload = request.bidder;
    if (!payload.email) {
      response.status(500).json({ message: "try again" });
      return;
    }

    // Check the file extension // Only JPEG, JPG, PNG are allowed
    const fileExt = request.file.originalname.split(".")[1];
    if (fileExt !== "jpeg" && fileExt !== "png" && fileExt !== "jpg") {
      response
        .status(401)
        .json({ message: "only jpeg, jpg, png files are allowed" });
      return;
    }

    // Check file size // Maximum limit 2MB
    const imageSize = request.file.size / 1024 / 1024;
    if (imageSize > 2) {
      response.status(401).json({ message: "Maximum 2MB images are allowed" });
      return;
    }

    // Create a new blob
    const blob = bucket.file(request.file.originalname);
    const blobStream = blob.createWriteStream({ resumable: false });

    blobStream.on("error", (err) => {
      response.status(500).json({ message: err.message });
      return;
    });

    blobStream.on("finish", async () => {
      const id = generateUniqueId(10);
      const newFileName = `${id}.${fileExt}`;

      try {
        const publicURL = format(
          `https://storage.googleapis.com/${bucket.name}/${newFileName}`
        );

        // Rename the file with unique string
        await bucket.file(request.file.originalname).rename(newFileName);

        // Make the file public
        await bucket.file(newFileName).makePublic();

        const db = mysql.createConnection(db_config);
        db.query(
          updateBiddersProfileImage,
          [publicURL, payload.email],
          (error, rows) => {
            if (error) {
              response.status(400).json({ message: error });
              return;
            }

            // Return the URL for public access
            response.json({
              message: "Image uploaded successsfully",
              url: publicURL,
            });

            db.end((error) => {
              if (error) {
                response.status(500).json({ message: error });
                return;
              }
            });
          }
        );
      } catch (error) {
        response.status(500).json({ message: error });
      }
    });
    blobStream.end(request.file.buffer);
  }
);

// Get Bidders data // Profile Data
router.get("/user", authorization, (request, response) => {
  const userPayload = request.bidder;
  if (!userPayload.email) {
    response.status(400).json({ message: "unable to fetch data" });
    return;
  }
  const db = mysql.createConnection(db_config);
  db.query(getProfileData, [userPayload.email], async (error, result) => {
    if (error) {
      response.status(500).json({ message: error });
      return;
    }

    response.status(200).json({ message: result });

    db.end((error) => {
      if (error) {
        response.status(500).json({ message: error });
        return;
      }
    });
  });
});

router.get("/data", authorization, (request, response) => {
  response.send(request.bidder);
});

module.exports = router;
