const Stripe = require('stripe');
const dotenv = require('dotenv');
const User = require("../models/User");
// Load environment variables
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || ''); // Fallback for debugging


exports.createCheckoutSession = async (req, res) => {
  try {
    const { planType, planCycle, price, description,email } = req.body;
    console.log("Incoming request body:", req.body);

 // Step 1: Match the email in the database
 const user = await User.findOne({ email });
 if (!user) {
   return res.status(404).json({ error: "User not found." });
 }
// Step 2: Save pricing information (priceType and priceCycle) to the user's record
user.priceType = planType ; // Assuming priceType is a field in your User model
user.priceCycle = planCycle;    // Assuming priceCycle is a field in your User model
await user.save();

    // Ensure price is a valid number
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      throw new Error("Invalid price value");
    }

    // Ensure that the environment variable is correctly defined
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not defined in the environment variables");
    }

    // Create a checkout session with Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd", // You can modify this to the required currency
            product_data: {
              name: `${planType} Plan (${planCycle})`,
              description,
            },
            unit_amount: parsedPrice * 100, // Convert price to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontendUrl}/success`,
      cancel_url: `${frontendUrl}/cancel`,
    });

    // Return session ID
    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message || "Failed to create checkout session" });
  }
};


