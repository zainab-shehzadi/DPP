"use client"; // <-- Ensures this file is treated as a client component

import Image from 'next/image';
import { FaBell } from 'react-icons/fa';
import React, { useState, useEffect } from "react";

import Sidebar from "@/components/Sidebar";
interface Task {
  _id: string | number; //
  task: string; // Task name
  taskSummary: string; // Summary of the task
  assignedTo: Array<{ firstname: string }>; // Array of assigned participants
  dateAdded: string; // Date the task was added
  startDate: string; // Start date of the task
  endDate: string; // End date or deadline of the task
  status: string;
  column: string; // Column (e.g., "To Do", "In Progress", etc.)
}

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [department, setDepartment] = useState<string | null>(null);
  const [dropdownOpen1, setDropdownOpen1] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([
    {
      _id: "",  
      task: "", // Task name
      taskSummary: "", // Task summary
      assignedTo: [{ firstname: "" }], 
      dateAdded: "", // Task added date
      startDate: "", // Start date
      endDate: "", // End date or deadline
      status: "",
      column: "To Do", // Default column
    },
  ]);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  // Helper function to get cookies
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }
    return null;
  };
  useEffect(() => {
    const departmentFromCookie = getCookie("DepartmentName");
    console.log("Department from cookies:", departmentFromCookie);

    if (departmentFromCookie) {
      setDepartment(departmentFromCookie);
    } else {
      console.warn("Department cookie not found.");
    }
  }, []);
  useEffect(() => {
    if (department) {
      console.log("Fetching tasks for department:", department);
      fetchTasks();
    } else {
      console.warn("Department is not set; skipping fetchTasks.");
    }
  }, [department]);


