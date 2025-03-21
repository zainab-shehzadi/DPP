"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaMap } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import { useRouter, useSearchParams } from "next/navigation";
import Notification from "@/components/Notification";
import UserDropdown from "@/components/profile-dropdown";
import DateDisplay from "@/components/date";

import Cookies from "js-cookie";

interface Sidebar {
  userId: string | null;
  email: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}
export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [email, setEmail] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    if (accessToken) {
      console.log("Access Token from Query Params:", accessToken);
      Cookies.set("accessToken", accessToken, {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      const currentUrl = window.location.href;
      const cleanUrl = currentUrl.split("?")[0];
      window.history.replaceState({}, document.title, cleanUrl);
    }

    const storedEmail = Cookies.get("email");

    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
    "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
    "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
    "Wisconsin", "Wyoming"
  ];
  

  const name = Cookies.get("name");

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-[#002F6C] text-white">
        <img src="/assets/logo-dpp1.png" alt="Logo" className="h-8 w-auto" />
      </div>
      <Sidebar isSidebarOpen={isSidebarOpen} />

      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-8 md:px-12 lg:px-16 xl:px-20 w-full">
        <header className="flex items-center justify-between mb-6 w-full flex-wrap">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">
            Hello, <span className="text-blue-900 capitalize">{name}</span>
          </h2>
          <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
            <Notification />
            <UserDropdown />
          </div>
        </header>


        <div className="w-full border-t border-gray-300 mt-20"></div>

        {/* Main Container */}
        <div className="flex flex-col md:flex-row gap-4 p-4 min-h-screen">
        <div className="flex w-full flex-col items-center h-auto rounded-lg border border-gray-300 p-4">
      <div className="grid grid-cols-4 gap-4 w-full max-w-6xl">
        {states.map((state, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-3 border rounded-lg shadow-sm bg-white hover:shadow-md transition cursor-pointer"
            onClick={() => router.push(`/state/${state}`)} // Navigate on click
          >
            <Image
              src={`/assets/state.png`} 
              width={40}
              height={40}
              className="rounded-full object-cover"
              alt={state}
            />
            <span className="text-gray-800 font-medium">{state}</span>
          </div>
        ))}
      </div>
    </div>
        </div>
      </div>
    </div>
  );
}
