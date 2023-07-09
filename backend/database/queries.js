// Create New Table Bidders if not exists
exports.createNewTableBidders = `CREATE TABLE IF NOT EXISTS bidders (
    name VARCHAR(64), 
    email VARCHAR(128) UNIQUE, 
    registration BIGINT UNIQUE, 
    address VARCHAR(256), 
    photo VARCHAR(256), 
    password BINARY(60));`;

// Insert Bidder's data during signup
exports.insertBiddersData = `INSERT INTO bidders (name, email, registration,  address, password) VALUES (?, ?, ?, ?, ?);`;

// Bidder's login
exports.loginBidders = `SELECT name, registration, password FROM bidders WHERE email=?`;

// Get Bidder's profile data 
exports.getProfileData = `SELECT name, email, registration, address, photo FROM bidders WHERE email=? ;`;

// Create New Table Tenders if not exists
exports.createNewTableTenders = `CREATE TABLE IF NOT EXISTS tenders (
    name VARCHAR(128) NOT NULL, 
    id VARCHAR(128) NOT NULL, 
    description MEDIUMTEXT NOT NULL, 
    criteria TEXT NOT NULL, 
    opening_date DATE NOT NULL, 
    closing_date DATE NOT NULL, 
    flow_closing_price INT, 
    winner_email VARCHAR(128)
);`;

// Insert Tender's data
exports.insertTendersData = `INSERT INTO tenders (name, id, description, criteria, opening_date, closing_date) VALUES (?, ?, ?, ?, ?, ?);`;

// Display All Tender's data
exports.displayAllTendersData = `SELECT * FROM tenders`;


// Update Bidder's profile image
exports.updateBiddersProfileImage = `UPDATE bidders SET photo = ? WHERE email = ?;`;