const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET;

module.exports = (request, response, next) => {
  try {
    authorization = request.cookies.authorization;
    if (!authorization) {
      response.status(401).json({ message: "Authorization failed" });
      return;
    }

    const token = authorization.split(" ")[1];

    jwt.verify(token, secretKey, (error, payload) => {
      if (error) {
        response.status(401).json({ message: error });
        return;
      }

      request.bidder = payload;
      next();
    });
  } catch (error) {
    response.status(500).json({ message: "Authorization failed" });
    return;
  }
};
