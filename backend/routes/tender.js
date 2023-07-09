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
  const { name, description, criteria, tender_id, opening_date, closing_date } =
    request.body;

  if (
    !name ||
    !description ||
    !criteria ||
    !tender_id ||
    !opening_date ||
    !closing_date
  ) {
    response
      .status(401)
      .json({ message: "please fill all the mandatory input fields." });
    return;
  }

  const currentDate = new Date();
  const openingDate = new Date(opening_date);
  const closingDate = new Date(closing_date);

  // Check Opening & closing date is valid or not
  if (openingDate <= currentDate) {
    response.status(401).json({
      message: "the opening date cannot be greater than the current date",
    });
    return;
  }

  if (openingDate >= closingDate) {
    response.status(401).json({
      message: "the opening date cannot be greater than the closing date",
    });
    return;
  }

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
        [name, tender_id, description, criteria, opening_date, closing_date],
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
