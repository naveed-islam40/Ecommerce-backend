const asyncHandler = require("../middleware/asyncHandler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const paymentIntent = asyncHandler(async (req, res, next) => {
  try {
    const payment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "usd",
      metadata: {
        company: "E-commerce",
      },
    });

    res.status(200).json({ clientSecret: payment.client_secret });
  } catch (error) {
    console.error(error.message);
  }
});

module.exports = {
  paymentIntent,
};
