// pages/RegionalFacilities.tsx
"use client";

import React, { use, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import Sidebar from "@/components/Sidebar";
import HeaderWithToggle from "@/components/HeaderWithToggle";
import DateDisplay from "@/components/date";
import { set } from "mongoose";

interface Facility {
  _id: string;
  adminName: string;
  state: string;
  email: string;
  bedCount: number;
  facilityName: string;
  facilityAddress: string;
  noOfBeds: number;
  address: string;
  createdBy: string;
  assignedTo?: string;
  department?: string;
  facilityCode?: string; // Added 3-letter facility code
}

interface User {
  _id: string;
  firstname: string;
  lastname?: string;
  email: string;
  role: string;
}

const RegionalFacilities = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [bedCount, setBedCount] = useState<number | "">("");
  const [department, setDepartment] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [facilityCode, setFacilityCode] = useState(""); // Added facility code state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(
    null
  );
  const [userRole, setUserRole] = useState<string>(""); // Added user role state
  const [selectedFacilityCode, setSelectedFacilityCode] = useState<string>(""); // For filtering facilities

 

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me`,
          {
              method: "POST",
              headers: {
                Authorization: `Bearer ${Cookies.get("token")}`,
              },
              body: JSON.stringify({}),
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
      }
    };

    getUserRole();
  }, []);

  const fetchFacilities = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/facilities1`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify({}),
        }
      );
      const data = await res.json();
      console.log("facilities", data);
      if (res.ok) {
        setFacilities(data?.facility || []);
      } else {
        toast.error(data.message || "Failed to load facilities");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!department) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/by-department`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
            body: JSON.stringify({ department }),
          }
        );

        const data = await res.json();
        if (res.ok) {
          setUsers(
            (data.users || []).filter((user) => user.role === "Facility Admin")
          );
          console.log("users", users);
        } else {
          toast.error(data.message || "Failed to fetch users");
        }
      } catch (error) {
        toast.error("Error fetching users");
      }
    };

    fetchUsers();
  }, [department]);

  useEffect(() => {
    console.log("users", users);
  });

  const usStates = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  // Get unique facility codes for filtering
  const facilityCodesOptions = [
    ...new Set(facilities.map((f) => f.facilityCode).filter(Boolean)),
  ];

  // Filter facilities based on selected facility code (for Regional Admins)
  const filteredFacilities =
    userRole === "Regional Admin" && selectedFacilityCode
      ? facilities.filter((f) => f.facilityCode === selectedFacilityCode)
      : facilities;

  const handleSubmit = async () => {
    if (
      !name ||
      !address ||
      !bedCount ||
      !assignedTo ||
      !department ||
      !state ||
      !facilityCode
    )
      return toast.error("All fields are required");

    // Validate facility code is exactly 3 letters
    if (facilityCode.length !== 3 || !/^[A-Za-z]{3}$/.test(facilityCode)) {
      return toast.error("Facility code must be exactly 3 letters");
    }

    try {
      setLoading(true);
      const url = editId
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/facilities/${editId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/create-facility`;
      const method = editId ? "PUT" : "POST";

      const selectedUser = users.find((u) => u._id === assignedTo);

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          email: selectedUser?.email,
          facilityName: name,
          facilityAddress: address,
          noOfBeds: bedCount,
          state: state,
          facilityCode: facilityCode.toUpperCase(), // Store as uppercase
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editId ? "Facility updated" : "Facility created");
        fetchFacilities();
        setShowModal(false);
        setName("");
        setAddress("");
        setBedCount("");
        setAssignedTo("");
        setDepartment("");
        setFacilityCode("");
        setEditId(null);
      } else {
        toast.error(data.message || "Failed to process request");
      }
    } catch (error) {
      toast.error("Error during request");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (facilityId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/facilities/${facilityId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Facility deleted");
        fetchFacilities();
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (error) {
      toast.error("Error deleting facility");
    }
  };

  const canAddFacility = userRole === "Super Admin";
  const canEditFacility = userRole === "Super Admin";
  const canDeleteFacility = userRole === "Super Admin";

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <HeaderWithToggle onToggleSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {loading ? (
        <div className="flex items-center justify-center w-full h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="lg:ml-64 p-4 sm:p-8 w-full ">
            <header className="flex items-center justify-between mb-6 w-full flex-wrap">
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">
                Hello,{" "}
                <span className="text-blue-900">{userRole || "Admin"}</span>
              </h2>
            </header>

            <div className="flex justify-between items-center mb-4">
              {/* Facility Code Filter for Regional Admins */}
              {userRole === "Regional Admin" &&
                facilityCodesOptions.length > 0 && (
                  <select
                    value={selectedFacilityCode}
                    onChange={(e) => setSelectedFacilityCode(e.target.value)}
                    className="border p-2 rounded"
                  >
                    <option value="">All Facilities</option>
                    {facilityCodesOptions.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                )}

              {/* Add Facility Button - Only for Super Admin */}
              {canAddFacility && (
                <button
                  onClick={() => {
                    setEditId(null);
                    setName("");
                    setAddress("");
                    setState("");
                    setBedCount("");
                    setAssignedTo("");
                    setState("");
                    setDepartment("");
                    setFacilityCode("");
                    setShowModal(true);
                  }}
                  className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800"
                >
                  Add Facility
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4 mt-4 lg:mt-8 justify-between">
              <h3 className="text-lg lg:text-2xl font-bold text-blue-900">
                Facilities
              </h3>
              <DateDisplay />
            </div>

            <div className="mt-6">
              {filteredFacilities?.length === 0 ? (
                <p className="text-gray-500 text-sm w-full text-center">
                  No facilities found.
                </p>
              ) : (
                <ul className="divide-y border rounded-md bg-white">
                  {filteredFacilities?.map((fac) => (
                    <li
                      key={fac._id}
                      className="p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-blue-900">
                          Facility Name: {fac?.facilityName}
                          {fac.facilityCode && (
                            <span className="ml-2 text-sm bg-blue-900 text-white px-2 py-1 rounded">
                              {fac.facilityCode}
                            </span>
                          )}
                        </p>
                        <p>{fac?.email}</p>
                        <p className="text-sm text-gray-600">
                          Facility Address: {fac?.facilityAddress}
                        </p>
                        <p className="text-sm text-gray-600">
                          Beds: {fac?.noOfBeds}
                        </p>
                        <p className="text-sm text-gray-600">
                          Admin: {fac?.adminName}
                        </p>

                        <p className="text-sm text-gray-600">
                          Facility Code: {fac?.facilityCode}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {canEditFacility && (
                          <button
                            onClick={async () => {
                              setEditId(fac._id);
                              setName(fac.facilityName);
                              setAddress(fac.facilityAddress);
                              setBedCount(fac.noOfBeds);
                              setState(fac.state);
                              setDepartment(fac.department || "");
                              setFacilityCode(fac.facilityCode || "");

                              try {
                                const res = await fetch(
                                  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/by-department`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${Cookies.get(
                                        "token"
                                      )}`,
                                    },
                                    body: JSON.stringify({
                                      department: fac.department,
                                    }),
                                  }
                                );
                                const data = await res.json();
                                if (res.ok) {
                                  setUsers(
                                    data.users.filter(
                                      (user) => user.role === "Facility Admin"
                                    )
                                  );

                                  const matchingUser = data.users.find(
                                    (u) =>
                                      `${u.firstname} ${
                                        u.lastname || ""
                                      }`.trim() === fac.adminName
                                  );
                                  setAssignedTo(matchingUser?._id || "");
                                } else {
                                  toast.error(
                                    data.message || "Failed to fetch users"
                                  );
                                  setUsers([]);
                                  setAssignedTo("");
                                }
                              } catch (error) {
                                toast.error("Error fetching users");
                                setUsers([]);
                                setAssignedTo("");
                              }

                              setShowModal(true);
                            }}
                            className="text-sm px-6 py-3 bg-blue-900 text-white rounded"
                          >
                            Edit
                          </button>
                        )}

                        {canDeleteFacility && (
                          <button
                            onClick={() => {
                              setSelectedFacilityId(fac._id);
                              setShowDeleteModal(true);
                            }}
                            className="text-sm px-3 py-1 bg-red-600 text-white rounded"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                  <h3 className="text-xl font-bold mb-4 text-red-700">
                    Delete Facility
                  </h3>
                  <p className="text-gray-700 mb-6">
                    Are you sure you want to delete this facility? This action
                    cannot be undone.
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="px-4 py-2 border border-gray-400 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!selectedFacilityId) return;

                        const facility = facilities.find(
                          (f) => f._id === selectedFacilityId
                        );
                        const facilityAdmin = users.find(
                          (u) => u.email === facility?.email
                        );

                        await handleDelete(selectedFacilityId);
                        setShowDeleteModal(false);
                        setSelectedFacilityId(null);
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add/Edit Modal - Only for Super Admin */}
            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4 text-blue-900">
                    {editId ? "Edit Facility" : "Add Facility"}
                  </h3>

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Facility Name"
                    className="w-full border p-2 rounded mb-2"
                  />

                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Facility Address"
                    className="w-full border p-2 rounded mb-2"
                  />

                  <select
                    name="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                  >
                    <option value="">Select a State</option>
                    {usStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>

                  <input
                    value={facilityCode}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^A-Za-z]/g, "")
                        .slice(0, 3);
                      setFacilityCode(value.toUpperCase());
                    }}
                    placeholder="Facility Code (3 letters, e.g., BAY)"
                    maxLength={3}
                    className="w-full border p-2 rounded mb-2"
                  />

                  <select
                    name="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                  >
                    <option value="">Select Department</option>
                    <option value="business_office">Business Office</option>
                    <option value="admissions">Admissions</option>
                    <option value="activities">Activities</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="dietary">Dietary</option>
                    <option value="therapy">Therapy</option>
                    <option value="laundry">Laundry</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="case_management">Case Management</option>
                    <option value="mds">MDS</option>
                    <option value="nursing_department">
                      Nursing Department
                    </option>
                    <option value="administration">Administration</option>
                    <option value="social_services">Social Services</option>
                    <option value="staff_development">Staff Development</option>
                  </select>

                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                  >
                    <option value="">Assign To</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {`${user.firstname} ${user.lastname || ""}`.trim()}
                      </option>
                    ))}
                  </select>

                  <input
                    value={bedCount}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value > 0) {
                        setBedCount(value);
                      } else {
                        setBedCount("");
                      }
                    }}
                    placeholder="No. of Beds"
                    type="number"
                    min={1}
                    className="w-full border p-2 rounded mb-4"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-400 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 disabled:opacity-50"
                    >
                      {loading ? "Saving..." : editId ? "Update" : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RegionalFacilities;
