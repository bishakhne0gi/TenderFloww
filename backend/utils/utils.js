const bcrypt = require("bcryptjs");

// Generate UNIQUE ID // 
const generateUniqueId = (length = 5) => {
  return (
    Date.now() +
    Math.random()
      .toString(36)
      .substring(2, length + 2)
  );
};

// Generate UNIQUE Tender ID // 
const generateUniqueTenderId = (length = 5) => {
  return (
    Math.random()
      .toString(36)
      .substring(2, length + 2)
  );
};

// Encrypt Password using bcrypt package
const generateHashpassword = async (originalPassword) => {
  try {
    const hashPassword = await bcrypt.hash(originalPassword, 10);
    return hashPassword;
  } catch (err) {
    console.error(err);
    return "";
  }
};

// Validate hash password
const validateHashpassword = async (originalPassword, hashPassword) => {
  try {
    const isValid = await bcrypt.compare(originalPassword, hashPassword);
    return isValid;
  } catch (err) {
    console.error(err);
    return false;
  }
};

module.exports = {
  generateUniqueId,
  generateUniqueTenderId,
  generateHashpassword,
  validateHashpassword,
};
