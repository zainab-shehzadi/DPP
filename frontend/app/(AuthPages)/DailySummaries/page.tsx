"use client"; // <-- Ensures this file is treated as a client component

import Notification from "@/components/Notification";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import UserDropdown from "@/components/profile-dropdown";
import Sidebar from "@/components/Sidebar";
import DateDisplay from "@/components/date";
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

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [department, setDepartment] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const departmentFromCookie = Cookies.get("DepartmentName");
    console.log("Department from cookies:", departmentFromCookie);

    if (departmentFromCookie) {
      setDepartment(departmentFromCookie);
    } else {
      console.warn("Department cookie not found.");
    }
  }, []);
  useEffect(() => {
   
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); 

    return () => clearTimeout(timer); 
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
            <h3 className="font-bold text-base md:text-md">
              {task.taskSummary}
            </h3>
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
      if (!department) {
        console.error("Department is not specified.");
        return;
      }

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
        console.log("Tasks fetched successfully:", data.tasks);

        const updatedTasks = data.tasks.map((task) => {
          let column = "Closed";
          if (task.status === "pending") {
            column = "In Progress";
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
        console.error(
          "Failed to fetch tasks:",
          data.message || response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  const name = Cookies.get("name");

  return (
    <div className="flex flex-col lg:flex-row">
       <Sidebar isSidebarOpen={isSidebarOpen} />
       {loading ? (
        // ✅ **Loader Section**
        <div className="flex items-center justify-center w-full h-screen ma-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      ) : (
        <>
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-[#002F6C] text-white">
        <img src="/assets/logo-dpp1.png" alt="Logo" className="h-8 w-auto" />
      </div>

     
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

        {/* Facility Dropdown and Tabs Container */}
        <div className="flex items-center space-x-4 mt-4 lg:mt-8 ml-4 lg:ml-10 justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-900">
              Facility
            </h3>
          </div>
          {/* Date */}
          <div className="relative flex items-center space-x-2">
            <DateDisplay />
          </div>
        </div>

        <div
          className="w-full border-t border-gray-300 mt-4"
          style={{ borderColor: "#E0E0E0" }}
        ></div>

        {/* Task Detail Container */}
        <div
          className="bg-white p-6 rounded-lg shadow-md mx-auto mt-8 sm:mt-10 w-full max-w-[1400px]"
          style={{ borderRadius: "16px", border: "1px solid #E0E0E0" }}
        >
          {/* Header Information */}
          <div className="flex flex-wrap mb-9 justify-between sm:gap-7">
            {/* Date and Participants Box */}
            <div className="bg-[#F6F6F6] p-6 rounded-[17px] flex flex-col justify-center w-full sm:w-[48%] md:w-[48%] lg:w-[48%] xl:w-[48%] h-auto sm:h-[120px] mb-4 sm:mb-0">
              <p className="font-bold text-sm">
                Date added:{" "}
                <span className="font-normal">
                  {selectedTask
                    ? new Date(selectedTask.startDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </p>
              <p className="font-bold text-sm mt-2">
                Deadline:{" "}
                <span className="font-normal">
                  {selectedTask
                    ? new Date(selectedTask.endDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </p>
              <p className="font-bold text-sm mt-2">
                Participants:{" "}
                <span className="font-normal">
                  {selectedTask &&
                  Array.isArray(selectedTask.assignedTo) &&
                  selectedTask.assignedTo.length > 0
                    ? selectedTask.assignedTo.map((person, idx) => (
                        <span key={idx}>
                          {person.firstname || "Unknown"}
                          {idx < selectedTask.assignedTo.length - 1 ? ", " : ""}
                        </span>
                      ))
                    : "No participants"}
                </span>
              </p>
            </div>

            {/* Description Box */}
            <div className="bg-[#F6F6F6] p-6 rounded-[17px] flex items-center justify-center w-full sm:w-[48%] md:w-[48%] lg:w-[48%] xl:w-[48%] h-auto sm:h-[120px]">
              <p className="text-gray-800 text-left text-sm md:text-base lg:text-left font-bold text-lg md:text-xl">
                {selectedTask
                  ? selectedTask.taskSummary
                  : "Select a task to view details."}
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
      </>
      )}
    </div>
  );
}
