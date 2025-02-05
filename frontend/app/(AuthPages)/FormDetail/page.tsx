"use client";
import Link from 'next/link';

import "@fortawesome/fontawesome-free/css/all.min.css";
import React, { useState, useEffect } from "react";

import Image2 from "@/components/imageright"; // Ensure the correct import path
import { useRouter, useSearchParams } from "next/navigation";


const Signup: React.FC = () => {
 
  const [facilityName, setFacilityName] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [noOfBeds, setNoOfBeds] = useState("1");
  const [email, setEmail] = useState<string | null>(null); // Email from localStorage

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Retrieve email from URL parameters on component mount
    const emailFromParams = searchParams.get("email");
    setEmail(emailFromParams);
  }, [searchParams]);

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form Data:", {
      email,
      facilityName,
      facilityAddress,
      noOfBeds: parseInt(noOfBeds, 10),
    }); // Debugging: Log the form data being sent
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          facilityName,
          facilityAddress,
          noOfBeds: parseInt(noOfBeds, 10),
        }),
      });
  
      console.log("API Response:", response); // Debugging: Log the response object
  
      if (!response.ok) {
        throw new Error("Failed to save facility.");
      }
  
      const data = await response.json();
      console.log("Facility saved successfully:", data); // Debugging: Log the response data
      router.push(`/Login?email=${encodeURIComponent(email || "")}`);
    } catch (error) {
      console.error("Error saving facility:", error);
      alert("Failed to save facility. Please try again.");
    }
  };
  
  return (
    <div className="flex h-screen font-work-sans bg-gray-50">
      {/* Left Side: Sign-Up Form */}
      <div className="flex flex-1 justify-center items-center bg-white">
        <div className="w-full max-w-md px-6 py-6 text-left">
          <h2 className="text-3xl font-bold text-gray-800 mb-1 text-left">Sign Up</h2>
          
          <form
    onSubmit={(e) => {
    e.preventDefault();
    console.log("Form submitted"); // Debugging: Log form submission
    console.log("Facility Name:", facilityName); // Debugging: Log Facility Name
    console.log("Facility Address:", facilityAddress); // Debugging: Log Facility Address
    console.log("No of Beds:", noOfBeds); // Debugging: Log No of Beds
    handleSubmit(e); // Call the handleSubmit function
  }}
  className="flex flex-col gap-4"
>
  <div className="mt-1 text-left">
    <p
      className="text-lg mb-4"
      style={{ fontFamily: "Poppins, sans-serif", color: "#969AB8" }}
    >
      Already have an account?{" "}
      <Link
        href="/Login"
        className="text-[#002f6c] font-semibold hover:bg-[#002f6c] hover:text-white"
      >
        Log In
      </Link>
    </p>
  </div>

  {/* Facility Name */}
<div className="mb-4">
  <label className="block text-medium font-bold text-black-700 mb-2">
    Facility Name
  </label>
  <select
    value={facilityName}
    onChange={(e) => {
      setFacilityName(e.target.value);
      console.log("Updated Facility Name:", e.target.value); // Debugging: Log updated Facility Name
    }}
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Select Facility Name</option>
    <option value="facility1">Facility1</option>
    <option value="facility2">Facility2</option>
    <option value="facility3">Facility3</option>
    <option value="facility4">Facility4</option>
  </select>
</div>


{/* Facility Address */}
<div className="mb-4">
  <label className="block text-medium font-bold text-black-700 mb-2">
    Facility Address
  </label>
  <select
    value={facilityAddress}
    onChange={(e) => {
      setFacilityAddress(e.target.value);
      console.log("Updated Facility Address:", e.target.value); // Debugging: Log updated Facility Address
    }}
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Select Facility Address</option>
                <option value="address1">address1</option>
                <option value="address2">address2</option>
                <option value="address3">address3</option>
                <option value="address4">address4</option>
  </select>
</div>


  {/* No of Beds */}
  <div className="mb-4">
    <label className="block text-medium font-bold text-black-700 mb-2">
      No of Beds
    </label>
    <select
      value={noOfBeds}
      onChange={(e) => {
        setNoOfBeds(e.target.value);
        console.log("Updated No of Beds:", e.target.value); // Debugging: Log updated No of Beds
      }}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="1" className="text-gray-500">
        No of Beds
      </option>{" "}
      {/* Grey placeholder option */}
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
    </select>
  </div>

  <button
    type="submit"
    className="w-full py-3 bg-[#002f6c] text-white font-semibold rounded-lg transition-colors hover:bg-blue-700"
  >
    Sign Up
  </button>
</form>


          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="px-4 text-gray-500">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div className="flex gap-4">
            <button className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-[#DB4437] hover:text-white transition-colors">
              <i className="fab fa-google mr-3 text-2xl text-[#DB4437] hover:text-white"></i>
              <span className="ml-2">Google</span>
            </button>
            <button className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-[#1877F2] hover:text-white transition-colors">
              <i className="fab fa-facebook mr-3 text-2xl text-[#1877F2] hover:text-white"></i>
              <span className="ml-2">Facebook</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Side: Image with Quote */}
      <Image2 />

    </div>
  );
};

export default Signup;
