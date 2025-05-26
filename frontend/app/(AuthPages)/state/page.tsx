"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaMap } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import { useRouter, useSearchParams } from "next/navigation";
import Notification from "@/components/Notification";
import UserDropdown from "@/components/profile-dropdown";
import HeaderWithToggle from "@/components/HeaderWithToggle";

import Cookies from "js-cookie";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  const name = Cookies.get("name");

  return (
    <div className="flex flex-col lg:flex-row">
      <HeaderWithToggle onToggleSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
  {loading ? (
       
       <div className="flex items-center justify-center w-full h-screen ma-10">
         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
       </div>
     ) : (
       <>
      <div className="lg:ml-64 p-4 sm:p-8 w-full">
        <header className="flex items-center justify-between mb-6 w-full flex-wrap">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">
            Hello, <span className="text-blue-900 capitalize">{name}</span>
          </h2>
          <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
            {/* <Notification /> */}
            <UserDropdown />
          </div>
        </header>

        <div className="w-full border-t border-gray-300 mt-20"></div>

        <div
          className="bg-white p-6 rounded-lg shadow-md mx-auto mt-8 sm:mt-10 w-full max-w-[1400px]"
          style={{ borderRadius: "16px", border: "1px solid #E0E0E0" }}
        >
          <div className="grid grid-cols-4 gap-4 w-full max-w-6xl">
            {states.map((state, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 border rounded-lg shadow-sm bg-white hover:shadow-md transition cursor-pointer"
                onClick={() => router.push(`/state/${state}`)}
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
      </>
      )}
    </div>
  );
}
