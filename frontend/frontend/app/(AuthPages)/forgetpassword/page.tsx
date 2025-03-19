"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Image2 from "@/components/imageright"; // Ensure the correct import path
import { toast } from "react-toastify";
import authPublicRoutes from "@/hoc/authPublicRoutes";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");


  const router = useRouter();


  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
   

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password reset email sent successfully!", { position: "top-right" });

        setTimeout(() => {
          router.push(`/EmailVerify`);
        }, 1000);
      } else {
        toast.error(data.message || "Failed to send reset email.", { position: "top-right" });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.", { position: "top-right" });
    }
  };
  return (
    <div className="flex h-screen font-work-sans bg-black-50">
      {/* Left Side: Forgot Password Form */}
      <div className="flex flex-1 justify-center items-center bg-white">
        <div className="w-full max-w-md px-6 py-6 text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-left">
            Forgot Your Password
          </h2>

          <p className="text-sm sm:text-base md:text-base text-medium text-black-600 mb-3">
            Enter the email you used to create your account so we can send you instructions on how to reset your password.
          </p>

          <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
  {/* Email Input */}
  <div className="mb-3">
    <label className="block text-sm sm:text-base md:text-lg font-bold text-gray-700 mb-1">
      Email
    </label>
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
      className="w-full px-3 py-2 text-sm sm:text-base md:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  <button
    type="submit" // Changed to submit for form submission
    className="w-full py-3 bg-[#002f6c] text-white font-semibold rounded-lg transition-colors text-sm sm:text-base md:text-lg"
  >
    Send
  </button>
</form>


          {/* Back to Login Button */}
          <Link href="/login">
            <button
              type="button"
              className="w-full px-3 py-2 border border-black-300 rounded-lg font-bold focus:outline-none mt-8 text-sm sm:text-base md:text-lg hover:bg-gray-100 transition-colors"
            >
              Back to Login
            </button>
          </Link>
        </div>
      </div>

      {/* Right Side: Image with Quote */}
      <Image2 />
    </div>
  );
};

export default authPublicRoutes(ForgotPassword);
