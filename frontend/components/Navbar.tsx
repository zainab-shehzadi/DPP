


"use client"; // Add this line if you need client-side navigation

import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import { MoveUpRight } from "lucide-react";
import MobileNavbar from "./MobileNavbar";
import { useRouter } from "next/navigation"; // Correct import for App Router

const Navbar = () => {  // Use a single consistent name, e.g., Navbar
  const router = useRouter();

  const handleSignInClick = () => {
    router.push("/Login"); // Replace "/login" with your login page route
  };
  const handleNavigateToPOCAI = () => {
    router.push("/POCAI"); // Replace "/login" with your login page route
  };

  return (
    <div className="page-pad flex flex-row py-[20px] justify-between items-center">
      <Image src="/assets/logo.png" alt="logo" width={100} height={30} />

      <ul className="flex flex-row gap-2">
        <li className="nav-item">Home</li>
        <li className="nav-item">Product</li>
        <li
          className="nav-item cursor-pointer hover:underline"
          onClick={handleNavigateToPOCAI}
        >
          About Us
        </li>
        <li className="nav-item">Contact</li>
      </ul>

      <div className="flex gap-3 items-center">
        <p
          className="font-semibold cursor-pointer"
          onClick={handleSignInClick}
        >
          Sign In
        </p>
        <Button className="secondary-btn">
          Contact Us
          <span className="bg-primary text-white p-2 rounded-[50%]">
            <MoveUpRight />
          </span>
        </Button>
        <MobileNavbar />
      </div>
    </div>
  );
};

export default Navbar;
