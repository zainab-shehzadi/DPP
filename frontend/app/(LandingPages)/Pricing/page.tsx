"use client";

import React, { useState ,useEffect} from "react";
import { loadStripe } from "@stripe/stripe-js";


type SubscribeProps = {
  planType: string;
  planCycle: string;
  price: string;
  description: string;
};

const SubscribeComponent: React.FC<SubscribeProps> = ({ planType, planCycle, price, description }) => {
  const [email, setEmail] = useState<string | null>(null); // Email from localStorage


    // Helper function to get cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };
  
    useEffect(() => {
      // Retrieve email from cookies on component mount
      const storedEmail = getCookie("email");
      if (storedEmail) {
        setEmail(storedEmail); // Set the email state if found in cookies
      }
    }, []);
  const handleSubmit = async () => {
    try {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);
  
      if (!stripe) {
        console.error("Stripe failed to load.");
        return;
      }
      // Make sure email is available before sending the request
      if (!email) {
        console.error("Email is not available.");
        return;
      }
      const body = {
        planType,
        planCycle,
        price,
        description,
        email, // Send email to the backend

      };
  
      const headers = {
        "Content-Type": "application/json",
      };
      console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/stripe/checkout`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });
 
      if (!response.ok) {
        console.error("Failed to create checkout session:", response.statusText);
        return;
      }
  
      const session = await response.json();
  
      if (!session || !session.id) {
        console.error("Invalid session data:", session);
        return;
      }
  
      const result = await stripe.redirectToCheckout({ sessionId: session.id });
  
      if (result.error) {
        console.error("Error during Stripe redirection:", result.error.message);
      }
    } catch (error) {
      console.error("Error in makePayment function:", error);
    }
  };
  return (
   <div className="mt-4 relative overflow-hidden">
  <button
    onClick={handleSubmit}
    className="relative mt-4 w-full bg-white text-black py-3 font-bold rounded-md border-2 border-black overflow-hidden group"
  >
    Get Started
    {/* Ripple Effect */}
    <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition duration-300"></span>
  </button>
</div>

  );
};

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<"Annual" | "Bi-Annual">("Annual");

  const toggleBillingCycle = () => {
    setBillingCycle((prev) => (prev === "Annual" ? "Bi-Annual" : "Annual"));
  };

  const plans = [
    {
      type: "Basic",
      price: billingCycle === "Annual" ? "39" : "45",
      description: `
        ✔ Private lists
        ✔ Enhanced email sending
        ✔ No seat limits
        ✔ Up to 3 seats
      `,
    },
    {
      type: "Pro",
      price: billingCycle === "Annual" ? "59" : "65",
      description: `
        ✔ Fully adjustable permissions
        ✔ Advanced data enrichment
        ✔ Priority support
        ✔ Up to 3 seats
      `,
    },
    {
      type: "Enterprise",
      price: billingCycle === "Annual" ? "129" : "139",
      description: `
        ✔ Unlimited reporting
        ✔ SAML and SSO
        ✔ Custom billing
        ✔ Up to 3 seats
      `,
    },
  ];

  return (
    <div className="bg-gray-20 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <header className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Pricing and Plans</h1>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-base sm:text-lg">
          Select a plan that best fits your needs. Flexible billing cycles for your convenience.
        </p>
        <div className="flex justify-center items-center gap-6 mt-6">
          <span className="text-gray-600 text-base sm:text-lg">Bi-Annual</span>
          <div
            className="relative w-20 h-10 bg-[#002F6C] rounded-full cursor-pointer flex items-center"
            onClick={toggleBillingCycle}
          >
            <div
              className={`absolute w-8 h-8 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                billingCycle === "Annual" ? "translate-x-10" : "translate-x-0"
              }`}
            ></div>
          </div>
          <span className="text-gray-600 text-base sm:text-lg">Annual</span>
        </div>
      </header>

      {/* Pricing Cards Section
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full">
        {plans.map((plan) => (
          <div
            key={plan.type}
            className={`p-6 sm:p-8 shadow-lg rounded-lg ${
              plan.type === "Pro" ? "bg-[#002F6C] text-white relative" : "bg-white"
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-bold">{plan.type}</h2>
            <p className="mt-4">
              <span className="text-3xl sm:text-4xl font-extrabold">${plan.price}</span>
              <br />
              <span>per user/{billingCycle === "Annual" ? "year" : "bi-annual"}</span>
            </p>
            <ul className="mt-6 space-y-4 text-base sm:text-lg">
              {plan.description
                .trim()
                .split("\n")
                .map((item, idx) => (
                  <li key={idx}>{item.trim()}</li>
                ))}
            </ul>
            <SubscribeComponent
              planType={plan.type}
              planCycle={billingCycle}
              price={plan.price}
              description={plan.description}
            />
          </div>
        ))}
      </div> */}
      {/* Pricing Cards Section */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full">
  {plans.map((plan) => (
    <div
      key={plan.type}
      className={`p-6 sm:p-8 shadow-lg rounded-lg ${
        plan.type === "Pro" ? "bg-[#002F6C] text-white relative" : "bg-white"
      }`}
    >
      <h2 className="text-xl sm:text-2xl font-bold">{plan.type}</h2>

      {/* Pricing Section */}
      <p className="mt-4 flex items-center space-x-2">
        <span className="text-3xl sm:text-4xl font-extrabold">${plan.price}</span>

        {/* Show Discount Badge when Annual */}
        {billingCycle === "Annual" && (
          <span
            className={`text-white text-sm font-bold px-2 py-1 rounded-md ${
              plan.type === "Pro" ? "bg-[#629E1B]" : "bg-gray-300"
            }`}
          >
            -15%
          </span>
        )}
      </p>

      <p>per user/month, billed {billingCycle === "Annual" ? "annually" : "bi-annually"}</p>

      {/* Features List */}
      <ul className="mt-6 space-y-4 text-base sm:text-lg">
        {plan.description
          .trim()
          .split("\n")
          .map((item, idx) => (
            <li key={idx} className="flex items-center space-x-2">
              {/* Conditional tick color */}
             
              <span>{item.trim()}</span>
            </li>
          ))}
      </ul>

      {/* Subscribe Button */}
      <SubscribeComponent
        planType={plan.type}
        planCycle={billingCycle}
        price={plan.price}
        description={plan.description}
      />
    </div>
  ))}
</div>

    </div>
  );
};

export default Pricing;
