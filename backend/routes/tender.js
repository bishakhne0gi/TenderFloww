const express = require("express");
const { generateUniqueId, generateUniqueTenderId } = require("../utils/utils");
const mysql = require("mysql");
const {
  createNewTableTenders,
  insertTendersData,
  displayAllTendersData,
} = require("../database/queries");
const db_config = require("../database/cloudsql");
const router = express.Router();

// Generate New Tender Id
router.get("/tender/id", (request, response) => {
  // Generate UNIQUE Tender Id
  const tender_id = generateUniqueTenderId(10);
  if (!tender_id) {
    response.status(500).json({ message: "unable to generate id" });
    return;
  }

  response.status(200).json({ message: tender_id });
});

// Create New Tender
router.post("/tender/create", (request, response) => {
  const {
    _title,
    tender_id,
    _ipfsHash,
    _description,
    _minimumExp,
    _exp,
    opening_date,
    biddingLength,
    startPrice,
  } = request.body;

  if (
    !_title ||
    !tender_id ||
    !_ipfsHash ||
    !_description ||
    !_minimumExp ||
    !_exp ||
    !opening_date ||
    !biddingLength ||
    !startPrice
  ) {
    response
      .status(401)
      .json({ message: "please fill all the mandatory input fields." });
    return;
  }

  // const currentDate = new Date();
  // const openingDate = new Date(opening_date);

  // // Check Opening & closing date is valid or not
  // if (openingDate < currentDate) {
  //   response.status(401).json({
  //     message: "the opening date cannot be lesser than the current date",
  //   });
  //   return;
  // }

  try {
    const db = mysql.createConnection(db_config);
    // Run query for table creation if not exists
    db.query(createNewTableTenders, (error, result) => {
      if (error) {
        response.status(500).json({ message: error });
        return;
      }

      // Insert tender's data
      db.query(
        insertTendersData,
        [
          _title,
          tender_id,
          _ipfsHash,
          _description,
          _minimumExp,
          _exp,
          opening_date,
          biddingLength,
          startPrice,
        ],
        (error, rows) => {
          if (error) {
            response.status(500).json({ message: error });
            return;
          }
          response.json({ message: "tender created successfully" });

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
    if (error) {
      response.status(500).json({ message: error });
      return;
    }
  }
});

router.get("/tender/display", (request, response) => {
  try {
    const db = mysql.createConnection(db_config);
    db.query(displayAllTendersData, [], async (error, result) => {
      if (error) {
        response.status(500).json({ message: "unable to fetch tenders" });
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
  } catch (error) {
    response.status(500).json({ message: error });
    return;
  }
});

module.exports = router;
