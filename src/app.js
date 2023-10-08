const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

require("dotenv").config();

const api = require("./api");
const connectToDB = require("./database");

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/api", api);

connectToDB()
  .then(() => {
    console.log("Database Connected!");
  })
  .catch(() => {
    console.log("Invalid Database Connection...!");
  });

module.exports = app;
