const express = require("express");
const Product = require("../models/product.model");
const {
  scrapeAmazonProduct,
  getLowestPrice,
  getHightestPrice,
  getAveragePrice,
  getEmailNotificationType,
} = require("../service/scraper.server");
const { generateEmailBody, sendEmail } = require("../lib/nodemailer");

const router = express.Router();

router.get("/script-update-product-price", async (req, res) => {
  const products = await Product.find({});

  if (!products.length) {
    return res.status(500).send({ error: "No product fetched" });
  }

  // ======================== 1 SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
  const updatedProducts = await Promise.all(
    products.map(async (currentProduct) => {
      // Scrape product
      const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

      if (!scrapedProduct) {
        return res
          .status(500)
          .send({ error: "Something wrong while scraping product detail" });
      }

      const updatedPriceHistory = [
        ...currentProduct.priceHistory,
        {
          price: scrapedProduct.currentPrice,
        },
      ];

      const product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHightestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };

      // Update Products in DB
      const updatedProduct = await Product.findOneAndUpdate(
        {
          url: product.url,
        },
        product
      );

      return updatedProduct;
    })
  );
});

module.exports = router;
