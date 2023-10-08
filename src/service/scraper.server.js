const { default: axios } = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer-core");

let self = {
  scrapeAmazonProduct: async (url) => {
    if (!url) return;

    // let browser;
    try {
      console.log("Connecting to Scraping Browser...");
      browser = await puppeteer.connect({
        browserWSEndpoint:
          "wss://brd-customer-hl_a4990c2e-zone-scraping_browser1:etuj4fqsky35@brd.superproxy.io:9222",
      });

      const page = await browser.newPage();
      console.log("Connected! Navigating to https://example.com...");
      await page.goto(url);
      console.log("Navigated! Scraping page content...");
      const pageData = await page.evaluate(() => {
        return {
          html: document.documentElement.innerHTML,
        };
      });

      // load page dom using cheerio
      const $ = cheerio.load(pageData.html);

      // extract the product info
      const title = $("#productTitle").text().trim();
      const currentPrice = self.extractPrice(
        $(".priceToPay span.a-price-whole"),
        $(".a.size.base.a-color-price"),
        $(".a-button-selected .a-color-base")
      );

      const originalPrice = self.extractPrice(
        $("#priceblock_ourprice"),
        $(".a-price.a-text-price span.a-offscreen"),
        $("#listPrice"),
        $("#priceblock_dealprice"),
        $(".a-size-base.a-color-price")
      );
      const outOfStock =
        $("#availability span").text().trim().toLowerCase() ===
        "currently unavailable";

      const images =
        $("#imgBlkFront").attr("data-a-dynamic-image") ||
        $("#landingImage").attr("data-a-dynamic-image") ||
        "{}";

      const imageUrls = Object.keys(JSON.parse(images));

      const currency = self.extractCurrency($(".a-price-symbol"));
      const discountRate = $(".savingsPercentage").text().replace(/[-%]/g, "");

      // const description = self.extractDescription($);

      return {
        url,
        currency: currency || "$",
        image: imageUrls[0],
        title,
        currentPrice: Number(currentPrice) || Number(originalPrice),
        originalPrice: Number(originalPrice) || Number(currentPrice),
        priceHistory: [],
        discountRate: Number(discountRate),
        category: "category",
        reviewsCount: 100,
        stars: 4.5,
        isOutOfStock: outOfStock,
        // description,
        lowestPrice: Number(currentPrice) || Number(originalPrice),
        highestPrice: Number(originalPrice) || Number(currentPrice),
        averagePrice: Number(currentPrice) || Number(originalPrice),
      };
    } catch (e) {
      console.error("run failed", e);
    } finally {
      await browser?.close();
    }
  },

  scrapeAndStoreProduct: async (productUrl) => {
    if (!productUrl) return;

    try {
      const scrapedProduct = await self.scrapeAmazonProduct(productUrl);
      return scrapedProduct;
    } catch (error) {
      throw new Error(`Failed to create/update product: ${error.message}`);
    }
  },

  // Extracts and returns the price from a list of possible elements.
  extractPrice: (...elements) => {
    for (const element of elements) {
      const priceText = element.text().trim();

      if (priceText) {
        const cleanPrice = priceText.replace(/[^\d.]/g, "");

        let firstPrice;

        if (cleanPrice) {
          firstPrice = cleanPrice.match(/\d+\.\d{2}/)?.[0];
        }

        return firstPrice || cleanPrice;
      }
    }

    return "";
  },

  // Extracts and returns the currency symbol from an element.
  extractCurrency: (element) => {
    const currencyText = element.text().trim().slice(0, 1);
    return currencyText || "";
  },

  // Extracts description from two possible elements from amazon
  extractDescription: ($) => {
    // these are possible elements holding description of the product
    const selectors = [
      ".a-unordered-list .a-list-item",
      ".a-expander-content p",
      // Add more selectors here if needed
    ];

    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        const textContent = elements
          .map((element) => $(element).text().trim())
          .get()
          .join("\n");
        return textContent;
      }
    }

    // If no matching elements were found, return an empty string
    return "";
  },
  getHightestPrice: (priceList) => {
    let highestPrice = priceList[0];

    for (let i = 0; i < priceList.length; i++) {
      if (priceList[i].price > highestPrice.price) {
        highestPrice = priceList[i];
      }
    }

    return highestPrice.price;
  },

  getLowestPrice: (priceList) => {
    let lowestPrice = priceList[0];

    for (let i = 0; i < priceList.length; i++) {
      if (priceList[i].price < lowestPrice.price) {
        lowestPrice = priceList[i];
      }
    }

    return lowestPrice.price;
  },

  getAveragePrice: (priceList) => {
    const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
    const averagePrice = sumOfPrices / priceList.length || 0;

    return averagePrice;
  },

  formatNumber: (num) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  },
};

module.exports = self;
