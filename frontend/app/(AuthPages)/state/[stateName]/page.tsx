"use client";

import { notFound } from "next/navigation";
import { IoArrowBack } from "react-icons/io5"; // Import arrow icon
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter, useSearchParams } from "next/navigation";
import Notification from "@/components/Notification";
import UserDropdown from "@/components/profile-dropdown";
import Cookies from "js-cookie";
import { use } from "react";
import HeaderWithToggle from "@/components/HeaderWithToggle";

interface StatePageProps {
  params: Promise<{ stateName?: string }>;
}

export default function StatePage({ params }: StatePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const resolvedParams = use(params);
  const stateName = resolvedParams?.stateName ?? "";

  if (!stateName) {
    return notFound();
  }

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tags, setTags] = useState<{ [key: string]: number }>({});
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!stateName) {
      console.warn("stateName is missing, skipping API call.");
      return;
    }
  
    const fetchTags = async () => {
      try {
        const decodedStateName = decodeURIComponent(stateName); // 👈 fix
  
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!baseUrl)
          throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in .env.local");
  
        const apiUrl = `${baseUrl}/api/users/state/tags`;
        console.log(`Sending POST request to: ${apiUrl}`);
  
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ stateName: decodedStateName }), // 👈 use decoded name
        });
  
        console.log("Raw Response:", response);
  
        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("Parsed Data:", data);
  
        setTags(data.tag || {});
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
  
    fetchTags();
  }, [stateName]);
  

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    if (accessToken) {
      console.log("Access Token from Query Params:", accessToken);
      Cookies.set("accessToken", accessToken, {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      const cleanUrl = window.location.href.split("?")[0];
      window.history.replaceState({}, document.title, cleanUrl);
    }

    const storedEmail = Cookies.get("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const name = Cookies.get("name");

  return (
    <div className="flex flex-col lg:flex-row">
      <HeaderWithToggle onToggleSidebar={() => setIsSidebarOpen(true)} />

{/* Sidebar */}
<Sidebar
  isSidebarOpen={isSidebarOpen}
  setIsSidebarOpen={setIsSidebarOpen}
/>
      {/* ✅ Main Content */}
      <div className="lg:ml-64 p-4 sm:p-8 md:px-12 lg:px-16 xl:px-20 w-full">
        {/* ✅ Page Header */}
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

        {/* ✅ Content Section */}
        <div className="flex flex-col md:flex-row gap-4 p-4 min-h-screen">
          <div className="flex w-full h-auto flex-col items-center rounded-lg border border-gray-300 p-4">
            <div className="flex flex-col items-center w-full min-h-screen p-6">
              {/* ✅ Back Button & Page Title */}
              <div className="flex items-center gap-2 mb-4 self-start">
                <button
                  className="flex items-center text-[#002f6c] hover:text-blue-700 transition font-medium"
                  onClick={() => router.push("/state")}
                >
                  <IoArrowBack className="text-xl" />
                </button>
                <h1 className="text-2xl font-bold text-[#002f6c]">
                  Tags in {decodeURIComponent(stateName)}
                </h1>
              </div>

              {/* ✅ Tags Grid */}
              <div className="grid grid-cols-4 gap-4 mt-2 w-full">
                {Object.entries(tags).map(([tag, count], index) => (
                  <div
                    key={index}
                    className="bg-[#cce2ff] text-blue-900 px-4 py-2 rounded-lg font-sm"
                  >
                    {tag} ({count} times)
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
