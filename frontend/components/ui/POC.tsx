
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";


import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation"; // For navigation after successful reset


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

const [selectedLongDesc, setSelectedLongDesc] = useState<string | null>(null); // To store the long description of the selected tag



const [email, setEmail] = useState<string | null>(null); // Email from localStorage

const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // Sidebar toggle

const [activeTab, setActiveTab] = useState("POC AI Ally");
const [solution, setSolution] = useState(''); // Holds the solution text to display in the POC container

const [dropdownOpen2, setDropdownOpen2] = useState(false); // State for dropdown visibility
const [selectedDescription, setSelectedDescription] = useState<string | null>( null ); // Short description of the selected tag
const [answer1, setAnswer1] = useState('');
const [answer2, setAnswer2] = useState('');

const router = useRouter();
const id = searchParams.get("id");

    // Helper function to get cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    useEffect(() => {
      // Retrieve email from cookies on component mount
      const storedEmail = getCookie("email");
      if (storedEmail) {
        setEmail(storedEmail); // Set the email state if found in cookies
      }
    }, []);

   const handleTagClick = (tag: string, shortDesc: string, longDesc: string, id:number, solution:string ,policies :string) => {
    setSelectedTag(tag); // Update selected tag
    setSelectedID(id);
    setSelectedDescription(shortDesc); // Update selected short description
    setSelectedLongDesc(longDesc); // Update selected long description
    setSolution(solution);
    setSelectedPPolicy(policies);
    setDropdownOpen2(false); // Close the dropdown
  };

  


  const toggleDropdown2 = async () => {
    // Toggle dropdown visibility
    setDropdownOpen2((prev) => !prev);
  
    // Only fetch data if the dropdown is opening
    if (!dropdownOpen2) {
      try {
        // Validate email and ID
        if (typeof email !== "string" || !email.trim() || !id) {
          console.error("Invalid email or ID");
          setTagsData([]); // Reset tags data
          return;
        }
        // Fetch tags and descriptions using both email and id
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/tags-with-descriptions?email=${encodeURIComponent(email)}&id=${encodeURIComponent(id)}`
        );

        if (!response.ok) {
          console.error("Failed to fetch tags data:", response.statusText);
          setTagsData([]); // Reset tags data
          return;
        }
  
        const data = await response.json();
  
        console.log("Fetched tags data:", data);
  
        // Ensure the response is an array
        if (Array.isArray(data)) {
          // Map the data and set tags
          setTagsData(
            data.map((item) => ({
              id: item.id || "Unknown ID",
              tag: item.tag || "Unknown Tag",
              shortDesc: item.shortDesc || "No short description available.",
              longDesc: item.longDesc || "No long description available.",
              solution: item.solution || "No solution available.",
              policies :item.policies || "No policy available.",
              task: item.task, // Include the task object
            }))
          );
        } else {
          console.warn("Fetched data is not an array:", data);
          setTagsData([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error("Error fetching tags data:", error);
        setTagsData([]); // Fallback to an empty array
      }
    }
  };
 



  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
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
  
 
  
  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-8 w-full">
    

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
          onClick={toggleDropdown2} // Toggle dropdown on click
        >
          <span>Tags</span>
          <span className="text-gray-500">⋮</span>
        </button>

        {/* Dropdown */}
        {dropdownOpen2 && (
          <div
            className="absolute mt-2 w-full max-w-[190px] bg-white border border-gray-300 rounded-lg shadow-lg z-10"
            style={{
              maxHeight: "200px", // Fixed height for scrollable content
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            <ul className="flex flex-col divide-y divide-gray-200">
              {tagsData.map((item, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleTagClick(item.tag, item.shortDesc,item.longDesc,item.id,item.solution,item.policies)} // Handle tag click
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

      {/* Selected Tag Short Description */}
      {selectedDescription && (
        <div
          className="mt-4 text-[14px] leading-[17.64px] font-light"
          style={{
            color: "#33343E",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          <p>{selectedDescription}</p>
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




      </div>
    </div>
  );
}
