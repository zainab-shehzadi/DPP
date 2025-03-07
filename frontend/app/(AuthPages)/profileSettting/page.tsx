"use client"; // Mark this as a client component

import Image from "next/image";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import authProtectedRoutes from "@/hoc/authProtectedRoutes";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import UserDropdown from '@/components/profile-dropdown'
import DateDisplay from "@/components/date";
import Notification from "@/components/Notification";
function profileSetting() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [email, setEmail] = useState<string | null>(null); // Email from localStorage
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [DepartmentName, setDepartmentName] = useState("");
  const [Position, setPosition] = useState("");
  const [role, setRole] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const departmentPositions = {
    "Business Office": ["Office Manager", "Biller", "Payroll", "Reception", "Admissions"],
    "Director of Admissions": ["Liaison"],
    Activities: ["Director of Activities", "Activity Staff"],
    Maintenance: ["Director of Maintenance", "Maintenance Staff"],
    Dietary: ["Director of Dietary", "Dietitian", "Dietary Staff"],
    Therapy: ["Director of Therapy", "Therapy Staff"],
    Laundry: ["Laundry Supervisor"],
    Housekeeping: ["Housekeeping Supervisor"],
    "Case Management": ["Case Manager"],
    MDS: ["Director of MDS", "MDS Staff"],
    Nursing: ["Director of Nursing", "Assistant Director of Nursing", "Unit Manager"],
    Administration: ["Administrator", "Administrator in Training"],
    "Social Services": ["Social Services Director", "Social Services Staff"],
    "Staff Development Department": ["Staff Development Coordinator"],
    "Nursing Department": ["Nursing Development Coordinator"],
    "Quality Assurance Department": ["Nursing Development Coordinator"],
  };

  const roleCategories = {
    leadership: ["Director", "Manager", "Supervisor"],
    supporting: ["Staff", "Assistant", "Liaison"],
  };

  const leadershipRoles = roleCategories.leadership;
  const supportingRoles = roleCategories.supporting;

  const Positions = DepartmentName ? departmentPositions[DepartmentName] || [] : [];

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  useEffect(() => {
    const storedEmail = getCookie("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    if (email) {
      fetchUserData();
    }
  }, [email]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/email`, 
        {
          method: "POST", 
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }), 
        }
      );
      if (!response.ok) throw new Error("Failed to fetch user data.");
      const data = await response.json();
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setDepartmentName(data.DepartmentName || "");
      setPosition(data.Position || "");
      setRole(data.role || "");
    } catch (error) {
      toast.error("Failed to fetch user data. Please try again.");
    }
  };

  const handleSave = async () => {
    const updatedData = {
      firstname: firstName,
      lastname: lastName,
      role,
      Position,
      DepartmentName,
    };
  
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/email`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, ...updatedData }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to update user data.");
      }
  
      const responseData = await response.json();
  
      if (responseData.firstname) {
        Cookies.set("name", responseData.firstname);
      }
  
      toast.success("User data updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update user data. Please try again.");
    }
  };
  const name = Cookies.get("name"); 

  return (
    <div className="flex flex-col lg:flex-row h-screen z-[-1]">
      <Sidebar isSidebarOpen={isSidebarOpen} />

      <div className="lg:ml-64 p-4 sm:p-8 w-full">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Hello, <span className="text-blue-900 capitalize">{name || "User"}</span>
          </h2>
          <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
      <Notification/>
      <UserDropdown />
      </div>
        </header>
  {/* Date Display */}
  <div className="flex justify-end pr-12 sm:pr-48 mb-4">
             {/* Date */}
             <div className="relative flex items-center space-x-2">
                 <DateDisplay/>
                 </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-3/4 h-12 sm:h-20 bg-[#002F6C] mt-2 rounded-lg mx-auto"></div>

        <div className="w-full sm:w-3/4 mx-auto mt-8 z-[-1]">
      <section className="bg-white p-6 rounded-lg shadow-md relative">
        <div className="flex flex-col sm:flex-row items-center mb-6">
          <Image
            src="/assets/profile-pic.png"
            width={80}
            height={80}
            className="rounded-full"
            alt="Profile Picture"
          />
          <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left">
            <h3 className="text-xl font-bold capitalize">{name}</h3>
            <p className="text-gray-500">{email}</p>
          </div>
          <button
            className="absolute top-6 right-6 bg-blue-900 text-white px-6 py-2 rounded-md"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-gray-700">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={!isEditing}
              className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9]"
            />
          </div>
          <div>
            <label className="block text-gray-700">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={!isEditing}
              className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9]"
            />
          </div>
          <div>
            <label className="block text-gray-700">Department</label>
            <select
              value={DepartmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              disabled={!isEditing}
              className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9]"
            >
              <option value="" disabled>Select a Department</option>
              {Object.keys(departmentPositions).map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Position</label>
            <select
              value={Position}
              onChange={(e) => setPosition(e.target.value)}
              disabled={!isEditing || !Positions.length}
              className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9]"
            >
              <option value="" disabled>
                {Positions.length ? "Select a Position" : "Select a Department First"}
              </option>
              {Positions.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={!isEditing}
              className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9]"
            >
              <option value="" disabled>Select a Role</option>
              <optgroup label="Leadership Roles">
                {leadershipRoles.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>{roleOption}</option>
                ))}
              </optgroup>
              <optgroup label="Supporting Roles">
                {supportingRoles.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>{roleOption}</option>
                ))}
              </optgroup>
            </select>
          </div>

          
        </div>
        <div className="mt-8">
        <p className="font-semibold mt-2 text-black">
  View{" "}
  <a href="/privacypolicy" className="text-blue-900 underline hover:text-blue-700">
    Privacy Policy
  </a>{" "}
  and{" "}
  <a href="/termCondition" className="text-blue-900 underline hover:text-blue-700">
    Terms and Conditions
  </a>.
</p>
</div>

        {isEditing && (
          <div className="mt-6 text-center">
            <button
              className="bg-blue-900 text-white px-6 py-2 rounded-md"
              onClick={() => {
                handleSave();
                setIsEditing(false);
              }}
            >
              Done
            </button>
          </div>
        )}
      </section>
    </div>
      </div>
    </div>
  );
}
export default authProtectedRoutes(profileSetting);