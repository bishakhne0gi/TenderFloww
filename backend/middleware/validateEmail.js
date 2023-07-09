const emailValidator = require("email-validator");

module.exports = (request, response, next) => {
  try {
    const { email } = request.body;
    if (!email) {
      response.status(400).json({ error: "please provide email" });
      return;
    }

    if (!emailValidator.validate(email)) {
      response.status(400).json({ error: "please provide valid email" });
      return;
    }
    next();
  } catch (error) {
    response.status(500).json({ error: error });
    return;
  }
};
