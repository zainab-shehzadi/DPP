
"use client"; 
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";

import {FaFileAlt} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation"; // For navigation after successful reset
import Notification from '@/components/Notification'
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { constants } from 'node:crypto';
interface DocumentType {
  _id: string;
  originalName: string;
  fileUrl?: string; // Optional in case some documents lack a URL
}
export default function Dashboard() {


  const [tagsData, setTagsData] = useState<{
    id: number;
    tag: string;
    shortDesc: string;
    longDesc: string;
    solution: string;
    policies: string;
    task: string;
  }[]>([]);
  
const [facilities, setFacilities] = useState<string[]>([]); 
const searchParams = useSearchParams(); 
const [selectedTag, setSelectedTag] = useState<string | null>(null); 
const [selectedID, setSelectedID] = useState<number | null>(null); 
const [selectedLongDesc, setSelectedLongDesc] = useState<string | null>(null);
const [selectedPolicy, setSelectedPPolicy] = useState<string | null>(null);
const [selectedTask, setSelectedTask] = useState<any[]>([]); // Ensure it's an array
const [selectedFacility, setSelectedFacility] = useState<string>(""); 
const [email, setEmail] = useState<string | null>(null); 
const [visibleCount, setVisibleCount] = useState<number>(4);
const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); 
const [dropdownOpen, setDropdownOpen] = useState(false);
const [activeTab, setActiveTab] = useState("POC AI Ally");
const [solution, setSolution] = useState(''); 
const [dropdownOpen1, setDropdownOpen1] = useState(false); 
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

      console.log("API Response:", data); // Debugging log
    

      // Ensure response is an array
      if (Array.isArray(data)) {
        setDocuments(data); // ✅ Save documents in state
      } else {
        console.error("Unexpected API response format", data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  fetchDocuments();
}, []);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleNavigateToTags = () => {
    router.push("/Tags"); // Navigate to the UploadDoc page
  };
  const fetchDocumentDetails = async (id) => {
    try {
        console.log(`📤 Fetching Details for Document ID: ${id}`);

        const safeEmail = email ?? "";
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/tags-with-descriptions?email=${encodeURIComponent(safeEmail)}&id=${encodeURIComponent(id)}`;
        const response = await fetch(apiUrl);
      

        if (!response.ok) {
            console.error(`❌ Failed to fetch document details: ${response.statusText}`);
            setTagsData([]);
            alert("Error: Failed to fetch document details.");
            return;
        }

        const data = await response.json();
       

        // 🔍 Check API response structure
        if (!data.tags || !Array.isArray(data.tags)) {
          
            console.error("❌ API Error: `data.tags` is undefined or not an array:", data);
            return;
        }

        // ✅ Ensure the correct ID field is used
        const formattedTags = data.tags.map((tag) => ({
            id: tag.id || tag._id || "❌ Missing ID",
            tag: tag.tag,
            shortDesc: tag.shortDescription || "❌ No Short Description",
            longDesc: tag.longDescription || "❌ No Long Description",
            solution: tag.solution && tag.solution.trim() !== "" ? tag.solution : "❌ No Solution",  // ✅ Handle empty solution
            policies: tag.policies || "❌ No Policies",
            task: tag.task || [],
        }));

        // ✅ Ensure ID is present in logs
        formattedTags.forEach((tag, index) => {
            console.log(`🔹 Tag ${index} - ID: ${tag.id}`);
        });

        setTagsData(formattedTags);
        console.log("✅ Updated Tags Data:", formattedTags);
       

    } catch (error) {
        console.error("❌ Error fetching document details:", error);
        alert("❌ Error fetching document details:\n" );
    } finally {
        setLoading(false);
        console.log("⏳ Loading state set to false.");
    }
};
  const isAuthenticated = async () => {
    try {
      const safeEmail = email ?? ""; 
      
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
      const refreshToken = data.refreshToken; 
  
      if (!accessToken) {
        toast.error("Please log in with Google for assigned tasks.");
        router.push("/LoginPage");
        return false;
      }
  
      Cookies.set("accessToken", accessToken, { expires: 7 });
      Cookies.set("refreshToken", refreshToken, { expires: 30 }); // Refresh token valid for 7 days
  
      return true;
    } catch (error) {
      console.error("Error fetching tokens:", error);
      alert("Please log in with Google for assigned tasks.");
      router.push("/LoginPage"); 
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
    const accessToken = accessToken123;
     

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
const handleSubmit = async (e:any) => {
  e.preventDefault();
  if (solution && Array.isArray(solution) && solution.length > 0) {
    toast.info("Solution already exists.");
    return;
  }

  setLoading(true);

  if (![selectedTag, selectedLongDesc, selectedID, answer1, answer2].every(Boolean)) {
    toast.error("Please fill in all required fields before submitting.");
    setLoading(false);
    return;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/generatesol`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        query: `I belong to Tag ${selectedTag}, "${selectedLongDesc}", ${answer1} and ${answer2}`, 
        id: selectedID 
      }),
    });

    if (!response.ok) throw new Error(`API Error - Status: ${response.status}`);
    const result = await response.json();
    let newSolution = result.tag?.response?.solution || [];
    let newPolicies = result.tag?.response?.policies || [];
    let newTasks = result.tag?.response?.task || [];
    
    // Ensure all are arrays
    if (!Array.isArray(newSolution)) newSolution = [newSolution];
    if (!Array.isArray(newPolicies)) newPolicies = [newPolicies];
    if (!Array.isArray(newTasks)) newTasks = [newTasks];
    
    setSolution(newSolution);
    setSelectedTask(newTasks);
    

    if (result.tags) {
      const formattedTags = result.tags.map((tag) => ({
        id: tag.id,
        tag: tag.tag,
        shortDesc: tag.shortDescription || "",
        longDesc: tag.longDescription || "",
        solution: tag.solution || "",
        policies: tag.policies || "",
        task: tag.task || [],
      }));

      setTagsData(formattedTags);
      console.log("Updated Tags Data:", formattedTags);

     
    }
