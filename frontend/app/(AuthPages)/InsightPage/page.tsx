"use client";

import React, { useState, useEffect, useRef } from "react";
import Notification from "@/components/Notification";
import Cookies from "js-cookie";
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
import { toast } from "react-toastify";

export default function Dashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [facilityAddress, setFacilityAddress] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<
    { tag: string; count: number; description: string }[]
  >([]);
  const [selectedBar, setSelectedBar] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(30);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const descriptionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const storedEmail = Cookies.get("email");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  useEffect(() => {
    if (selectedState) fetchTags(selectedState, selectedDays);
  }, [selectedDays]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!email) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/fetch`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
     
        setFacilityAddress(data.facilityAddress || "");
        setSelectedState(data?.state);
        fetchTags(data?.state, selectedDays);
      } catch (err: any) {
        toast.error("Failed to fetch state:", err);
      }
    };
    fetchUserData();
  }, [email]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const fetchTags = async (stateName: string, days: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/state/tags`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stateName, days }),
        }
      );
      if (!res.ok) throw new Error("Failed to fetch tags");

      const data = await res.json();
      const tagData = data.tag || {};
      const sorted = Object.values(tagData)
        .map((v: any) => ({
          tag: v.Tag,
          count: v.Count,
          description: v.Description,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setTags(sorted);
    } catch (err) {
      console.error("❌ Error fetching tags:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const name = Cookies.get("name");

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <HeaderWithToggle onToggleSidebar={toggleSidebar} />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      {loading ? (
        <div className="flex items-center justify-center w-full h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      ) : (
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

          <div className="flex items-center space-x-4 mt-4 lg:mt-8  justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-xl font-bold text-blue-900">Facility</h3>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center bg-[#244979] text-white font-semibold text-sm px-3 py-2 rounded-lg"
                >
                  {selectedState || "Select State"}
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
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
            <div className="flex items-center gap-x-2 px-10">
              <label className="text-sm font-medium text-gray-700">
                Timeframe:
              </label>
              <select
                value={selectedDays}
                onChange={(e) => setSelectedDays(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none"
              >
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
                <option value={180}>Last 180 days</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 mb-6 mt-20 border border-[#E0E0E0]">
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
                  height={60}
                  tickLine={false}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  radius={[8, 8, 0, 0]}
                  onClick={(data) => {
                    setSelectedBar(data.tag);
                    setSelectedTag(data.tag); // this will help get description
                    setTimeout(() => {
                      descriptionRef.current?.scrollIntoView({
                        behavior: "smooth",
                      });
                    }, 100); // slight delay ensures DOM is ready
                  }}
                >
                  {tags.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={selectedBar === entry.tag ? "#22C55E" : "#002F6C"}
                    />
                  ))}
                  <LabelList dataKey="count" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {selectedTag && (
            <div
              ref={descriptionRef}
              className="mt-6 p-4 border border-gray-300 rounded-md bg-gray-50"
            >
              <h4 className="text-lg font-bold text-blue-900 mb-2">
                {selectedTag}
              </h4>
              <p className="text-sm text-gray-700">
                {tags.find((tag) => tag.tag === selectedTag)?.description ||
                  "No description available."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
