"use client"; // ✅ Required for hooks like useState

import Image from "next/image";
import { FaUpload, FaFileAlt, FaUser, FaBell } from "react-icons/fa";
import React, { useState, useEffect, useRef } from "react";
import HeaderWithToggle from "@/components/HeaderWithToggle";
import Sidebar from "@/components/Sidebar";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import UserDropdown from "@/components/profile-dropdown";
export default function PolicyGenerator() {
  const { id, def } = useParams() as { id: string; def: string };
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [policy, setPolicy] = useState<any>(null);
  const [AIPolicy, setAIPolicy] = useState<any>(null);
  const [deficiency, setDeficiency] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tags, setTag] = useState("");
  const [policies, setPolicies] = useState([]);
  const [deficiencies, setSelectedDeficiencies] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    setName(Cookies.get("name"));
  }, []);
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/fetchpolicy`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
          }
        );

        const data = await res.json();
        console.log("jakshdjs", data);
        setDeficiency(data?.data?.deficiencies);
        setAIPolicy(data.data.updatedPolicy?.solution_policies || []);
        setPolicy(data.data.policies || []);
        setPolicies(data.data.policies || []);
        // setTag(data?.data?.tags || []);
        setTag(data?.data?.tags?.[0] || "");

        setSelectedDeficiencies(data.data.deficiencies || []);
      } catch (err) {
        console.error("Error fetching policy:", err);
      }
    };

    if (id) fetchPolicy();
  }, [id]);

  const handleReGeneratePolicy = async () => {
    try {
      setIsGenerating(true);
      const token = Cookies.get("token");

      const payload = {
        payload: {
          tags,
          deficiencies,
          policies,
        },
        extractedInfoId: id,
      };
      console.log(payload);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/regenerate-policies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      console.log(result);

      if (!res.ok)
        throw new Error(result.message || "Failed to regenerate policy");
      if (
        result?.data?.solution_policies &&
        Array.isArray(result.data.solution_policies)
      ) {
        console.log("Setting AIPolicy:", result.data.solution_policies);
        setAIPolicy(result.data.solution_policies);
        console.log("AIPolicy:", AIPolicy);
      } else {
        console.warn("No solution_policies found.");
        setAIPolicy([]);
      }
    } catch (err) {
      console.error("Error regenerating policy:", err);
    } finally {
      setIsGenerating(false);
    }
  };
  const handleCopytext = () => {
    if (boxRef.current) {
      const textToCopy = (boxRef.current as HTMLDivElement).innerText;
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          toast.success("Content copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    }
  };
  return (
    <div className="flex flex-col lg:flex-row">
      <HeaderWithToggle onToggleSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="lg:ml-64 p-4 sm:p-8 w-full">
        <header className="flex items-center justify-between mb-6 w-full flex-wrap">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">
            Hello, <span className="text-blue-900">{name || "User"}</span>
          </h2>

          <div className="flex items-center space-x-4">
            {/* <Notification /> */}
            <UserDropdown />
          </div>
        </header>

        {/* Facility Info */}
        <div className="flex items-center space-x-2 overflow-auto w-full">
          <h3 className="text-xl font-bold text-blue-900">Facility</h3>
        </div>

        <div
          className="w-full border-t border-gray-300 mt-4"
          style={{ borderColor: "#E0E0E0" }}
        ></div>

        <div className="flex flex-col md:flex-row justify-center mt-4 md:mt-8 space-y-4 md:space-y-0 md:space-x-4">
          {/* Left Container */}
          {/* <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full max-w-full md:max-w-md lg:max-w-lg xl:max-w-3xl flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-lg sm:text-xl lg:text-2xl text-[#002F6C] mb-4 lg:mb-12">
                {tags}
              </h4>
              <p
                className="text-sm sm:text-base lg:text-lg font-light leading-relaxed text-[#33343E] mb-8 md:mb-16 lg:mb-32"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {deficiency
                  ? deficiency.map((item: string, index: number) => (
                      <p key={index}>{item}</p>
                    ))
                  : "No deficiencies found."}
              </p>
            </div>
            <button
              onClick={handleReGeneratePolicy}
              disabled={isGenerating}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg self-end mt-4 text-sm disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Re-Generate Policy"}
            </button>
          </div> */}
          <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full max-w-full md:max-w-md lg:max-w-lg xl:max-w-3xl flex flex-col justify-between">
            <div>
              {/* Back with Tag Title */}
              <div className="flex items-center mb-4 lg:mb-12">
                <button
                  onClick={() => router.back()}
                  className="mr-2 text-blue-900 hover:text-blue-700"
                  title="Go back"
                >
                  <FaArrowLeft />
                </button>
                <h4 className="font-bold text-lg sm:text-xl lg:text-2xl text-[#002F6C]">
                  {tags}
                </h4>
              </div>

              {/* Deficiencies */}
              <div
                className="text-sm sm:text-base lg:text-lg font-light leading-relaxed text-[#33343E] mb-8 md:mb-16 lg:mb-32"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {deficiency && deficiency.length > 0 ? (
                  deficiency.map((item: string, index: number) => (
                    <p key={index} className="mb-1">
                      {item}
                    </p>
                  ))
                ) : (
                  <p>No deficiencies found.</p>
                )}
              </div>
            </div>

            {/* Button */}
            <button
              onClick={handleReGeneratePolicy}
              disabled={isGenerating}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg self-end mt-4 text-sm disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "AI Re-Generate Policy"}
            </button>
          </div>

          {/* Right Container */}
          <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full max-w-full md:max-w-md lg:max-w-lg xl:max-w-3xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <h4 className="text-[#002F6C] font-bold text-lg sm:text-xl lg:text-2xl  mb-10 ">
                  Policy
                </h4>
                <div className="flex ">
                  <button
                    onClick={handleCopytext}
                    className="relative group  rounded-lg hover:bg-gray-200 transition mb-10"
                    title="Copy"
                  >
                    <img
                      src="/assets/copy.png"
                      alt="Copy"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
              </div>
              <div ref={boxRef}>
                {AIPolicy && AIPolicy.length > 0 ? (
                  <ul
                    className="list-disc pl-6 mb-8 md:mb-16 lg:mb-32 text-sm sm:text-base lg:text-lg font-light leading-relaxed text-[#33343E]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {AIPolicy.map((item: string, index: number) => (
                      <li key={index} className="mb-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : policy && policy.length > 0 ? (
                  <ul
                    className="list-disc pl-6 mb-8 md:mb-16 lg:mb-32 text-sm sm:text-base lg:text-lg font-light leading-relaxed text-[#33343E]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {policy.map((item: string, index: number) => (
                      <li key={index} className="mb-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p
                    className="text-sm sm:text-base lg:text-lg font-light leading-relaxed text-[#33343E] mb-8 md:mb-16 lg:mb-32"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    No policy data available. Please generate a policy.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