// Reset answer fields after submission
setAnswer1("");
setAnswer2("");
    setIsSidebarOpen(false);
    toast.success("Solution generated and tags updated successfully!");
  } catch (error) {
    toast.error(`Error`);
  } finally {
    setLoading(false);
  }
};

  const handleTagClick = async (tagName, tagId) => {
   

    try {
        // ✅ Construct URL with query parameters
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/tag-details?tagId=${tagId}&tagName=${encodeURIComponent(tagName)}`;
        console.log("📡 API Request URL:", apiUrl);

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`API Error - Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("✅ API Response:", result);

        // ✅ Extract solution, policies, and tasks from API response
        let newSolution = result.solution || [];
        let newPolicies = result.policies || [];
        let newTasks = result.task || [];

        // ✅ Ensure values are always arrays
        if (!Array.isArray(newSolution)) newSolution = [newSolution];
        if (!Array.isArray(newPolicies)) newPolicies = [newPolicies];
        if (!Array.isArray(newTasks)) newTasks = [newTasks];

        // ✅ Update state properly
        setSelectedTag(tagName);
        setSelectedID(tagId);
        setSelectedPPolicy(newPolicies);
        setSelectedDescription(result.shortDescription || "No short description available");
        setSelectedLongDesc(result.longDescription || "No long description available");
        setSolution(newSolution);

        console.log("✅ Updated State:", { newSolution, newPolicies, newTasks });
    } catch (error) {
        console.error("❌ Error fetching tag details:", error);
        toast.error(`Error`);
    }
};

  const toggleDropdown2 = () => setDropdownOpen2(!dropdownOpen2);
  const toggleDropdown1 = () => setDropdownOpen1(!dropdownOpen1);
  const toggleDropdown = () => { setDropdownOpen(prev => !prev); };  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
 
  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-8 w-full">
     
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

{activeTab === "POC AI Ally" && (
  <>
    {/* Divider */}
    <div className="w-full border-t border-gray-300 mt-4" style={{ borderColor: "#E0E0E0" }}></div>

 
 {/*Container*/}
<div className="flex flex-col lg:flex-row justify-center mt-4 lg:mt-8 space-y-4 lg:space-y-0 lg:space-x-4">
  
  {/* Left Container */}
  <div
  className="bg-white shadow-lg p-4 sm:p-6 flex flex-col justify-between w-full lg:w-[400px] h-auto rounded-lg border border-[#E0E0E0] mx-auto"
>
  <div>
    <h4 className="font-bold text-blue-900 text-lg mb-4">Tags</h4>
    <div>
    <div className="relative">
  {/* Tag Button */}
  <button
    className="flex justify-between items-center w-full max-w-[190px] h-[40px] px-4 rounded-lg text-sm sm:text-base mb-2"
    style={{ backgroundColor: "#CCE2FF", borderRadius: "12px" }}
    onClick={() => toggleDropdown2()} // Toggle dropdown
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
        {tagsData.map((item, index) => (
          <li
            key={item.id || index}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-all duration-300 hover:shadow-md"
            onClick={() => {
              handleTagClick(item.tag, item.id);
              setDropdownOpen2(false); // ✅ Close dropdown on click
            }}
          >
            <div>
              <strong>{item.tag}</strong>
            </div>
          </li>
        ))}
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
      
      {selectedDescription}
    
    </div>
  )}
