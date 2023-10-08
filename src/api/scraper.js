const express = require("express");
const {
  scrapeAndStoreProduct,
  getLowestPrice,
  getHightestPrice,
  getAveragePrice,
} = require("../service/scraper.server");
const Product = require("../models/product.model");

const router = express.Router();

router.post("/scrape-and-store-product", async (req, res) => {
  try {
    const { url } = req.body;

    const scrapedProduct = await scrapeAndStoreProduct(url);

    if (!scrapedProduct) {
      return res.status(500).send({ error: "Unable to scrape product info" });
    }

    const product = scrapedProduct;

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if (existingProduct) {
      const updatedPriceHistory = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHightestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    return res.status(201).send(newProduct);
  } catch (error) {
    return res.status(500).send({ error });
  }
});

module.exports = router;
