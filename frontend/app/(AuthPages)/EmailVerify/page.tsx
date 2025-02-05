"use client";
import React, { useState,useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // For navigation after successful reset
import "@fortawesome/fontawesome-free/css/all.min.css";
import Image2 from "@/components/imageright"; // Ensure the correct import path

const EmailVerify: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState<string[]>(Array(6).fill(""));
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string | null>(null); // Email from localStorage

  const router = useRouter();
  
  
  const handleInput = (value: string, index: number) => {
    const updatedCode = [...verificationCode];
    updatedCode[index] = value;
    setVerificationCode(updatedCode);

    // Auto-focus to the next input if the current one is filled
    if (value.length === 1 && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };
  useEffect(() => {
    // Retrieve email from localStorage on component mount
    const storedEmail = localStorage.getItem("email");
    setEmail(storedEmail);
  }, []);
  
  const handleVerifyToken = async () => {
    setLoading(true);
    setMessage("");

    const code = verificationCode.join(""); // Combine the 6-digit code
    if (code.length !== 6) {
      setMessage("Please enter all 6 digits.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/verify-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: code }), // Pass both email and token
      });
      

      const data = await response.json();

      if (response.ok) {
        setMessage("Verification successful!");
        setTimeout(() => {
          // Redirect to resetpassword with the email query parameter
          router.push(`/resetpassword?email=${encodeURIComponent(email || "")}`);
        }, 1000); // Optional delay for better UX
      } else {
        setMessage(data.message || "Verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-work-sans bg-gray-50">
      {/* Left Side: Email Verification Message */}
      <div className="flex flex-1 justify-center items-center bg-white">
        <div className="w-full max-w-md px-6 py-6 text-left">
          <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-gray-800 mb-4 text-left">
            Verify your Email
          </h2>
          <p className="text-medium text-gray-600 mb-8">
            We have sent a verification email to f****i@e***e.com.
          </p>

          {/* Verification Input Boxes */}
          <div className="flex justify-center items-center mb-8">
            {verificationCode.map((value, index) => (
              <input
                key={index}
                id={`code-input-${index}`}
                type="text"
                maxLength={1}
                value={value}
                className="w-12 h-12 border border-gray-300 rounded text-center text-xl mx-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleInput(e.target.value, index)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
                    const prevInput = document.getElementById(`code-input-${index - 1}`);
                    prevInput?.focus();
                  }
                }}
              />
            ))}
          </div>

          {message && <p className={`text-sm mb-4 ${message.includes("success") ? "text-green-500" : "text-red-500"}`}>{message}</p>}

         

          <p className="text-sm text-gray-500 mb-7 mt-8">
            Didn’t receive the email? Check the spam or promotions folder or try again.
          </p>
          <button
            className={`w-full py-3 ${loading ? "bg-gray-400" : "bg-[#002f6c]"} text-white font-semibold rounded-lg transition-colors text-sm sm:text-base md:text-lg`}
            onClick={handleVerifyToken}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>

          {/* Back to Login Button */}
          <Link href="/Login">
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

export default EmailVerify;
