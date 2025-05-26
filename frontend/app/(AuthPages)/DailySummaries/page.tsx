"use client";
import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import Sidebar from "@/components/Sidebar";
import UserDropdown from "@/components/profile-dropdown";
import Notification from "@/components/Notification";
import DateDisplay from "@/components/date";
import HeaderWithToggle from "@/components/HeaderWithToggle";
import CreateTaskModal from "@/components/Modals/CreateTaskModal";
import authProtectedRoutes from "@/hoc/authProtectedRoutes";
import TaskDetailModal from "@/components/Modals/TaskDetailModel";

export interface Task {
  _id: string;
  headline: string;
  description: string;
  task: string;
  taskSummary?: string;
  department: string;
  role: string;
  assignedTo: Array<{ firstname: string; lastname?: string; _id?: string }>;
  startDate: string;
  endDate: string;
  frequency:
    | "daily"
    | "weekly"
    | "biweekly"
    | "monthly"
    | "quarterly"
    | "custom";
  customSchedule?: string[];
  status: "pending" | "in-progress" | "completed";
  column: "To Do" | "In Progress" | "Closed";
  createdAt?: string;
  taskGroupId?: string;
  solutionText?: string;
  documentId?: string;
  documentName?: string;
}

interface DocumentType {
  _id: string;
  originalName: string;
  name?: string;
}

