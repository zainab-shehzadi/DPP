const Stripe = require("stripe");
const dotenv = require("dotenv");
const User = require("../models/User");
// Load environment variables
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || ""); // Fallback for debugging

exports.createCheckoutSession = async (req, res) => {
  try {
    const { planType, planCycle, price, description, email } = req.body;

    // Step 1: Match the email in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    user.priceType = planType;
    user.priceCycle = planCycle;
    await user.save();

    // Ensure price is a valid number
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      throw new Error("Invalid price value");
    }

    // Ensure that the environment variable is correctly defined
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error(
        "FRONTEND_URL is not defined in the environment variables"
      );
    }

    // Create a checkout session with Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${planType} Plan (${planCycle})`,
              description,
            },
            unit_amount: parsedPrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontendUrl}/Dashboard`,
      cancel_url: `${frontendUrl}/cancel`,
    });

    // Return session ID
    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create checkout session" });
  }
};
