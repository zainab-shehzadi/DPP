"use client";
import Link from "next/link";
import React, { useState,  useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Image2 from "@/components/imageright"; // Ensure this path is correct
import { useRouter } from "next/navigation"; // Correct import for App Router

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null); // Email from localStorage
  const router = useRouter();
  useEffect(() => {
    // Retrieve email from localStorage on component mount
    const storedEmail = localStorage.getItem("email");
    setEmail(storedEmail);
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
  
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword: password }),
      });
  
      // Handle non-JSON responses gracefully
      if (!response.ok) {
        const text = await response.text(); // Fallback to text if JSON is not returned
        try {
          const data = JSON.parse(text); // Parse JSON if available
          setMessage(data.message || "An error occurred.");
        } catch (e) {
          console.error("Non-JSON error:", text);
          setMessage("An unexpected error occurred.");
        }
        return;
      }
  
      const data = await response.json();
      const successMessage = data.message || "Password reset successful!";
      setMessage(successMessage);
      alert(successMessage);
      setTimeout(() => {
        router.push("/Login");
      }, 1000);
    } catch (error) {
      console.error("Error resetting password:", error);
      setMessage("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex h-screen font-work-sans bg-gray-50">
      <div className="flex flex-1 justify-center items-center bg-white">
        <div className="w-full max-w-md px-6 py-6 text-left">
          <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-gray-800 mb-4 text-left">
            Reset Password
          </h2>
          <p className="text-medium text-gray-600 mb-10">
            Choose a new password for your account
          </p>
          <form className="flex flex-col gap-5" onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="block text-sm sm:text-base md:text-lg font-bold text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm sm:text-base md:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm sm:text-base md:text-lg font-bold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm sm:text-base md:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {message && (
              <p
                className={`text-sm mb-4 ${
                  message.includes("success")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}
            <button
              type="submit"
              className={`w-full py-3 ${
                loading ? "bg-gray-400" : "bg-[#002f6c]"
              } text-white font-semibold rounded-lg transition-colors text-sm sm:text-base md:text-lg`}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
          <Link href="/login">
            <button
              type="button"
              className="w-full px-3 py-2 border border-black-300 rounded-lg font-bold focus:outline-none mt-6 text-sm sm:text-base md:text-lg hover:bg-gray-100 transition-colors"
            >
              Back to Login
            </button>
          </Link>
        </div>
      </div>
      <Image2 />
    </div>
  );
};

export default ResetPassword;
