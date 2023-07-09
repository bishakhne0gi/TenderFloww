const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
require("dotenv").config();

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const port = process.env.PORT || "5000";

app.use(require("./routes/bidders.js"));
app.use(require("./routes/tender.js"));

app.get("/", (request, response) => {
  response.status(200).json({
    name: "tenderflow",
    type: "nodejs-server",
    status: "running",
  });
});

app.listen(port, () => {
  console.log(`Server is running at : http://localhost:${port}`);
});
