// 


"use client";

import "@fortawesome/fontawesome-free/css/all.min.css";
import React, { useState, useEffect } from "react";
import Image2 from "@/components/imageright"; // Ensure the correct import path
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

const Signup: React.FC = () => {
  const [facilityName, setFacilityName] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [noOfBeds, setNoOfBeds] = useState("1");
  const [email, setEmail] = useState<string | null>(null); // Email from URL

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Retrieve email from URL parameters on component mount
    const emailFromParams = searchParams.get("email");
    setEmail(emailFromParams);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!facilityName || !facilityAddress || !noOfBeds) {
      toast.error("All fields are required!", { position: "top-right" });
      return;
    }

    console.log("Form Data:", {
      email,
      facilityName,
      facilityAddress,
      noOfBeds: parseInt(noOfBeds, 10),
    }); // Debugging: Log form data

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/info`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            facilityName,
            facilityAddress,
            noOfBeds: parseInt(noOfBeds, 10),
          }),
        }
      );

      console.log("API Response:", response); // Debugging: Log response object

      if (!response.ok) {
        throw new Error("Failed to save facility.");
      }

      const data = await response.json();
      console.log("Facility saved successfully:", data); // Debugging: Log response data
      toast.success("Facility saved successfully!", { position: "top-right" });
      router.push(`/LoginPage?email=${encodeURIComponent(email || "")}`);
    } catch (error) {
      console.error("Error saving facility:", error);
      toast.error("Failed to save facility. Please try again.", {
        position: "top-right",
      });
    }
  };

  return (
    <div className="flex h-screen font-work-sans bg-gray-50">
      {/* Left Side: Sign-Up Form */}
      <div className="flex flex-1 justify-center items-center bg-white">
        <div className="w-full max-w-md px-6 py-6 text-left">
          <h2 className="text-3xl font-bold text-gray-800 mb-1">Facility Detail</h2>

          <p className="text-lg mb-4 text-gray-500">
            Please add your facility information.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Facility Name */}
            <div className="mb-4">
              <label className="block text-medium font-bold text-gray-700 mb-2">
                Facility Name
              </label>
              <select
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
              <label className="block text-medium font-bold text-gray-700 mb-2">
                Facility Address
              </label>
              <select
                value={facilityAddress}
                onChange={(e) => setFacilityAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Facility Address</option>
                <option value="address1">Address1</option>
                <option value="address2">Address2</option>
                <option value="address3">Address3</option>
                <option value="address4">Address4</option>
              </select>
            </div>

            {/* No of Beds */}
            <div className="mb-4">
              <label className="block text-medium font-bold text-gray-700 mb-2">
                No of Beds
              </label>
              <select
                value={noOfBeds}
                onChange={(e) => setNoOfBeds(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select No of Beds</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#002f6c] text-white font-semibold rounded-lg hover:bg-[#00408c] transition-colors"
            >
              Save
            </button>
          </form>
        </div>
      </div>

      {/* Right Side: Image with Quote */}
      <Image2 />
    </div>
  );
};

export default Signup;