function TaskList() {
  const [userRole, setUserRole] = useState("");
  const [userLoading, setUserLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen1, setDropdownOpen1] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const token = Cookies.get("token");
  const name = Cookies.get("name");
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen1(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const email = Cookies.get("token");
        if (!email) {
          console.error("Error: Email not found in cookies!");
          return;
        }
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/docs`,
          {
            method: "GET",
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setDocuments(data);
        }
      } catch (error) {
        toast.error("Error fetching documents");
      }
    };
    fetchDocuments();
  }, [token]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        );

        const data = await res.json();
        if (res.ok) {
          setUserRole(data.user.role);
        } else {
          console.error("Failed to get user info:", data.message);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleCheckboxChange = (docId: string) => {
    setSelectedDocs((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectDocument = (doc: DocumentType) => {
    setSelectedDocument(doc);
    setSelectedDocId(doc._id);
    setDropdownOpen(false);
  };

  const handleDeleteSelected = async () => {
    const token = Cookies.get("token");
    if (!selectedDocs || selectedDocs.length === 0 || !token) {
      toast.error("Missing token or document IDs");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/delete-documents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ documentIds: selectedDocs }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        toast.success("Documents deleted successfully");
        setDocuments((prevDocs) =>
          prevDocs.filter((doc) => !selectedDocs.includes(doc._id))
        );
        setSelectedDocs([]);
        setDropdownOpen(false);
      } else {
        toast.error(" Failed to delete documents");
      }
    } catch (error) {
      console.error("Error deleting documents:", error);
      toast.error("Something went wrong.");
    }
  };

  const fetchTasksByDocument = async (docId: string) => {
    setLoading(true); // Always show loader first
    if (!docId) {
      setTasks([]); // Clear tasks when no docId
      setLoading(false); // Stop loading
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/get-by-document?documentId=${docId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (res.ok) {
        const updated = data.tasks.map((task: any) => ({
          ...task,
          column:
            task.status === "pending"
              ? "To Do"
              : task.status === "in-progress"
              ? "In Progress"
              : "Closed",
          taskSummary: task.task,
          assignedTo: [{ firstname: name || "You" }],
          startDate: task.startDate || new Date().toISOString(),
          endDate: task.endDate || new Date().toISOString(),
        }));
        setTasks(updated);
      } else {
        toast.error(data.message || "Failed to load tasks");
      }
    } catch (err) {
      toast.error("Error fetching tasks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDocId) fetchTasksByDocument(selectedDocId);
  }, [selectedDocId, token]);

  const moveTaskToColumn = async (_id: string, column: string) => {
    const statusMap: { [key: string]: string } = {
      "To Do": "pending",
      "In Progress": "in-progress",
      Closed: "completed",
    };
    const status = statusMap[column];
    setTasks((prev) =>
      prev.map((t) =>
        t._id === _id
          ? {
              ...t,
              column: column as "To Do" | "In Progress" | "Closed",
              status: status as "pending" | "in-progress" | "completed",
            }
          : t
      )
    );
    setDropdownOpen1(null);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/calendar/updateTask`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: _id, status }),
        }
      );
      toast.success("Task status updated");
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const renderTasksForColumn = (column: string) =>
    tasks
      .filter((t) => t.column === column)
      .map((task) => (
        <div
          key={task._id}
          className="bg-[#E0E4EA] p-4 mb-4 shadow-sm rounded-lg relative cursor-pointer"
          onClick={() => {
            setSelectedTask(task);
            setShowTaskDetailModal(true);
          }}
        >
          <div
            className="absolute top-2 right-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen1((prev) => (prev === task._id ? null : task._id));
            }}
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM12 12c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2zM12 18c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2z" />
            </svg>
          </div>
          {dropdownOpen1 === task._id && (
            <div
              ref={dropdownRef} // ✅ attach ref here
              className="absolute top-10 right-2 bg-white border rounded-md shadow-lg z-10"
            >
              <ul className="py-2 text-sm text-gray-700">
                {["To Do", "In Progress", "Closed"].map((col) => (
                  <li
                    key={col}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveTaskToColumn(task._id, col);
                      setDropdownOpen1(null);
                    }}
                  >
                    {col}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h3 className="font-bold text-sm md:text-md">{task.headline}</h3>
          <p className="text-sm text-gray-600">
            Assigned to: {task.assignedTo?.[0]?.firstname || "Unknown"}
          </p>
          <p className="text-sm text-gray-600">
            Date added: {new Date(task.startDate).toLocaleDateString()}
          </p>
        </div>
      ));
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  const columnOrder = ["In Progress", "Closed"];

  const fetchTasks = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/get-my-task`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      const data = await res.json();
      console.log("data", data);
      if (res.ok) {
        const updated = data.tasks.map((task: any) => ({
          ...task,
          column:
            task.status === "pending"
              ? "To Do"
              : task.status === "in-progress"
              ? "In Progress"
              : "Closed",
          taskSummary: task.task,
          assignedTo: [{ firstname: name || "You" }],
          startDate: task.startDate || new Date().toISOString(),
          endDate: task.endDate || new Date().toISOString(),
        }));
        setTasks(updated);
      } else {
        toast.error(data.message || "Failed to load tasks");
      }
    } catch (err) {
      toast.error("Error loading tasks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTasks();
  }, [token]);

  const deleteTaskById = async (id: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/delete/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
  };

  const updateTaskById = async (id: string, payload: any) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/update/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
  };

  return (
    <div className="flex flex-col lg:flex-row">
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
              <h2 className="text-2xl font-bold">
                Hello, <span className="text-blue-900 capitalize">{name}</span>
              </h2>
              <UserDropdown />
            </header>

            <div className="flex items-center justify-between flex-wrap gap-4 mt-4 lg:mt-8 mb-4">
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-900">
                Facility
              </h3>

              <div className="flex items-center gap-3 flex-wrap">
                <div
                  className="px-4 py-2 rounded-md bg-white border hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-800 shadow"
                  onClick={() => {
                    setSelectedDocument(null);
                    setSelectedDocId("");
                    setDropdownOpen(false);
                    fetchTasks();
                  }}
                >
                  <button className="text-sm font-medium text-gray-800">
                    My Tasks
                  </button>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-md hover:bg-blue-800 focus:outline-none"
                  >
                    {selectedDocument
                      ? selectedDocument.originalName
                      : "Select Document"}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg z-50 border border-gray-200">
                      {documents.length > 0 ? (
                        <>
                          {documents.map((doc, index) => (
                            <div
                              key={doc._id || index}
                              className="flex items-center px-4 py-2 hover:bg-gray-200"
                            >
                              <input
                                type="checkbox"
                                className="mr-2"
                                checked={selectedDocs.includes(doc._id)}
                                onChange={() => handleCheckboxChange(doc._id)}
                              />
                              <button
                                onClick={() => handleSelectDocument(doc)}
                                className="w-full text-left text-gray-800 text-xs sm:text-sm"
                              >
                                {doc.originalName || "Untitled Document"}
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={handleDeleteSelected}
                            disabled={selectedDocs.length === 0}
                            className={`block w-full text-center px-4 py-2 mt-2 font-semibold ${
                              selectedDocs.length > 0
                                ? "bg-red-600 text-white"
                                : "bg-gray-400 text-gray-300"
                            } rounded-b-lg`}
                          >
                            Delete Selected
                          </button>
                        </>
                      ) : (
                        <p className="px-4 py-2 text-gray-500 text-xs sm:text-sm">
                          No documents found.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <DateDisplay />
              </div>
            </div>

            <div
              className="w-full border-t border-gray-300 mt-4"
              style={{ borderColor: "#E0E0E0" }}
            ></div>

            <div
              className="bg-white p-6 rounded-lg shadow-md mx-auto mt-8 sm:mt-10 w-full "
              style={{ borderRadius: "16px", border: "1px solid #E0E0E0" }}
            >
              {/* Header Information */}
              <div className="flex flex-wrap gap-2 mb-8 justify-between items-stretch">
                {/* <div className="bg-[#F6F6F6] p-6 rounded-[17px] flex flex-col justify-center w-full sm:w-[32%] h-auto sm:h-[120px] mb-4 sm:mb-0">
                  <p className="font-bold text-sm">
                    Date aedded:{" "}
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
                              {idx < selectedTask.assignedTo.length - 1
                                ? ", "
                                : ""}
                            </span>
                          ))
                        : "No participants"}
                    </span>
                  </p>
                </div> */}
                {/*             
                <div className="bg-[#F6F6F6] p-6 rounded-[17px] flex items-center justify-center w-full sm:w-[32%] h-auto sm:h-[120px] mb-4 sm:mb-0">
                  <p className="text-gray-800 text-left font-bold text-lg md:text-md">
                    {selectedTask
                      ? selectedTask.headline
                      : "Select a task to view details."}
                  </p>
                </div> */}
                {/* Task Summary Box */}
                <div className="bg-[#F6F6F6] p-4 rounded-[17px] flex flex-col justify-center w-full h-auto">
                  <p className="font-bold text-sm mb-1">
                    All tasks:{" "}
                    <span className="font-normal">{tasks.length}</span>
                  </p>
                  <p className="font-bold text-sm mb-1">
                    Done:{" "}
                    <span className="font-normal">
                      {tasks.filter((task) => task.column === "Closed").length}
                    </span>
                  </p>
                  <p className="font-bold text-sm">
                    In Progress:{" "}
                    <span className="font-normal">
                      {
                        tasks.filter((task) => task.column === "In Progress")
                          .length
                      }
                    </span>
                  </p>
                </div>
              </div>

              {/* Task Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {columnOrder.map((column) => (
                  <div
                    key={column}
                    className="bg-[#F6F6F6] p-6 rounded-[17px] shadow-md relative"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg">{column}</h3>

                      {column === "To Do" &&
                        !userLoading &&
                        ["Facility Admin", "Regional Admin"].includes(
                          userRole
                        ) && (
                          <button
                            onClick={() => setShowCreateTaskModal(true)}
                            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md hover:bg-green-600 transition"
                          >
                            <span className="text-white text-3xl font-bold leading-none mb-2">
                              +
                            </span>
                          </button>
                        )}
                    </div>

                    {renderTasksForColumn(column)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      {showTaskDetailModal && selectedTask && (
        <TaskDetailModal
          userLoading={loading}
          userRole={userRole}
          isOpen={showTaskDetailModal}
          task={selectedTask}
          onClose={() => {
            setShowTaskDetailModal(false);
            setSelectedTask(null);
          }}
          onEdit={() => {
            setShowTaskDetailModal(false);
            setShowCreateTaskModal(true);
          }}
          onDelete={async () => {
            try {
              await deleteTaskById(selectedTask._id);
              toast.success("Task deleted.");
              setShowTaskDetailModal(false);
              setSelectedTask(null);

              if (selectedDocId) {
                await fetchTasksByDocument(selectedDocId);
              } else {
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/get-my-task`,
                  {
                    headers: {
                      Authorization: `Bearer ${Cookies.get("token")}`,
                    },
                  }
                );
                const data = await res.json();
                if (res.ok) {
                  const updated = data.tasks.map((task: any) => ({
                    ...task,
                    column:
                      task.status === "pending"
                        ? "To Do"
                        : task.status === "in-progress"
                        ? "In Progress"
                        : "Closed",
                    taskSummary: task.task,
                    assignedTo: [{ firstname: name || "You" }],
                    startDate: task.startDate || new Date().toISOString(),
                    endDate: task.endDate || new Date().toISOString(),
                  }));
                  setTasks(updated);
                }
              }
            } catch (err) {
              toast.error("Failed to delete task");
            }
          }}
        />
      )}
     

      {/* {showCreateTaskModal && (
        <CreateTaskModal
          isOpen={showCreateTaskModal}
          onClose={() => setShowCreateTaskModal(false)}
          documentId={selectedDocId}
          documentName={selectedDocument?.originalName || ""}
          mode={selectedTask ? "edit" : "create"}
          initialData={selectedTask}
          onSuccess={async () => {
            setShowCreateTaskModal(false);
            setSelectedTask(null);
            if (selectedDocId) {
              await fetchTasksByDocument(selectedDocId);
            } else {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/get-my-task`,
                {
                  headers: {
                    Authorization: `Bearer ${Cookies.get("token")}`,
                  },
                }
              );
              const data = await res.json();
              if (res.ok) {
                const updated = data.tasks.map((task: any) => ({
                  ...task,
                  column:
                    task.status === "pending"
                      ? "To Do"
                      : task.status === "in-progress"
                      ? "In Progress"
                      : "Closed",
                  taskSummary: task.task,
                  assignedTo: [{ firstname: name || "You" }],
                  startDate: task.startDate || new Date().toISOString(),
                  endDate: task.endDate || new Date().toISOString(),
                }));
                setTasks(updated);
              }
            }
          }}
        />
      )} */}
    </div>
  );
}

export default authProtectedRoutes(TaskList);