const renderTasksForColumn = (column: string) => {
  return tasks
    .filter((task) => task.column === column)
    .map((task) => {
      const uniqueKey = task._id; // Use task ID directly
      return (
        <div
          key={uniqueKey}
          className="bg-[#E0E4EA] p-4 mb-4 shadow-sm rounded-lg relative cursor-pointer"
          onClick={() => setSelectedTask(task)}
        >

          <h3 className="font-bold text-base md:text-md">{task.taskSummary}</h3>
          <p className="text-sm lg:text-base text-gray-600">
            Assigned to:{" "}
            {Array.isArray(task.assignedTo) && task.assignedTo.length > 0
              ? task.assignedTo.map((person, idx) => (
                  <span key={idx}>
                    {person.firstname || "Unknown"}
                    {idx < task.assignedTo.length - 1 ? ", " : ""}
                  </span>
                ))
              : "No one assigned to this task."}
          </p>
          <p className="text-sm lg:text-base text-gray-600">
            Date added: {new Date(task.startDate).toLocaleDateString()}
          </p>
        </div>
      );
    });
};
  const fetchTasks = async () => {
    try {
      // Check if department is set
      if (!department) {
        console.error("Department is not specified.");
        return;
      }
  
      // Make a POST request to the API with the department in the request body
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/calendar/taskdetail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ department }), // Pass the department as JSON
        }
      );
  
      // Parse the JSON response
      const data = await response.json();
  
      // Check for a successful response
      if (response.ok && data.success) {
        console.log("Tasks fetched successfully:", data.tasks);
  
        // Update tasks based on their status
        const updatedTasks = data.tasks.map((task) => {
          let column = "Closed"; // Default to "Closed"
          if (task.status === "pending") {
            column = "In Progress";
          } else if (task.status === "in-progress") {
            column = "In Progress";
          } else if (task.status === "completed") {
            column = "Closed";
          }
  
          return {
            ...task,
            column: column, // Set the column based on the task status
          };
        });
  
        setTasks(updatedTasks); // Update the state with the fetched tasks
      } else {
        console.error(
          "Failed to fetch tasks:",
          data.message || response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching tasks:", error); // Log any errors
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Mobile Toggle Button */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-[#002F6C] text-white">
        <div className="h-12 w-12 bg-cover bg-center" style={{ backgroundImage: "url('/assets/logo.avif')" }}></div>
      </div>

      {/* Sidebar Component */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-8 w-full">
        <header className="flex items-center justify-between mb-6 w-full flex-wrap">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">
            Hello, <span className="text-blue-900">User</span>
          </h2>
          <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
            <FaBell className="text-gray-500 text-base sm:text-lg lg:text-xl" />
            <div className="flex items-center border border-gray-300 p-1 sm:p-2 rounded-md space-x-2">
              <Image
                src="/assets/image.png"
                width={28}
                height={28}
                className="rounded-full sm:w-10 sm:h-10 lg:w-12 lg:h-12"
                alt="User Profile"
              />
              <span className="text-gray-800 text-sm sm:text-base lg:text-lg">User</span>
            </div>
          </div>
        </header>

        {/* Facility Dropdown and Tabs Container */}
        <div className="flex items-center space-x-4 mt-4 lg:mt-8 ml-4 lg:ml-10 justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-900">Facility</h3>
            <div className="relative ml-4 sm:ml-6 lg:ml-10">
              <button 
                onClick={toggleDropdown} 
                className="flex items-center bg-blue-900 text-white font-semibold text-[11px] leading-[14px] px-4 py-2 rounded-lg"
              >
                <span className="font-[Plus Jakarta Sans]">Lorem Ipsum</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute mt-2 w-full bg-white shadow-lg rounded-lg">
                  <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200 text-sm sm:text-base md:text-lg">Option 1</a>
                  <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200 text-sm sm:text-base md:text-lg">Option 2</a>
                  <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200 text-sm sm:text-base md:text-lg">Option 3</a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full border-t border-gray-300 mt-4" style={{ borderColor: '#E0E0E0' }}></div>

       {/* Task Detail Container */}
<div className="bg-white p-6 rounded-lg shadow-md mx-auto mt-8 sm:mt-10 w-full max-w-[1400px]" style={{ borderRadius: '16px', border: '1px solid #E0E0E0' }}>
{/* Header Information */}
<div className="flex flex-wrap mb-9 justify-between sm:gap-7">
  {/* Date and Participants Box */}
  <div className="bg-[#F6F6F6] p-6 rounded-[17px] flex flex-col justify-center w-full sm:w-[48%] md:w-[48%] lg:w-[48%] xl:w-[48%] h-auto sm:h-[120px] mb-4 sm:mb-0">
    <p className="font-bold text-sm">
      Date added: <span className="font-normal">{selectedTask ? new Date(selectedTask.startDate).toLocaleDateString() : "N/A"}</span>
    </p>
    <p className="font-bold text-sm mt-2">
      Deadline: <span className="font-normal">{selectedTask ? new Date(selectedTask.endDate).toLocaleDateString() : "N/A"}</span>
    </p>
    <p className="font-bold text-sm mt-2">
      Participants: <span className="font-normal">
        {selectedTask && Array.isArray(selectedTask.assignedTo) && selectedTask.assignedTo.length > 0
          ? selectedTask.assignedTo.map((person, idx) => (
              <span key={idx}>{person.firstname || "Unknown"}{idx < selectedTask.assignedTo.length - 1 ? ", " : ""}</span>
            ))
          : "No participants"}
      </span>
    </p>
  </div>

  {/* Description Box */}
  <div className="bg-[#F6F6F6] p-6 rounded-[17px] flex items-center justify-center w-full sm:w-[48%] md:w-[48%] lg:w-[48%] xl:w-[48%] h-auto sm:h-[120px]">
    <p className="text-gray-800 text-left text-sm md:text-base lg:text-left font-bold text-lg md:text-xl">
      {selectedTask ? selectedTask.taskSummary : "Select a task to view details."}
    </p>
  </div>
</div>
{/* Task Columns */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
  {/* Completed Column */}
  <div className="bg-[#F6F6F6] p-6 rounded-[17px] shadow-md w-full h-auto">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-lg lg:text-xl">Completed</h3>
    </div>
    {renderTasksForColumn("Closed")}
  </div>

  {/* In Progress Column */}
  <div className="bg-[#F6F6F6] p-6 rounded-[17px] shadow-md w-full h-auto">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-lg lg:text-xl">In Progress</h3>
    </div>
    {renderTasksForColumn("In Progress")}
  </div>
</div>

</div>

      </div>
    </div>
  );
}