</div>

  </div>
  <button
        //onClick={handleNavigateToPolicy}
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

{/* Right Panel */}
<div className="bg-white border shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto flex flex-col justify-between">
  {/* Title */}
  <div>
    <h4 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#494D55] mb-4 lg:mb-12">
      Plan of Correction
    </h4>
    <p
      className="text-sm sm:text-base lg:text-md font-light leading-relaxed text-[#33343E] mb-8 md:mb-16 lg:mb-32"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {solution && solution.length > 0 ? solution : "No found solution."} {/* Show existing solution or default message */}
    </p>
  </div>

  {/* Only show "Generate POC" if no solution exists */}
  {!solution || solution.length === 0 ? (
    <div className="flex items-center justify-center mt-10">
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center bg-[#002F6C] text-white w-[160px] h-[40px] rounded-lg text-sm shadow-md transition-colors duration-300"
      >
        <FaFileAlt className="mr-2" />
        <span>Generate POC</span>
      </button>
    </div>
  ) : null}

  {/* Sidebar - Only show if `isSidebarOpen` and no existing solution */}
  {isSidebarOpen && (!solution || solution.length === 0) && (
    <>
      <div className="fixed top-0 right-0 h-full bg-white shadow-lg p-6 sm:p-8 md:p-10 z-50 w-full max-w-lg overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-[#002F6C] text-lg sm:text-xl md:text-2xl font-bold mb-4">
              Generating Response...
            </p>
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="mt-6 overflow-y-auto max-h-40 text-sm text-gray-600 p-4 border border-gray-200 rounded-lg">
              <p>We are processing your request. This may take a few seconds. Please wait...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Title */}
            <h2 className="font-bold text-[#002F6C] mb-1 text-lg sm:text-xl md:text-2xl">
              Additional Questions
            </h2>
            <p className="text-gray-900 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg">
              Provide us with a little more details
            </p>

            {/* Question 1 */}
            <div className="mb-6">
              <label className="block font-medium mb-2 whitespace-nowrap text-sm sm:text-base md:text-lg">
                What has been done to address this?
              </label>
              <textarea
                className="w-full h-[60px] sm:h-[70px] px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-900 text-xs sm:text-sm md:text-base"
                placeholder="Enter your answer here..."
                value={answer1}
                onChange={(e) => setAnswer1(e.target.value)}
              ></textarea>
            </div>

            {/* Question 2 */}
            <div className="mb-12">
              <label className="block font-medium mb-2 whitespace-nowrap text-sm sm:text-base md:text-lg">
                Anything else we should know?
              </label>
              <textarea
                className="w-full h-[60px] sm:h-[70px] px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-900 text-xs sm:text-sm md:text-base"
                placeholder="Enter additional details..."
                value={answer2}
                onChange={(e) => setAnswer2(e.target.value)}
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 mb-10">
              <button
                onClick={toggleSidebar}
                className="flex items-center justify-center text-black w-full sm:w-[191px] h-[40px] sm:h-[56px] rounded-lg text-xs sm:text-sm md:text-base font-semibold shadow-md transition-colors duration-300 border border-gray-300 hover:bg-gray-200"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center justify-center bg-[#002F6C] text-white w-full sm:w-[191px] h-[40px] sm:h-[56px] rounded-lg text-xs sm:text-sm md:text-base font-semibold shadow-md transition-colors duration-300 hover:bg-blue-800"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Background overlay */}
      <div className="fixed inset-0 bg-black opacity-50 z-40" onClick={toggleSidebar}></div>
    </>
  )}
</div>

</div>
  </>
)}


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
    key={item.id || index}
      className="flex items-center justify-between bg-[#CCE2FF]  rounded-lg px-4 py-2 shadow-sm cursor-pointer hover:bg-blue-300 transition "
      onClick={() => {
        handleTagClick(item.tag, item.id);
        setDropdownOpen2(false); // ✅ Close dropdown on click
      }
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
