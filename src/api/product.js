const express = require("express");
const {
  scrapeAndStoreProduct,
  getLowestPrice,
  getHightestPrice,
  getAveragePrice,
} = require("../service/scraper.server");
const Product = require("../models/product.model");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.find({});

    return res.status(201).send(products);
  } catch (error) {
    return res.status(500).send({ error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ _id: id });

    return res.status(201).send(product);
  } catch (error) {
    return res.status(500).send({ error });
  }
});

router.get("/get-similar-products/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const currentProduct = await Product.findOne({ _id: productId });

    if (!currentProduct) {
      return res.status(400).send({ error: "Product can not found!" });
    }

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);

    return res.status(201).send(similarProducts);
  } catch (error) {
    return res.status(500).send({ error });
  }
});

module.exports = router;
