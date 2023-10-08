const express = require("express");
const router = express.Router();

// routes
const scraper = require("./scraper");
const cron = require("./cron");
const product = require("./product");

router.get("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/scraper", scraper);
router.use("/cron", cron);
router.use("/product", product);

module.exports = router;
