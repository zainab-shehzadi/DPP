"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image2 from "@/components/imageright"; // Ensure the correct import path

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string>("");

  const router = useRouter();

  // Helper function to set cookies
  const setCookie = (name: string, value: string, days = 7) => {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${value}; path=/; expires=${expires}; secure`;
  };

  // Helper function to get cookies
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  
    try {
      // Send login request to the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      console.log(data);
  
      // Check if the login was successful
      if (response.ok) {
        setMessage("Login successful!"); // Set the success message
        console.log(data);
  
        setCookie("accesstoken", data.accessToken); 
        setCookie("token", data.token); 
        setCookie("email", data.email); 
        setCookie("role", data.role);   
        setCookie("DepartmentName", data.DepartmentName);
        setCookie("priceType", data.priceType); 
        setCookie("priceCycle", data.priceCycle); 

        const storedEmail = getCookie("email");
        const storedRole = getCookie("role");
        const priceType = getCookie("priceType");
        const priceCycle = getCookie("priceCycle");
        const access_cookie =getCookie("accessToken");

        console.log("sadfhksj" ,access_cookie);
        if (storedEmail && storedRole) {
          // Check if priceCycle is "Annual" or "Bi-Annual"
          if (priceCycle === "Annual" || priceCycle === "Bi-Annual") {
            // If priceCycle is valid, redirect to Dashboard
            setTimeout(() => {
              router.push(`/Dashboard`);
            }, 2000);
          } else if (priceCycle === null || priceCycle === "null") {
            // If priceCycle is null, redirect to Subscription Plan page
            setTimeout(() => {
              router.push(`/SubscriptionPlan`);
            }, 2000);
          }
        
        } else {
          setMessage("Email or role is missing. Please log in again.");
        }
        
        
      } else {
        setMessage(data.message || "Login failed!");  
      }
  
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again."); // Show error message on failure
    }
  };
  const handleGoogleLogin = async () => {
    try {
      // Fetch the Google Auth URL from the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/calendar/auth-url`);
      if (!response.ok) {
        throw new Error("Failed to fetch Google Auth URL.");
      }
  
      const data = await response.json();
      if (data.authUrl) {
        // Redirect the user to the Google login page
        window.location.href = data.authUrl;
      } else {
        console.error("Google Auth URL not provided in the response.");
      }
    } catch (error) {
      console.error("Error during Google login");
    }
  };
  

  
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log("Email:", email);
  //   console.log("Password:", password);
  
  //   try {
  //     // Send login request to the backend
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/login`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ email, password }),
  //     });
  
  //     const data = await response.json();
  //      console.log(data);
  //     // Check if the login was successful
  //     if (response.ok) {
  //       setMessage("Login successful!"); // Set the success message
  //       console.log(data);

  //       // Save token, email, and role to cookies
        
  //       setCookie("token", data.token); // Store the token securely
  //       setCookie("email", data.email); // Store the email
  //       setCookie("role", data.role);   // Store the role
  //       setCookie("DepartmentName", data.DepartmentName);
  //       // Get email and role from cookies
  //       const storedEmail = getCookie("email");
  //       const storedRole = getCookie("role"); // Get the role from cookies
  //       const dep = getCookie("DepartmentName");
  //       console.log(dep);
  //       if (storedEmail && storedRole) {
  //         // Set a timer of 2 seconds (2000 ms) before redirecting to the Dashboard
  //         setTimeout(() => {
  //           router.push(`/SubscriptionPlan`);
  //         }, 2000);  // 2000 ms = 2 seconds
  //       } else {
  //         setMessage("Email or role is missing. Please log in again.");  // Set the error message if email or role is missing
  //       }
  //     } else {
  //       setMessage(data.message || "Login failed!");  // Set the error message if login fails
  //     }

  //   } catch (error) {
  //     console.error("Error:", error);
  //     setMessage("An error occurred. Please try again."); // Show error message on failure
  //   }
  // };

  // Hide the message after 2 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(""); // Clear the message after 2 seconds
      }, 2000);
      return () => clearTimeout(timer); // Cleanup the timer on unmount
    }
  }, [message]);

  return (
    <div className="flex h-screen font-work-sans bg-gray-50">
      {/* Left Side: Login Form */}
      <div className="flex flex-1 justify-center items-center bg-white ">
        <div className="w-full max-w-md px-6 py-6 text-left">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-left">Log In</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Input Field */}
            <div className="mb-4">
              <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>

            {/* Password Input Field */}
            <div className="mb-4">
              <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right mb-1">
              <Link
                href="/forgetpassword"
                className="text-sm sm:text-base text-blue-900 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#002f6c] text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors text-sm sm:text-base"
            >
              Sign in
            </button>
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="px-4 text-gray-500">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Button */}
          <div className="flex gap-4">
            {/* Google Button */}
            {/* <button className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-[#ffffff] hover:text-black transition-colors">
              <FaGoogle className="mr-3 text-2xl text-[#df837a] hover:text-white" />
              <span className="ml-2">Log In With Google</span>
            </button> */}
{/* Google Button */}
<button
  onClick={handleGoogleLogin}
  className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-[#ffffff] hover:text-black transition-colors"
>
  <FaGoogle className="mr-3 text-2xl text-[#df837a] hover:text-white" />
  <span className="ml-2">Log In With Google</span>
</button>
          </div>
          <div className="mt-6 text-left">
            <p
              className="text-lg mb-4"
              style={{ fontFamily: "Poppins, sans-serif", color: "#969AB8" }}
            >
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-[#002f6c] font-semibold hover:bg-[#002f6c] hover:text-white"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Image with Quote */}
      <Image2 />

      {/* Show the success or error message */}
      {message && (
        <div className="fixed bottom-4 left-4 p-4 bg-green-700 text-white rounded-lg">
          {message}
        </div>
      )}
    </div>
  );
};

export default Login;
