"use client"; 
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import {FaFileAlt, FaBell } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation"; // For navigation after successful reset
import Notification from '@/components/Notification'
import Cookies from "js-cookie";
import { toast } from "react-toastify";
interface DocumentType {
  _id: string;
  originalName: string;
  fileUrl?: string; // Optional in case some documents lack a URL
}
export default function Dashboard() {


const [tagsData, setTagsData] = useState<{
  id: number; // Add an id field
  tag: string;
  shortDesc: string;
  longDesc: string;
  solution: string;
  policies :string;
  task : string;
}[]>([]);
const [facilities, setFacilities] = useState<string[]>([]); // Explicitly set the type to string[]
const searchParams = useSearchParams(); // Get search params from URL
const [selectedTag, setSelectedTag] = useState<string | null>(null); // Track the selected tag
const [selectedID, setSelectedID] = useState<number | null>(null); // Track the selected tag as a number
const [selectedLongDesc, setSelectedLongDesc] = useState<string | null>(null); // To store the long description of the selected tag
const [selectedPolicy, setSelectedPPolicy] = useState<string | null>(null);
const [selectedTask, setSelectedTask] = useState<any[]>([]); // Ensure it's an array
const [selectedFacility, setSelectedFacility] = useState<string>(""); // Set type to string
const [email, setEmail] = useState<string | null>(null); // Email from localStorage
const [visibleCount, setVisibleCount] = useState<number>(4); // Default visible count
const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // Sidebar toggle
const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown toggle
const [activeTab, setActiveTab] = useState("POC AI Ally");
const [solution, setSolution] = useState(''); // Holds the solution text to display in the POC container
const [dropdownOpen1, setDropdownOpen1] = useState(false); // Dropdown toggle
const [selectedDate, setSelectedDate] = useState(new Date());
const [accessToken123, setAccessToken] = useState<string | null>(null);
const [documents, setDocuments] = useState<DocumentType[]>([]); // ✅ Specify type
const [refreshToken, setrefreshToken] =useState<string| null>(null);
const [dropdownOpen2, setDropdownOpen2] = useState(false); // State for dropdown visibility
const [selectedDescription, setSelectedDescription] = useState<string | null>( null ); // Short description of the selected tag
const dropdownRef = useRef<HTMLDivElement>(null);
const [selectedDocument, setSelectedDocument] = useState(null);

const [answer1, setAnswer1] = useState('');
const [answer2, setAnswer2] = useState('');
const [loading, setLoading] = useState(false);

const router = useRouter();
const id = searchParams.get("id");
useEffect(() => {
  const storedAccessToken = Cookies.get("accessToken");
  const storedRefreshToken = Cookies.get("refreshToken"); // Fix variable name
  const storedEmail = Cookies.get("email");

  if (storedAccessToken) {
    console.log("Access Token:", storedAccessToken);
    setAccessToken(storedAccessToken);
  } 
  if (storedRefreshToken) { // ✅ Correct condition
    console.log("Refresh Token:", storedRefreshToken);
    setrefreshToken(storedRefreshToken); 
  } 
  if (storedEmail) {
    console.log("Email:", storedEmail);
    setEmail(storedEmail);
  } else {
    console.error("Email not found in cookies.");
  }
}, []);
useEffect(() => {
  const fetchDocuments = async () => {
    try {
      const email = Cookies.get("email"); // Get email from cookies
      if (!email) {
        console.error("Error: Email not found in cookies!");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/docs?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setDocuments(data); 
      } else {
        toast.error("Unexpected API response format", data);
      }
    } catch (error) {
      toast.error("Error fetching documents");
    }
  };

  fetchDocuments();
}, []);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const fetchDocumentDetails = async (id) => {
    try {
  
      const safeEmail = email ?? "";
      console.log("Fetching details for document ID:", id);
      console.log("Using email:", safeEmail);
  
      setLoading(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/tags-with-descriptions?email=${encodeURIComponent(safeEmail)}&id=${encodeURIComponent(id)}`;
  
      console.log("API URL:", apiUrl);
  
      const response = await fetch(apiUrl);
      console.log("API Response Status:", response.status);
  
      if (!response.ok) {
        console.error(`Failed to fetch document details: ${response.statusText}`);
        setTagsData([]); // Reset tags data
        toast.error("Error: Failed to fetch document details.");
        return;
      }
  
      const data = await response.json();
      console.log("Fetched Document Data:", data);
  
      // Ensure `data.tags` exists before setting state
      if (!data || !Array.isArray(data.tags)) {
        alert("Error: `data.tags` is undefined or not an array.");
        console.error("Error: `data.tags` is missing or incorrect format in API response", data);
        return;
      }
  
      // ✅ Set all tags properly
      setTagsData(data.tags);
  
      // ✅ Show all tags in an alert
      setTimeout(() => {
        alert("Updated Tags Data:\n" + JSON.stringify(data.tags, null, 2));
        console.log("Updated Tags Data:", data.tags);
      }, 1000); // Delay to ensure state update
  
    } catch (error) {
      console.error("Error fetching document details:", error);
      alert("Error fetching document details:\n" );
    } finally {
      setLoading(false);
      console.log("Loading state set to false.");
    }
  };
  
  
  
    const handleNavigateToTags = () => {
      router.push("/Tags"); // Navigate to the UploadDoc page
    };
   // Handle Tag Selection
   const handleTagClick = (tag, shortDesc, longDesc, id, solution, policies) => {
    alert(
      `Tag Clicked:\nTag: ${tag}\nShort Description: ${shortDesc || "Not Found"}\nLong Description: ${longDesc || "Not Found"}\nID: ${id || "Not Found"}\nSolution: ${solution || "Not Found"}\nPolicies: ${policies || "Not Found"}`
    );
  
    console.log("handleTagClick triggered with:", {
      tag,
      shortDesc,
      longDesc,
      id,
      solution,
      policies,
    });
  
    setSelectedTag(tag);
    setSelectedID(id);
    setSelectedDescription(shortDesc);
    setSelectedLongDesc(longDesc);
    setSolution(solution);
    setSelectedPPolicy(policies);
    setDropdownOpen2(false); // Close dropdown
  
    setTimeout(() => {
      alert(
        `Updated State Values:\nTag: ${selectedTag}\nID: ${selectedID}\nShort Desc: ${selectedDescription}\nLong Desc: ${selectedLongDesc}\nSolution: ${solution}\nPolicies: ${selectedPolicy}`
      );
  
      console.log("Updated state values:", {
        selectedTag,
        selectedID,
        selectedDescription,
        selectedLongDesc,
        solution,
        selectedPolicy,
      });
    }, 1000); // Delay to allow state updates
  };
  
  
  const handleTagClick1 = (tag: string, shortDesc: string, longDesc: string) => {
    setSelectedTag(tag); // Update selected tag
    setSelectedDescription(shortDesc); // Update selected short description
    setSelectedLongDesc(longDesc); // Update selected long description
  };
  const toggleDropdown2 = () => setDropdownOpen2(!dropdownOpen2);

  // const toggleDropdown2 = async () => {
  //   // Toggle dropdown visibility
  //   setDropdownOpen2((prev) => !prev);
  
  //   // Only fetch data if the dropdown is being opened
  //   if (!dropdownOpen2) {
  //     try {
  //       // Validate email and ID
  //       if (!email || typeof email !== "string" || !email.trim() || !id) {
  //         console.error("Invalid email or ID provided.");
  //         setTagsData([]); // Reset tags data
  //         return;
  //       }
  
  //       // Fetch tags and descriptions using email and id
  //       const response = await fetch(
  //         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/tags-with-descriptions?email=${encodeURIComponent(email)}&id=${encodeURIComponent(id)}`
  //       );
  
  //       if (!response.ok) {
  //         console.error(`Failed to fetch tags data: ${response.statusText}`);
  //         setTagsData([]); // Reset tags data
  //         return;
  //       }
  
  //       const data = await response.json();
  
  //       // Validate if the fetched data is an array
  //       if (Array.isArray(data)) {
  //         // Map and set tags data
  //         setTagsData(
  //           data.map((item) => ({
  //             id: item.id || "Unknown ID",
  //             tag: item.tag || "Unknown Tag",
  //             shortDesc: item.shortDesc || "No short description available.",
  //             longDesc: item.longDesc || "No long description available.",
  //             solution: item.solution || "No solution available.",
  //             policies: item.policies || "No policy available.",
  //             task: item.task || "No task available.", // Include the task object with a fallback
  //           }))
  //         );
  
  //         // Log the task for debugging purposes
  //         const task = data[0]?.task || "No task available.";
  //         setSelectedTask(task || null); // Set the first task or null

  //         console.log("First task:", task);
  //       } else {
  //         console.warn("Fetched data is not an array:", data);
  //         setTagsData([]); // Fallback to an empty array
  //       }
  //     } catch (error) {
  //       console.error("Error fetching tags data:", error);
  //       setTagsData([]); // Fallback to an empty array
  //     }
  //   }
  // };
  const isAuthenticated = async () => {
    try {
      const safeEmail = email ?? ""; // Use empty string if email is null
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/get-access-token?email=${encodeURIComponent(safeEmail)}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
  
      if (!response.ok) throw new Error("Failed to fetch access token");
  
      const data = await response.json();
      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken; // ✅ Fetch refresh token as well
  
      if (!accessToken) {
        alert("Please log in with Google for assigned tasks.");
        router.push("/login"); // Redirect to login page
        return false;
      }
  
      // ✅ Save both accessToken & refreshToken in cookies
      Cookies.set("accessToken", accessToken, { expires: 7 });
      Cookies.set("refreshToken", refreshToken, { expires: 30 }); // Refresh token valid for 7 days
  
      return true;
    } catch (error) {
      console.error("Error fetching tokens:", error);
      alert("Please log in with Google for assigned tasks.");
      router.push("/login"); // Redirect to login page
      return false;
    }
  };
  const handleAssignTask = async () => {
    isAuthenticated() ;
    
    if (!selectedTask || selectedTask.length === 0) {
      alert("Please select at least one task before assigning.");
      return;
    }
  
    console.log("Selected tasks:", selectedTask);
    console.log("Selected ID:", selectedID);
  
    try {
      const accessToken = refreshToken;
  
      // Prepare tasks
      const tasks = selectedTask.map((taskSummary, index) => {
        const startTime = new Date();
        startTime.setHours(startTime.getHours() + index * 2); 
        
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 48); 
  
        return {
          summary: taskSummary,
          status: "pending",
          start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
          end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
        };
      });
  
      console.log("Prepared tasks:", tasks);
  
      // Save tasks to the database
      const saveResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/calendar/save-tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tagId: selectedID, tasks }),
        }
      );
  
      console.log("Sending request to API:", `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/calendar/save-tasks`);
  
      if (!saveResponse.ok) {
        const error = await saveResponse.json();
        console.error("Failed to save tasks:", error);
        alert("Failed to save tasks to the database.");
        return;
      }
  
      const savedTasks = await saveResponse.json();
      console.log("Tasks saved successfully:", savedTasks);
  
      // Create events in Google Calendar
      for (let task of tasks) {
        console.log("Creating event for task:", task);
  
        const calendarResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/calendar/create-event`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(task),
          }
        );
  
        if (!calendarResponse.ok) {
          const error = await calendarResponse.json();
          console.error("Failed to create event:", error);
          alert("Failed to create one or more events. Check the console for details.");
          continue; // Skip to the next task
        }
  
        const calendarData = await calendarResponse.json();
        console.log("Event created successfully:", calendarData);
      }
  
      alert("Tasks assigned and events created successfully.");
    } catch (error) {
      console.error("Error during task assignment:", error);
      alert("An error occurred while assigning tasks. Check the console for details.");
    }
  };
  const toggleDropdown1 = () => setDropdownOpen1(!dropdownOpen1);
  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
    console.log("Dropdown toggled:", !dropdownOpen);
  };  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  //const handleShowMore = () => setVisibleCount((prev) => prev + 5); // Show more facilities
  const handleNavigateToPolicy = () => {
    setActiveTab("Policy"); // Switch to the "Policy" tab // Navigate to the PolicyGenerator page
  };
  
  const handleEdit = () => {
    alert("Edit triggered!"); // Show alert message
  };

  useEffect(() => {
    const fetchFacilities = async () => {
      if (!email || !id) {
        setFacilities([]); // Set facilities to an empty array if email or id is missing
        return;
      }
      console.log("ID:", id);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/tags?email=${encodeURIComponent(email)}&id=${encodeURIComponent(id)}`
        );
  
        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.includes("application/json")) {
          const data = await response.json();
          console.log("Fetched facilities for email and id:", data);
  
          if (Array.isArray(data)) {
            setFacilities(data); // Set facilities if data is an array
          } else {
            console.error("Fetched data is not an array:", data);
            setFacilities([]); // Fallback to an empty array
          }
        } else {
          console.error("Unexpected response format or server error:", response.statusText);
          setFacilities([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error("Error fetching facilities:", error);
        setFacilities([]); // Fallback to an empty array
      }
    };
  
    fetchFacilities();
  }, [email, id]);
  
  const handleSubmit = async () => {
    setLoading(true);
  
  
    // Validate required fields
    if (!selectedTag || !selectedLongDesc || !selectedID || !answer1 || !answer2) {
      console.error('Missing input values.');
     
      setLoading(false);
      return;
    }
  
    // Construct the query string
    const query = `I belong to Tag ${selectedTag}, "${selectedLongDesc}", ${answer1} and ${answer2}`;
  
    // Prepare the data object
    const data = {
      query,
      id: selectedID, // Backend expects "id"
    };
  
  
  
    try {
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/generatesol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      console.log('API response status:', response.status);
  
      if (!response.ok) {
        throw new Error(`Failed to submit data. Status: ${response.status}`);
      }
  
      const result = await response.json();
  
      console.log('API response result:', result);
  
    // Close the sidebar
      setIsSidebarOpen(false);
      const task = result.tag.response?.task || 'No solution available';
      console.log('task:', task);
      // Extract the solution from the response
      const solution = result.tag.response?.solution || 'No solution available';
      console.log('Solution:', solution);
  
      //setMessage('Solution generated and saved successfully!');
      setSelectedTask(task);
      setSolution(solution);
    } catch (error) {
      //setMessage('Failed to generate solution. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-8 w-full">
        <header className="flex items-center justify-between mb-6 w-full flex-wrap">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">
            Hello, <span className="text-blue-900">User</span>
          </h2>
          <div className="flex items-center space-x-2 sm:space-x-4">
          < Notification/>
            <div className="flex items-center border border-gray-300 p-1 sm:p-2 rounded-md space-x-2">
              <Image
                src="/assets/image.png"
                width={28}
                height={28}
                className="rounded-full"
                alt="User Profile"
              />
              <span className="text-gray-800 text-sm sm:text-base lg:text-lg">
                User
              </span>
            </div>
          </div>
        </header>

      

{/* Facility Dropdown and Tabs */}
 <div className="flex items-center space-x-4 mt-4 lg:mt-8 ml-4 lg:ml-10 justify-between">
          {/* Facility Dropdown */}
          <div className="flex items-center space-x-4">
            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-900">
              Facility
            </h3>
            <div className="relative ml-2 sm:ml-4 lg:ml-6" ref={dropdownRef}>
  <button
    onClick={toggleDropdown}
    className="flex items-center bg-[#244979] text-white font-semibold text-sm px-3 py-2 rounded-lg"
  >
    <span className="font-[Plus Jakarta Sans]">Documents</span>
    <svg
      className="w-4 h-4 ml-2 transition-transform duration-200"
      fill="currentColor"
      viewBox="0 0 20 20"
      style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      ></path>
    </svg>
  </button>

  {/* Dropdown Menu */}
  {dropdownOpen && (
    <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg z-50 border border-gray-200">
      {documents.length > 0 ? (
        documents.map((doc, index) => {
          return (
            <button
              key={doc._id || index} // Use index as fallback
              onClick={() => {
                fetchDocumentDetails(doc._id); // Fetch details
                setDropdownOpen(false); // Close dropdown
              }}
              className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 text-xs sm:text-sm"
            >
              {doc.originalName || "Untitled Document"}
            </button>
          );
        })
      ) : (
        <p className="px-4 py-2 text-gray-500 text-xs sm:text-sm">No documents found.</p>
      )}
    </div>
  )}
</div>


          </div>

    
  

{/* Facility Tabs */}
<div className="flex flex-col items-center w-50 lg:w-auto mx-auto">
  {/* Tab Buttons */}
  <div className="flex items-center justify-center space-x-4 sm:space-x-6 lg:space-x-8">
    <button
      onClick={() => setActiveTab("POC AI Ally")}
      className={`pb-2 ${
        activeTab === "POC AI Ally"
          ? "text-blue-900 font-semibold"
          : "text-gray-700 font-medium"
      } text-xs sm:text-sm md:text-base lg:text-lg`}
    >
      POC AI Ally
    </button>

    <button
      onClick={() => setActiveTab("Tags")}
      className={`pb-2 ${
        activeTab === "Tags"
          ? "text-blue-900 font-semibold"
          : "text-gray-700 font-medium"
      } text-xs sm:text-sm md:text-base lg:text-lg`}
    >
      Tags
    </button>

    <button
      onClick={() => setActiveTab("Policy")}
      className={`pb-2 ${
        activeTab === "Policy"
          ? "text-blue-900 font-semibold"
          : "text-gray-700 font-medium"
      } text-xs sm:text-sm md:text-base lg:text-lg`}
    >
      Policy
    </button>
  </div>

  {/* Progress Bar */}
  <div className="relative w-full mt-2">
    {/* Gray Background Line */}
    <div className="absolute h-[3px] w-full bg-gray-300 rounded-full"></div>

    {/* Active Blue Line */}
    {activeTab === "POC AI Ally" && (
      <div
        className="absolute h-[3px] bg-blue-900 rounded-full transition-all duration-300"
        style={{ width: "33.33%" }} // Adjusted to handle 3 tabs
      ></div>
    )}
    {activeTab === "Tags" && (
      <div
        className="absolute h-[3px] bg-blue-900 rounded-full transition-all duration-300"
        style={{ width: "33.33%", left: "33.33%" }} // Adjusted for 2nd tab
      ></div>
    )}
    {activeTab === "Policy" && (
      <div
        className="absolute h-[3px] bg-blue-900 rounded-full transition-all duration-300"
        style={{ width: "33.33%", left: "66.66%" }} // Adjusted for 3rd tab
      ></div>
    )}
  </div>
</div>


 {/* Date */}
  <div className="relative flex items-center space-x-2">
  {/* Date Button */}
  <button
    onClick={toggleDropdown1}
    className="flex items-center bg-[#244979] text-white px-4 py-2 rounded-lg shadow-md text-xs sm:text-sm md:text-base font-semibold space-x-2"
  >
    {/* Calendar Icon */}
    <svg
      className="w-4 h-4 sm:w-5 sm:h-5"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        d="M3 8h18M21 5h-3V3a1 1 0 00-2 0v2H8V3a1 1 0 00-2 0v2H3a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V6a1 1 0 00-1-1zm0 4H3v10h18V9z"
      ></path>
    </svg>
    {/* Selected Date */}
    <span>{selectedDate.toLocaleDateString("en-GB")}</span>
    {/* Dropdown Arrow */}
    <svg
      className="w-4 h-4 sm:w-5 sm:h-5"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      ></path>
    </svg>
  </button>

  {/* Dropdown with Calendar */}
  {dropdownOpen1 && (
    <div className="absolute top-12 left-[-30%] md:left-[-50%] z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-2 w-[250px] sm:w-[300px] lg:w-[350px]">
    <DatePicker
      selected={selectedDate}
      onChange={(date: Date | null) => {
        if (date) {
          setSelectedDate(date);
        }
        setDropdownOpen1(false); // Close dropdown on date select
      }}
      inline
    />
  </div>
  )}
</div>

</div>

{activeTab === "Tags" && (
  <>
    {/* Divider */}
    <div className="w-full border-t border-gray-300 mt-4" style={{ borderColor: "#E0E0E0" }}></div>

    {/* Main Containers */}
    <div className="flex flex-col lg:flex-row justify-center mt-4 lg:mt-8 space-y-4 lg:space-y-0 lg:space-x-4">
      {/* Center Container */}
      <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#494D55] mb-4 lg:mb-12">
            {selectedTag || "Select a Tag"}
          </h4>
          <p
            className="text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E] mb-8 md:mb-16 lg:mb-32"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {selectedLongDesc || "Long description will appear here once you select a tag."}
          </p>
        </div>
      </div>

      {/* Right Container */}
      <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto flex flex-col justify-between">
       
{/* Tags List */}
<div className="grid grid-cols-2 gap-4 mb-4 mt-20">
  {tagsData.map((item, index) => (
    <div
      key={index}
      className="flex items-center justify-between bg-[#CCE2FF]  rounded-lg px-4 py-2 shadow-sm cursor-pointer hover:bg-blue-300 transition "
      onClick={() =>
        handleTagClick1(
          item.tag,
          item.shortDesc,
          item.longDesc,
          
        )
      } // Handle tag click
    >
      <span className="font-semibold text-gray-700">{item.tag}</span>
      <span className="text-gray-500">⋮</span>
    </div>
  ))}
</div>


 

      </div>
    </div>
  </>
)}

{activeTab === "POC AI Ally" && (
  <>
    {/* Divider */}
    <div className="w-full border-t border-gray-300 mt-4" style={{ borderColor: "#E0E0E0" }}></div>

 
 {/*Container*/}
<div className="flex flex-col lg:flex-row justify-center mt-4 lg:mt-8 space-y-4 lg:space-y-0 lg:space-x-4">
  
  {/* Left Container */}
  <div
  className="bg-white shadow-lg p-4 sm:p-6 flex flex-col justify-between w-full lg:w-[600px] h-auto rounded-lg border border-[#E0E0E0] mx-auto"
>
  <div>
    <h4 className="font-bold text-blue-900 text-lg mb-4">Tags</h4>
    <div>
  <div className="relative">
    {/* Tag Button */}
    <button
      className="flex justify-between items-center w-full max-w-[190px] h-[40px] px-4 rounded-lg text-sm sm:text-base mb-2"
      style={{ backgroundColor: "#CCE2FF", borderRadius: "12px" }}
      onClick={() => {
        console.log("Dropdown toggled. Current state:", dropdownOpen2);
        toggleDropdown2();
      }} // Toggle dropdown on click
    >
      <span>Tags</span>
      <span className="text-gray-500">⋮</span>
    </button>

    {/* Dropdown */}
    {dropdownOpen2 && (
      <div
        className="absolute mt-2 w-full max-w-[190px] bg-white border border-gray-300 rounded-lg shadow-lg z-10"
        style={{
          maxHeight: "200px",
          overflowY: "auto", // Enable vertical scrolling
        }}
      >
       <ul className="flex flex-col divide-y divide-gray-200">
  {tagsData.map((item, index) => {
    console.log(`Tag ${index} Data:`, item); // ✅ Log each tag data
    //alert(`Tag ${index} Data:\n` + JSON.stringify(item, null, 2)); // ✅ Show alert

    return (
      <li
        key={index}
        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        onClick={() =>
          handleTagClick(
            item.tag,
            item.shortDesc,
            item.longDesc,
            item.id,
            item.solution,
            item.policies
          )
        }
      >
        <div>
          <strong>{item.tag}</strong>
        </div>
      </li>
    );
  })}
</ul>

      </div>
    )}
  </div>

  {/* Selected Tag Short & Long Description */}
  {selectedDescription && (
    <div
      className="mt-4 text-[14px] leading-[17.64px] font-light"
      style={{
        color: "#33343E",
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
    >
      <h3 className="font-bold">{selectedTag}</h3>
      <p><strong>Short Description:</strong> {selectedDescription}</p>
      <p><strong>Long Description:</strong> {selectedLongDesc}</p>
    </div>
  )}
</div>

  </div>
  <button
        onClick={handleNavigateToPolicy}
        className="flex items-center justify-center bg-[#002F6C] text-white w-[200px] h-[40px] rounded-lg text-sm shadow-md transition-colors duration-300"
      >
        <FaFileAlt className="mr-2" />
        <span>Generate Policy</span>
      </button>
</div>


{/* Center Container */}
<div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto flex flex-col justify-between">
  <div>
    <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#494D55] mb-4 lg:mb-12">
      {selectedTag || "Select a Tag"} {/* Dynamically show tag name or default message */}
    </h4>
    <p
      className="text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E] mb-8 md:mb-16 lg:mb-32"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {selectedLongDesc || "Long description will appear here once you select a tag."} {/* Dynamically show or default */}
    </p>
  </div>
</div>

{/* right */}
<div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto flex flex-col justify-between">
 {/* Title and Top Icons */}
<div className="flex justify-between items-center">
  <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#002F6C]">
    Plan Of Correction
  </h4>
  {/* Action Buttons */}
  <div className="flex space-x-4">
    {/* Copy Icon */}
    <button
      onClick={() => {
        if (solution) {
          navigator.clipboard.writeText(solution).then(() => {
            // Show toast message
        const toast = document.createElement("div");
        toast.innerText = "Solution copied";
        toast.className =
          "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-sm px-4 py-2 rounded shadow-lg opacity-0 transition-opacity duration-300";
        document.body.appendChild(toast);

        // Trigger animation and remove toast after 3 seconds
        setTimeout(() => {
          toast.classList.remove("opacity-0");
        }, 10); // Start animation after adding to DOM
        setTimeout(() => {
          toast.remove();
        }, 3000);

            const copyButton = document.querySelector(".copy-button");
            if (copyButton) {
              copyButton.classList.add("bg-green-200"); // Highlight the button temporarily
              setTimeout(() => copyButton.classList.remove("bg-green-200"), 1000); // Remove highlight after 1 second
            }
          }).catch((err) => {
            console.error("Failed to copy solution: ", err);
          });
        } else {
          alert("No solution to copy.");
        }
      }}
      className="text-blue-800 hover:text-blue-600 transition-colors copy-button"
    >
      <Image
        src="/assets/Group.png" // Replace with the correct path to your image
        alt="Copy Icon"
        className="w-6 h-6"
        width={24} // Set the required width
        height={24} // Set the required height
      />
    </button>

    {/* Edit Icon */}
    <button
      onClick={handleEdit}
      className="text-blue-800 hover:text-blue-600 transition-colors"
    >
      <Image
        src="/assets/tabler_copy.png" // Replace with the correct path to your image
        alt="Edit Icon"
        className="w-6 h-6"
        width={24} // Set the required width
        height={24} // Set the required height
      />
    </button>

    
  </div>
  
</div>


<ul className="list-disc list-inside text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E] mb-56"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
  >
    {Array.isArray(solution) && solution.length > 0 ? (
      solution.map((solution, index) => (
        <li key={index}>
          {solution}
        </li>
      ))
    ) : (
      <li>No solution available.</li>
    )}
  </ul>

  {/* Centered Generate POC Button */}
  
  <div className="flex items-center justify-center mt-10">
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center bg-[#002F6C] text-white w-[160px] h-[40px] rounded-lg text-sm shadow-md transition-colors duration-300"
      >
        <FaFileAlt className="mr-2" />
        <span>Generate POC</span>
      </button>

      {/* Sidebar - New Plan Of Correction Form */}
{isSidebarOpen && (
  <>
    <div className="fixed top-0 right-0 h-full bg-white shadow-lg p-6 sm:p-8 md:p-10 z-50 w-full max-w-lg overflow-y-auto">
      {loading ? (
        // Show loading spinner or scrollable "Generating response..." message
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-[#002F6C] text-lg sm:text-xl md:text-2xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Generating Response...
          </p>
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          {/* Scrollable message */}
          <div className="mt-6 overflow-y-auto max-h-40 text-sm text-gray-600 p-4 border border-gray-200 rounded-lg">
            <p>We are processing your request. This may take a few seconds. Please wait...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Title and Subtitle */}
          <h2
            className="font-bold text-[#002F6C] mb-1 text-lg sm:text-xl md:text-2xl"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Additional Questions
          </h2>
          <p className="text-gray-900 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg">
            Provide us with a little more details
          </p>

          {/* Question 1 */}
          <div className="mb-6">
            <label
              className="block font-medium mb-2 whitespace-nowrap text-sm sm:text-base md:text-lg"
              style={{ color: '#000000', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              What has been done to address this?
            </label>
            <textarea
              className="w-full h-[60px] sm:h-[70px] px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-900 text-xs sm:text-sm md:text-base"
              placeholder="Enter your answer here..."
              value={answer1}
              onChange={(e) => setAnswer1(e.target.value)} // Update answer1 on input change
            ></textarea>
          </div>

          {/* Question 2 */}
          <div className="mb-12">
            <label
              className="block font-medium mb-2 whitespace-nowrap text-sm sm:text-base md:text-lg"
              style={{ color: '#000000', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Anything else we should know?
            </label>
            <textarea
              className="w-full h-[60px] sm:h-[70px] px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-900 text-xs sm:text-sm md:text-base"
              placeholder="Enter additional details..."
              value={answer2}
              onChange={(e) => setAnswer2(e.target.value)} // Update answer2 on input change
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 mb-10">
            {/* Close Button */}
            <button
              onClick={toggleSidebar} // Close sidebar on click
              className="flex items-center justify-center text-black w-full sm:w-[191px] h-[40px] sm:h-[56px] rounded-lg text-xs sm:text-sm md:text-base font-semibold shadow-md transition-colors duration-300 border border-gray-300 hover:bg-gray-200"
              style={{ borderRadius: '10px' }}
            >
              Back
            </button>

            {/* Submit Button */}
            <button
              onClick={handleSubmit} // Call the submit function
              className="flex items-center justify-center bg-[#002F6C] text-white w-full sm:w-[191px] h-[40px] sm:h-[56px] rounded-lg text-xs sm:text-sm md:text-base font-semibold shadow-md transition-colors duration-300 hover:bg-blue-800"
              style={{ borderRadius: '10px' }}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </>
      )}
    </div>

    {/* Background overlay */}
    <div
      className="fixed inset-0 bg-black opacity-50 z-40"
      onClick={toggleSidebar}
    ></div>
  </>
)}

    </div>
</div>

</div>
  </>
)}

{activeTab === "Policy" && (
  <>
    {/* Divider */}
    <div className="w-full border-t border-gray-300 mt-4" style={{ borderColor: "#E0E0E0" }}></div>

    {/* Main Containers */}
    <div className="flex flex-col lg:flex-row justify-center mt-4 lg:mt-8 space-y-4 lg:space-y-0 lg:space-x-4">
      {/* Center Container */}
      <div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#494D55] mb-4 lg:mb-12">
            {selectedTag || "Select a Tag"}
          </h4>
          <p
            className="text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E] mb-8 md:mb-16 lg:mb-32"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {selectedLongDesc || "Long description will appear here once you select a tag."}
          </p>
        </div>
      </div>
{/* Right Container */}
<div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto flex flex-col">
  <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#002F6C] mb-4">
    Policy
  </h4>

  <ul className="list-disc list-inside text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E] mt-6"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
  >
    {Array.isArray(selectedPolicy) && selectedPolicy.length > 0 ? (
      selectedPolicy.map((policy, index) => (
        <li key={index}>
          {policy}
        </li>
      ))
    ) : (
      <li>No policies available.</li>
    )}
  </ul>
</div>


    </div>
  </>
)}

{/* Bottom Buttons */}
<div className="flex justify-end space-x-4 mt-4">
<button
  onClick={handleAssignTask}
  className={`flex items-center justify-center border border-[#002F6C] text-[#002F6C] px-4 py-2 rounded-lg text-sm shadow-md transition-colors duration-300 ${
    loading ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'
  }`}
  disabled={loading}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4 mr-2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 10l4.553 4.553-4.553 4.553m-6-9L4.447 14.553 9 19"
    />
  </svg>
  {loading ? 'Assigning...' : 'Assign Task'}
</button>

<button
            onClick={handleNavigateToTags}
            className="flex items-center justify-center bg-[#002F6C] text-white px-4 py-2 rounded-lg text-sm shadow-md transition-colors duration-300"
          >
            Approve
</button>
</div>

      </div>
    </div>
  );
}

