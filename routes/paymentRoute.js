const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const {
  paymentIntent,
  sentPublishablekey,
} = require("../controllers/paymentController");
const router = express.Router();

router.route("/payment/process").post(isAuthenticated, paymentIntent);

module.exports = router;
