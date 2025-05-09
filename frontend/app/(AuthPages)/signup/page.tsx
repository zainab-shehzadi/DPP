"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Image2 from "@/components/imageright"; // Ensure the correct import path
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

import { useRouter } from "next/navigation";
import authPublicRoutes from "@/hoc/authPublicRoutes";
import { departmentPositions, departmentLabels, roles } from "@/constants/dpp";
const Signup: React.FC = () => {
  const [DepartmentName, setDepartmentName] = useState("");
  const [position, setPosition] = useState("");
  const [role, setRole] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const positions = DepartmentName
    ? departmentPositions[DepartmentName] || []
    : [];
  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (!firstName.trim()) {
        toast.error("First Name cannot be empty or just spaces");
        return;
      }
      if (!lastName.trim()) {
        toast.error("Last Name cannot be empty or just spaces");
        return;
      }
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }
      if (password !== repeatPassword) {
        toast.error("Passwords do not match");
        return;
      }
    
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            DepartmentName: DepartmentName.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            role,
            position,
            password,
            confirmPassword: repeatPassword,
          }),
        }
      );

      const data = await response.json();
      Cookies.set("VerifyStatus", data.status);
      Cookies.set("email", email);
      Cookies.set("name", firstName);

      if (response.ok) {
        toast.success("Registration done");
        setTimeout(() => {
          router.push(`/form-detail`);
        }, 1500);
      } else {
        toast.error(data.message || "Signup failed!");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="flex h-screen font-work-sans bg-gray-50">
      {/* Left Side: Sign-Up Form */}
      <div className="flex flex-1 justify-center items-center bg-white min-h-screen mb-2">
        <div className="w-full max-w-lg px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 text-left">
          <h2 className="text-2xl sm:text-2xl font-bold text-gray-800 mb-2">
            Sign Up
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* First Name and Last Name */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value.trimStart())}
                  required
                  className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value.trimStart())} // Prevent leading spaces
                  required
                  className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Department Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0">
                Department Name
              </label>
              <select
                value={DepartmentName}
                onChange={(e) => {
                  setDepartmentName(e.target.value);
                  setPosition(""); // Reset position when department changes
                }}
                required
                className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="" disabled>
                  Select a department
                </option>
                {Object.keys(departmentPositions).map((deptKey) => (
                  <option key={deptKey} value={deptKey}>
                    {departmentLabels[deptKey]}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Position */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
                className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={!positions.length} // ✅ Use positions, not departmentPositions
              >
                <option value="" disabled>
                  {positions.length
                    ? "Select a position"
                    : "Select a department first"}
                </option>
                {positions.map((pos, index) => (
                  <option key={index} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            {/* Role */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={!DepartmentName}
              >
                <option value="" disabled>
                  {DepartmentName
                    ? "Select a role"
                    : "Select a department first"}
                </option>
                {roles.map((r, index) => (
                  <option key={index} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Password Field */}
              <div className="flex-1 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Repeat Password Field */}
              <div className="flex-1 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repeat Password
                </label>
                <div className="relative">
                  <input
                    type={showRepeatPassword ? "text" : "password"}
                    placeholder="Repeat Password"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  >
                    {showRepeatPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#002f6c] hover:shadow-xl"
              } text-white font-semibold rounded-lg transition-all text-sm shadow-lg`}
            >
              {isLoading ? "Loading..." : "Sign Up"}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#002f6c] font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Image with Quote */}
      <Image2 />

      {message && (
        <div className="fixed bottom-4 left-4 p-4 bg-green-700 text-white rounded-lg">
          {message}
        </div>
      )}
    </div>
  );
};
export default authPublicRoutes(Signup);
