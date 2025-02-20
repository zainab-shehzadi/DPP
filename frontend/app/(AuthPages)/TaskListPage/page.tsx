"use client"; // <-- Ensures this file is treated as a client component

import Image from 'next/image';
import { FaBell } from 'react-icons/fa';
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Sidebar from "@/components/Sidebar";
import { toast } from "react-toastify";
import authProtectedRoutes from '@/hoc/authProtectedRoutes';
interface Task {
  _id: string | number; 
  task: string; 
  taskSummary: string;
  assignedTo: Array<{ firstname: string }>; 
  dateAdded: string; 
  startDate: string; 
  endDate: string; 
  status: string;
  column: string; 
}

 function taskList() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [department, setDepartment] = useState<string | null>(null);
  const [dropdownOpen1, setDropdownOpen1] = useState<string | number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([
    {
      _id: "",  
      task: "", 
      taskSummary: "",
      assignedTo: [{ firstname: "" }], 
      dateAdded: "", 
      startDate: "",
      endDate: "", 
      status: "",
      column: "To Do", 
    },
  ]);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);


  const toggleDropdown1 = (key: string | number | null) => {
    setDropdownOpen1(dropdownOpen1 === key ? null : key);
  };
  
  
  useEffect(() => {
    const department =Cookies.get("DepartmentName");
    setDepartment(department);
    if (department) {
      fetchTasks();
    } else {
      toast.success("Department is not set; skipping fetchTasks.");
    }
  }, [department]);

const moveTaskToColumn = async (_id: string, column: string) => {
  
  const statusMap: { [key: string]: string } = {
    "To Do": "pending",
    "In Progress": "in-progress",
    "Closed": "completed",
    "Frozen": "frozen", 
  };

  const status = statusMap[column];

  // Update local tasks state
  setTasks((prevTasks) =>
    prevTasks.map((task) =>
      task._id === _id ? { ...task, column, status } : task
    )
  );

  setDropdownOpen1(null);

  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/calendar/updateTask`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: _id, status }), // Send status to the backend
    });
  } catch (error) {
    console.error("Failed to update task status", error);
  }
};


const renderTasksForColumn = (column: string) => {
  return tasks
    .filter((task) => task.column === column)
    .map((task) => {
      const uniqueKey = task._id; 
      return (
        <div
          key={uniqueKey}
          className="bg-[#E0E4EA] p-4 mb-4 shadow-sm rounded-lg relative cursor-pointer"
          onClick={() => setSelectedTask(task)}
        >
          <div
            className="absolute top-2 right-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              toggleDropdown1(uniqueKey);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6 text-gray-600"
            >
              <path d="M12 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM12 12c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2zM12 18c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2z" />
            </svg>
          </div>

          {dropdownOpen1 === uniqueKey && (
            <div className="absolute top-10 right-2 bg-white border rounded-md shadow-lg z-10">
              <ul className="py-2 text-sm text-gray-700">
                {["In Progress", "Closed", "Frozen", "To Do"].map((status) => (
                  <li
                    key={status}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => moveTaskToColumn(String(uniqueKey), status)}
                  >
                    {status}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h3 className="font-bold text-sm md:text-md">{task.taskSummary}</h3>
          <p className="text-sm lg:text-sm text-gray-600">
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
          <p className="text-sm lg:text-sm text-gray-600">
            Date added: {new Date(task.startDate).toLocaleDateString()}
          </p>
        </div>
      );
    });
};
const fetchTasks = async () => {
  
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/calendar/taskdetail`, 
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ department }), 
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      toast.success("Tasks fetched successfully:", data.tasks);

      const updatedTasks = data.tasks.map((task) => {
        let column = "Closed"; 
        if (task.status === "pending") {
          column = "To Do";
        } else if (task.status === "in-progress") {
          column = "In Progress";
        } else if (task.status === "completed") {
          column = "Closed";
        }

        return {
          ...task,
          column: column, 
        };
      });

      setTasks(updatedTasks); 
    } else {
    }
  } catch (error) {
    toast.error("An error occurred while fetching tasks. Please try again.");
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
            {/* <div className="relative ml-4 sm:ml-6 lg:ml-10">
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
            </div> */}
          </div>
        </div>

        <div className="w-full border-t border-gray-300 mt-4" style={{ borderColor: '#E0E0E0' }}></div>

        {/* Task Detail Container */}
        <div className="bg-white p-6 rounded-lg shadow-md mx-auto mt-8 sm:mt-10 w-full max-w-[1400px]" style={{ borderRadius: '16px', border: '1px solid #E0E0E0' }}>
       
{/* Header Information */}
<div className="flex flex-wrap gap-2 mb-8 justify-between items-stretch">
  {/* Date and Participants Box */}
  <div className="bg-[#F6F6F6] p-6 rounded-[17px] flex flex-col justify-center w-full sm:w-[32%] h-auto sm:h-[120px] mb-4 sm:mb-0">
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
  <div className="bg-[#F6F6F6] p-6 rounded-[17px] flex items-center justify-center w-full sm:w-[32%] h-auto sm:h-[120px] mb-4 sm:mb-0">
    <p className="text-gray-800 text-left  font-bold text-lg md:text-md">
      {selectedTask ? selectedTask.taskSummary : "Select a task to view details."}
    </p>
  </div>
  {/* Task Summary Box */}
  <div className="bg-[#F6F6F6] p-4 rounded-[17px] flex flex-col justify-center w-full sm:w-[32%] h-auto sm:h-[120px]">
    <p className="font-bold text-sm mb-1">
      All tasks: <span className="font-normal">{tasks.length}</span>
    </p>
    <p className="font-bold text-sm mb-1">
      Done: <span className="font-normal">{tasks.filter(task => task.column === "Closed").length}</span>
    </p>
    <p className="font-bold text-sm">
      Frozen: <span className="font-normal">{tasks.filter(task => task.column === "Frozen").length}</span>
    </p>
  </div>
</div>


          {/* Task Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* To-Do Column */}
            <div className="bg-[#F6F6F6] p-6 rounded-[17px] shadow-md w-full h-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg lg:text-xl">To Do</h3>
              </div>
              {renderTasksForColumn("To Do")}
            </div>

            {/* In Progress Column */}
            <div className="bg-[#F6F6F6] p-6 rounded-[17px] shadow-md w-full h-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg lg:text-xl">In Progress</h3>
              </div>
              {renderTasksForColumn("In Progress")}
            </div>

            {/* Closed Column */}
            <div className="bg-[#F6F6F6] p-6 rounded-[17px] shadow-md w-full h-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg lg:text-xl">Closed</h3>
              </div>
              {renderTasksForColumn("Closed")}
            </div>

            {/* Frozen Column */}
            <div className="bg-[#F6F6F6] p-6 rounded-[17px] shadow-md w-full h-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg lg:text-xl">Frozen</h3>
              </div>
              {renderTasksForColumn("Frozen")}
            </div>


            
          </div>
        </div>
      </div>
    </div>
  );
}
export default authProtectedRoutes(taskList);