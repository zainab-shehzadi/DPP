"use client";
import Link from 'next/link';
import React, { useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("user");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("First Name:", firstName);
    console.log("Last Name:", lastName);
    console.log("Email:", email);
    console.log("Role:", role);
    console.log("Password:", password);
   
  };

  return (
    <div className="flex h-screen font-work-sans bg-gray-50">
      {/* Left Side: Sign-Up Form */}
      <div className="flex flex-1 justify-center items-center bg-white">
        <div className="w-full max-w-md px-6 py-6 text-left">
          <h2 className="text-3xl font-bold text-gray-800 mb-1 text-left">
            Sign Up
          </h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="mt-1 text-left">
  <p className="text-lg mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#969AB8' }}>
    Already have an account?{" "}
    <Link href="/LoginPage" className="text-[#002f6c] font-semibold hover:bg-[#002f6c] hover:text-white">
      Log In
    </Link>
  </p>
</div>

            <div className="flex gap-4">
              <div className="mb-4 flex-1">
                <label className="block text-medium font-bold text-black-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4 flex-1">
                <label className="block text-medium font-bold text-black-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-medium font-bold text-black-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-medium font-bold text-black-700 mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-medium font-bold text-black-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
      <div
        className="flex flex-1 bg-white bg-center relative"
        style={{
          backgroundImage: "url('/assets/pic.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "130vh",
        }}
      >
        <div className="quote absolute left-9 top-12 text-left">
          <p>The future belongs to those who</p>
          <p>
            <span className="highlight">believe</span> in the{" "}
            <span className="highlight">beauty of their dreams.</span>
          </p>
          <p style={{ textAlign: "right", marginTop: "20px" }}>
            — Eleanor Roosevelt
          </p>
        </div>
      </div>

      <style jsx>{`
        .quote {
          font-size: 2.4rem;
          color: black;
          line-height: 1.6;
          font-family: Arial, sans-serif;
          font-weight: 500;
          margin-top: 5px;
        }

        .highlight {
          color: #80b93d;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default Signup;
