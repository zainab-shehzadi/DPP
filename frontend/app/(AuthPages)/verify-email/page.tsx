"use client";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { toast } from "react-toastify";

import Image2 from "@/components/imageright";
import authPublicRoutes from "@/hoc/authPublicRoutes";
const verifyemail: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedEmail = Cookies.get("email");
    setEmail(storedEmail);
  }, []);

  // const handleVerifyToken = async () => {
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/forgot-password`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ email }),
  //       }
  //     );

  //     const data = await response.json();

  //     if (response.ok) {
  //       toast.success("Email sent successfully!", { position: "top-right" });
  //       router.push(`/Emailverify2`);
  //     } else {
  //       toast.error(data.message || "Failed to send reset email.", {
  //         position: "top-right",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //     toast.error("An error occurred. Please try again.", {
  //       position: "top-right",
  //     });
  //   }
  // };
  const handleVerifyToken = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Email sent successfully!", { position: "top-right" });
        setTimeout(() => {
          router.push(`/Emailverify2`);
        }, 1500);
      } else {
        toast.error(data.message || "Failed to send reset email.", {
          position: "top-right",
        });
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.", {
        position: "top-right",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-work-sans bg-black-50">
      {/* Left Side: Login Form */}
      <div className="flex flex-1 justify-center items-center bg-white">
        <div className="w-full max-w-md px-6 py-6 text-left">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Verify your Email
          </h2>

          <p className="text-medium text-gray-600  mb-10">
            We have sent an email with code information to{" "}
            <span className="font-bold">{email}</span>.
          </p>

          <p
            className="text-sm text-black-500 font-bold mb-5"
            style={{ marginTop: "12rem" }}
          >
            Didn’t receive the email? Check spam or promotion folder or
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#002f6c] hover:bg-blue-700"
            }`}
            onClick={handleVerifyToken}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>

          <Link href="/login">
            <button
              type="button"
              className="w-full px-3 py-2 border border-black-300 rounded-lg font-weight: 700 focus:outline-none mt-5 font-semibold"
            >
              Back to login
            </button>
          </Link>
        </div>
      </div>

      {/* Right Side: Image with Quote */}
      <Image2 />
    </div>
  );
};

export default authPublicRoutes(verifyemail);
