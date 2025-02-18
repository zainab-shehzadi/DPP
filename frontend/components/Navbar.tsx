"use client";

import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import { MoveUpRight } from "lucide-react";
import MobileNavbar from "./MobileNavbar";
import { useRouter, usePathname } from "next/navigation"; // Import usePathname

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get current route
  const isDisabled = true; // Change this dynamically

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="page-pad flex flex-row py-[20px] justify-between items-center">
      <Image src="/assets/logo.png" alt="logo" width={100} height={30} />

      <ul className="flex flex-row gap-4">
        <li
          className={`nav-item cursor-pointer ${pathname === "/" ? "font-bold text-blue-600" : ""}`}
          onClick={() => handleNavigate("/")}
        >
          Home
        </li>
        <li
  className={`nav-item cursor-pointer 
    ${pathname === "/Product" ? "font-bold text-blue-600" : ""}
    ${isDisabled ? "pointer-events-none opacity-50 text-gray-400" : ""}`}
>
  Product
</li>

        <li
          className={`nav-item cursor-pointer hover:underline ${pathname === "/HomePage" ? "font-extrabold text-blue-600" : ""}`}
          onClick={() => handleNavigate("/AboutUs")}
        >
          About Us
        </li>
        <li
          className={`nav-item cursor-pointer hover:underline ${pathname === "/Pricing" ? "font-extrabold text-blue-600" : ""}`}
          onClick={() => handleNavigate("/Pricing")}
        >
          Pricing Plan
        </li>
      </ul>

      <div className="flex gap-3 items-center">
        <p
          className={`font-semibold cursor-pointer ${pathname === "/Login" ? "font-bold text-blue-600" : ""}`}
          onClick={() => handleNavigate("/LoginPage")}
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
