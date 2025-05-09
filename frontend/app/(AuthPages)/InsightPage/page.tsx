"use client";

import React, { useState, useEffect, useRef } from "react";
import Notification from "@/components/Notification";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import UserDropdown from "@/components/profile-dropdown";
import Sidebar from "@/components/Sidebar";
import HeaderWithToggle from "@/components/HeaderWithToggle";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  Cell,
} from "recharts";

export default function Dashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [facilityAddress, setFacilityAddress] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [selectedBar, setSelectedBar] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(30);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false); // Close dropdown
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const storedEmail = Cookies.get("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);
  useEffect(() => {
    if (selectedState) {
      fetchTags(selectedState, selectedDays);
    }
  }, [selectedDays]);
  useEffect(() => {
    const fetchUserData = async () => {
      if (!email) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/fetch`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch user data. Status: ${response.status}`
          );
        }

        const data = await response.json();

        setFacilityAddress(data.facilityAddress || "");
        const matchedState =
          states.find((state) =>
            (data.facilityAddress || "")
              .toLowerCase()
              .includes(state.toLowerCase())
          ) || "";

        setSelectedState(matchedState);
        fetchTags(matchedState, selectedDays);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
      }
    };

    fetchUserData();
  }, [email]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
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
  const fetchTags = async (stateName: string, days: number = 30) => {
    try {
      const decodedStateName = decodeURIComponent(stateName);
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_BASE_URL is not defined in .env.local"
        );
      }

      const apiUrl = `${baseUrl}/api/users/state/tags`;

      console.log(
        `📡 Fetching tags for state: ${decodedStateName}, days: ${days}`
      );

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stateName: decodedStateName, days }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Top Sorted Tags:", data);
      const tagObj: Record<string, number> = data.tag || {};

      const sortedTags = Object.entries(tagObj)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setTags(sortedTags);
      console.log("✅ Top Sorted Tags:", sortedTags);
    } catch (error) {
      console.error("❌ Error fetching tags:", error);
    }
  };

  const name = Cookies.get("name");

  return (
    <div className="flex flex-col lg:flex-row h-screen">
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
                <Notification />
                <UserDropdown />
              </div>
            </header>

            <div className="flex items-center space-x-4 mt-4 lg:mt-8 ml-4 lg:ml-10 w-full justify-between">
              {/* Left: Facility */}
              <div className="flex items-center space-x-4">
                <h3 className="text-xl font-bold text-blue-900">Facility</h3>
                <div
                  className="relative ml-2 sm:ml-4 lg:ml-6"
                  ref={dropdownRef}
                >
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center bg-[#244979] text-white font-semibold text-sm px-3 py-2 rounded-lg"
                  >
                    <span className="font-[Plus Jakarta Sans]">
                      {selectedState || "Select State"}
                    </span>
                    <svg
                      className="w-4 h-4 ml-2 transition-transform duration-200"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      style={{
                        transform: dropdownOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-lg z-50 border border-gray-200 max-h-60 overflow-y-auto">
                      {states.map((state, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-sm text-gray-800"
                          onClick={() => {
                            setSelectedState(state);
                            setDropdownOpen(false);
                            fetchTags(state, selectedDays);
                          }}
                        >
                          {state}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Right: Timeframe */}
              <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-2 w-full sm:w-auto px-12">
                <label className="text-sm font-medium text-gray-700">
                  Timeframe:
                </label>
                <select
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition"
                >
                  <option value={30}>Last 30 days</option>
                  <option value={60}>Last 60 days</option>
                  <option value={90}>Last 90 days</option>
                  <option value={180}>Last 180 days</option>
                </select>
              </div>
            </div>

            {/* Facility Details Section */}
            <div
              className="bg-white rounded-lg shadow-md p-8 mb-6 mx-auto mt-20"
              style={{
                width: "100%",
                maxWidth: "1314px",
                height: "auto",
                borderRadius: "16px",
                border: "1px solid #E0E0E0",
              }}
            >
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4 w-full">
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={tags}
                      margin={{ top: 20, right: 20, left: 0, bottom: 30 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="tag"
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={0}
                        height={60}
                        tickLine={false}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip />

                      <Bar
                        dataKey="count"
                        radius={[8, 8, 0, 0]}
                        onClick={(data) => setSelectedBar(data.tag)}
                      >
                        {tags.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              selectedBar === entry.tag ? "#22C55E" : "#002F6C"
                            } // green or blue
                          />
                        ))}
                        <LabelList dataKey="count" position="top" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="text-gray-600 space-y-4">
                {selectedTag && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-10"></h3>
                    {/* <p className="text-gray-600 mt-2">
                      {Array.isArray(solution) && solution.length > 0 ? (
                        solution.map((policy, index) => (
                          <li key={index}>{policy}</li>
                        ))
                      ) : (
                        <li>No Plan of Correction available.</li>
                      )}
                    </p> */}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
