import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

// Define Task type if not imported from elsewhere


interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
  documentName?: string;
  mode?: "create" | "edit";
  initialData?: any;
  onSuccess: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentName,
  mode = "create",
  initialData,
  onSuccess,
}) => {
  console.log("inital Data 24", initialData);
  const isEditMode = mode === "edit";
  const [hasWarned, setHasWarned] = useState(false);
  const hasWarnedRef = React.useRef(false);
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [initialAssignedTo, setInitialAssignedTo] = useState(""); // Track initial assigned user
  const [headline, setHeadline] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [frequency, setFrequency] = useState("");
  const [customSchedule, setCustomSchedule] = useState("");
  interface User {
    _id: string;
    firstname: string;
    lastname?: string;
  }
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const predefinedDepartments = [
    { value: "business_office", label: "Business Office" },
    { value: "admissions", label: "Admissions" },
    { value: "activities", label: "Activities" },
    { value: "maintenance", label: "Maintenance" },
    { value: "dietary", label: "Dietary" },
    { value: "therapy", label: "Therapy" },
    { value: "laundry", label: "Laundry" },
    { value: "housekeeping", label: "Housekeeping" },
    { value: "case_management", label: "Case Management" },
    { value: "mds", label: "MDS" },
    { value: "nursing_department", label: "Nursing Department" },
    { value: "administration", label: "Administration" },
    { value: "social_services", label: "Social Services" },
    { value: "staff_development", label: "Staff Development" },
  ];

  useEffect(() => {
    if (isEditMode && initialData) {
      setHeadline(initialData?.headline || "");
      setDescription(initialData?.task || "");
      setDepartment(initialData?.department || "");
      setDueDate(initialData?.endDate?.substring(0, 10) || "");
      setAssignedTo(initialData?.assignedTo?.[0]?._id || "");
      setFrequency(initialData?.frequency || "");
      setCustomSchedule(initialData?.customSchedule || "");
      const assignedUserId = initialData?.assignedTo?.[0]?._id || "";
      console.log("71 user data", assignedUserId);
      setAssignedTo(assignedUserId);
      setInitialAssignedTo(assignedUserId);
    }
  }, [isEditMode, initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("token");

    if (!token) {
      toast.error("Missing token");
      return;
    }

    const body = {
      headline,
      description,
      department,
      dueDate,
      assignedTo,
      frequency,
      customSchedule,
      documentId,
      documentName,
    };

    const url = isEditMode
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/update/${initialData?._id}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/create`;
    const method = isEditMode ? "PUT" : "POST";

    try {
      setLoading(true);
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          `Task ${isEditMode ? "updated" : "created"} successfully`
        );
        onClose();
        onSuccess?.();
      } else {
        toast.error(
          data.message || ` Failed to ${isEditMode ? "update" : "create"} task`
        );
      }
    } catch (err) {
      console.error("Task submit error:", err);
      toast.error(" Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const fetchTasksAndPopulate = async () => {
    if (!initialData?._id) return;

    try {
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
        const matched = data.tasks.find((t: any) => t._id === initialData._id);
        if (matched) {
          // ✅ Update all initial fields using latest data
          setHeadline(matched.headline || "");
          setDescription(matched.task || "");
          setDepartment(matched.department || "");
          setDueDate(matched.endDate?.substring(0, 10) || "");
          setAssignedTo(matched.assignedTo?.[0]?._id || "");
          setFrequency(matched.frequency || "");
          setCustomSchedule(matched.customSchedule || "");
        }
      }
    } catch (err: any) {

    }
  };

  useEffect(() => {
    if (isOpen && isEditMode) {
      fetchTasksAndPopulate();
    }
  }, [isOpen, isEditMode]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen || (!department && !isEditMode)) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/by-department`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
            body: JSON.stringify({
              department: department || initialData?.department,
            }),
          }
        );

        const data = await res.json();

        if (res.ok) {
          const fetchedUsers = data.users || [];
          setUsers(fetchedUsers);

          if (fetchedUsers.length === 0) {
            if (!hasWarned) {
              // toast.warning("This department does not have any users.");
              hasWarnedRef.current = true;
            }
            setAssignedTo("");
          } else {
            // Only set assignedTo if we have an initial value and the user exists in the fetched users
            if (isEditMode) {
              console.log("runnig 168");
              const userExists = data.users.some(
                (user) => user._id === initialAssignedTo
              );
              console.log("userExists", userExists);
              if (userExists) {
                setAssignedTo(initialAssignedTo);
              } else {
                setAssignedTo("");
              }
            }
          }
        } else {
          toast.error(data.message || "Failed to fetch users.");
        }
      } catch (error) {
        toast.error("Error fetching users");
      }
    };

    fetchUsers();
  }, [isOpen, department, isEditMode, initialAssignedTo]);

  useEffect(() => {
    if (isOpen) {
      hasWarnedRef.current = false;
    }
  }, [isOpen, department]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl text-center font-semibold mb-6 text-gray-800">
          {isEditMode ? "Edit Task" : "Create New Task"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
          <div>
            <label
              htmlFor="headline"
              className="block text-sm font-medium text-gray-700 "
            >
              Task Headline
            </label>
            <input
              id="headline"
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Task Headline"
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="headline"
              className="block text-sm font-medium text-gray-700 "
            >
              Task Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task Description"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="headline"
              className="block text-sm font-medium text-gray-700 "
            >
              Department
            </label>
            <select
              name="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Department</option>

              {/* If editing and current department is not in the list, still show it */}
              {isEditMode &&
                department &&
                !predefinedDepartments.some((dep) => dep.value === department) && (
                  <option value={department}>{department}</option>
                )}

              {predefinedDepartments.map((dep) => (
                <option key={dep.value} value={dep.value}>
                  {dep.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="headline"
              className="block text-sm font-medium text-gray-700"
            >
              Deadline
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="headline"
              className="block text-sm font-medium text-gray-700 mb-1 "
            >
              Assigned User
            </label>
            

            {users.length > 0 ? (
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg text-sm"
                required
              >
                <option value="">Assign to</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.firstname} {user.lastname || ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value="This department does not have any users"
                className="w-full p-3 border border-red-300 bg-red-50 text-sm text-red-700 rounded-lg"
                disabled
              />
            )}
          </div>

          <div>
            <label
              htmlFor="headline"
              className="block text-sm font-medium text-gray-700 "
            >
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Frequency</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Biweekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="custom">Custom</option>
            </select>

            {frequency === "custom" && (
              <input
                type="text"
                value={customSchedule}
                onChange={(e) => setCustomSchedule(e.target.value)}
                placeholder='e.g. "Every Tuesday for 6 weeks"'
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className=" px-5 py-2 bg-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium ${
                loading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
            >
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Task"
                : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
