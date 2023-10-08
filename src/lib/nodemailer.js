const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const Notification = {
  WELCOME: "WELCOME",
  CHANGE_OF_STOCK: "CHANGE_OF_STOCK",
  LOWEST_PRICE: "LOWEST_PRICE",
  THRESHOLD_MET: "THRESHOLD_MET",
};

const self = {
  generateEmailBody: (product, type) => {
    const THRESHOLD_PERCENTAGE = 40;
    // Shorten the product title
    const shortenedTitle =
      product.title.length > 20
        ? `${product.title.substring(0, 20)}...`
        : product.title;

    let subject = "";
    let body = "";

    switch (type) {
      case Notification.WELCOME:
        subject = `Welcome to Price Tracking for ${shortenedTitle}`;
        body = `
            <div>
              <h2>Welcome to PriceWise 🚀</h2>
              <p>You are now tracking ${product.title}.</p>
              <p>Here's an example of how you'll receive updates:</p>
              <div style="border: 1px solid #ccc; padding: 10px; background-color: #f8f8f8;">
                <h3>${product.title} is back in stock!</h3>
                <p>We're excited to let you know that ${product.title} is now back in stock.</p>
                <p>Don't miss out - <a href="${product.url}" target="_blank" rel="noopener noreferrer">buy it now</a>!</p>
                <img src="https://i.ibb.co/pwFBRMC/Screenshot-2023-09-26-at-1-47-50-AM.png" alt="Product Image" style="max-width: 100%;" />
              </div>
              <p>Stay tuned for more updates on ${product.title} and other products you're tracking.</p>
            </div>
          `;
        break;

      case Notification.CHANGE_OF_STOCK:
        subject = `${shortenedTitle} is now back in stock!`;
        body = `
            <div>
              <h4>Hey, ${product.title} is now restocked! Grab yours before they run out again!</h4>
              <p>See the product <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
            </div>
          `;
        break;

      case Notification.LOWEST_PRICE:
        subject = `Lowest Price Alert for ${shortenedTitle}`;
        body = `
            <div>
              <h4>Hey, ${product.title} has reached its lowest price ever!!</h4>
              <p>Grab the product <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a> now.</p>
            </div>
          `;
        break;

      case Notification.THRESHOLD_MET:
        subject = `Discount Alert for ${shortenedTitle}`;
        body = `
            <div>
              <h4>Hey, ${product.title} is now available at a discount more than ${THRESHOLD_PERCENTAGE}%!</h4>
              <p>Grab it right away from <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
            </div>
          `;
        break;

      default:
        throw new Error("Invalid notification type.");
    }

    return { subject, body };
  },

  sendEmail: (emailContent, sendTo) => {
    let config = {
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    };

    let transporter = nodemailer.createTransport(config);

    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "Mailgen",
        link: "https://mailgen.js/",
      },
    });

    let emailBody = MailGenerator.generate(email);

    let message = {
      from: process.env.EMAIL, // sender address
      to: sendTo, // list of receivers
      subject: emailContent.subject,
      html: emailContent.body,
    };

    // send mail
    transporter
      .sendMail(message)
      .then(() => {
        return res
          .status(200)
          .send({ msg: "You should receive an email from us." });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send({ error });
      });
  },
};

module.exports = self;
