const express = require("express");
const { generateUniqueId, generateUniqueTenderId } = require("../utils/utils");
const mysql = require("mysql");
const crypto = require("crypto");
const {
  createNewTableTenders,
  insertTendersData,
  displayAllTendersData,
  displayOneTenderData,
  createBiddingTable,
  placeBid,
  updateWinner,
  fetchExpWinner,
  updateWinnerExperience,
  fetchExpAndMailWinner,
  settleTender,
} = require("../database/queries");
const db_config = require("../database/cloudsql");
const authorization = require("../middleware/authorization");
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

  // const currentDate = new Date().getTime();
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
            if (error.code === "ER_DUP_ENTRY") {
              response
                .status(500)
                .json({ message: "tender with the id already exists" });
              return;
            }

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

// Display all the tenders
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

// Display a single tender
router.get("/tender/display?id", (request, response) => {
  if (!request.query.id) {
    response.status(500).json({ message: "unable to fetch tender" });
    return;
  }

  try {
    const db = mysql.createConnection(db_config);
    db.query(displayOneTenderData, [id], async (error, result) => {
      if (error) {
        response.status(500).json({ message: "unable to fetch tenders" });
        return;
      }
      if (result.length == 0) {
        response.status(400).json({ message: "no tender found with this id" });
      }
      response.status(200).json({ message: result[0] });

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

// Place a bid
router.post("/placebid", authorization, (request, response) => {
  const { tender_id, biddingAmount } = request.body;
  if (!tender_id || tender_id === "ERROR" || tender_id === "error") {
    response.status(400).json({ message: "something went wrong. Try again!" });
    return;
  }

  if (!biddingAmount) {
    response
      .status(400)
      .json({ message: "Please provide bidding amount to place bid" });
    return;
  }

  try {
    const db = mysql.createConnection(db_config);
    db.query(displayOneTenderData, [tender_id], (error, result) => {
      if (error) {
        response.status(500).json({ message: error });
        return;
      }
      let tenderData = result;

      if (result.length === 0) {
        response.status(500).json({ message: "invalid tender" });
        return;
      }

      if (request.bidder.experience < result[0]._minimumExp) {
        response
          .status(400)
          .json({ message: "you are not eligible to place bid." });
        return;
      }

      if (result[0].startPrice < biddingAmount) {
        response.status(400).json({
          message: "bidding amount must be equal or less than start price",
        });
        return;
      }

      db.query(createBiddingTable, (error, result) => {
        if (error) {
          response.status(500).json({ message: error });
          return;
        }
        let placedBid_id = crypto.randomBytes(15).toString("hex");
        if (!placedBid_id) {
          response.status(500).json({ message: "unable to place bid" });
          return;
        }

        db.query(
          placeBid,
          [placedBid_id, tender_id, request.bidder.email, biddingAmount],
          (error, result) => {
            if (error) {
              if (error.code === "ER_DUP_ENTRY") {
                response.status(400).json({
                  message: `You have already placed a bid in this tender`,
                  tender_id: tender_id,
                });
                return;
              }

              response.status(400).json({ message: error.code });
              return;
            }

            response.status(200).json({ message: "bid placed successfully" });

            // Update winner email if bidding amount is less than the current winner
            if (
              tenderData.currentMinDemand == null ||
              tenderData.currentMinDemand > biddingAmount
            );
            {
              db.query(
                updateWinner,
                [request.bidder.email, biddingAmount, tender_id],
                (error, result) => {
                  if (error) {
                    response.status(500).json({ message: error });
                    return;
                  }

                  db.end((error) => {
                    if (error) {
                      response.status(500).json({ message: error });
                      return;
                    }
                  });
                }
              );
            }
          }
        );
      });
    });
  } catch (error) {
    response.status(500).json({ message: error });
    return;
  }
});

// Auction Settle
router.post("/settle", (request, response) => {
  const { tender_id } = request.body;
  if (!tender_id) {
    response.status(400).json({ message: "no tender id found" });
    return;
  }
  // Fetch experience of Current Winner Email
  try {
    const db = mysql.createConnection(db_config);
    db.query(displayOneTenderData, [tender_id], (error, result) => {
      if (result.length == 0) {
        response
          .status(400)
          .json({ message: "no tender found with this tender id" });
        return;
      }

      let TenderWinningExperience = result[0]._exp;

      db.query(fetchExpAndMailWinner, [tender_id], (error, result) => {
        if (result.length == 0) {
          response.status(400).json({ message: "no bidder found" });
          return;
        }

        let updatedExperience = result[0].exp + TenderWinningExperience;
        let winnerEmail = result[0].email;

        db.query(settleTender, [tender_id], (error, result) => {
          if (error) {
            response.status(500).json({ message: error });
            return;
          }

          db.query(
            updateWinnerExperience,
            [updatedExperience, winnerEmail],
            (error, result) => {
              if (error) {
                response.status(500).json({ message: error });
                return;
              }
              response.status(200).json({
                message: "Successfully settled!",
                final_winner: winnerEmail,
              });

              db.end((error) => {
                if (error) {
                  response.status(500).json({ message: error });
                  return;
                }
              });
            }
          );
        });
      });
    });
  } catch (error) {
    response.status(500).json({ message: error });
    return;
  }
});
// Get NFTS of a bidder
module.exports = router;
