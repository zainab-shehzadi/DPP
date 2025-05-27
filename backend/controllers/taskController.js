const TaskGroup = require("../models/taskModel"); // adjust path if needed
const axios = require("axios");
const User = require("../models/User");
const { default: mongoose } = require("mongoose");

// const assigntaskApi = async (req, res) => {
//   try {
//     const { solution, documentId, documentName } = req.body;

//     console.log("Received solution for document:", documentId, documentName);

//     if (!solution) {
//       return res.status(400).json({ message: "Please provide solution" });
//     }

//     let tasks = [];
//     let departments = [];

//     try {
//       const { data } = await axios.post(`${process.env.NGROK_URL}/get-tasks`, {
//         solution,
//       });

//       tasks = data.tasks || [];
//       departments = data.departments || [];
//     } catch (apiError) {
//       console.error("NGROK policy API call failed:", apiError);
//       return res.status(500).json({ error: "Failed to fetch solution." });
//     }

//     console.log("Departments data from API:", departments);

//     // Create role-to-department map
//     const deptRoleMap = {};

//     if (Array.isArray(departments)) {
//       departments.forEach((dep) => {
//         if (
//           dep &&
//           typeof dep === "object" &&
//           dep.department &&
//           Array.isArray(dep.roles)
//         ) {
//           const department = dep.department.trim();
//           dep.roles.forEach((role) => {
//             if (typeof role === "string") {
//               deptRoleMap[role.trim()] = department;
//             }
//           });
//         } else if (typeof dep === "string") {
//           const parts = dep.split(":");
//           if (parts.length >= 2) {
//             const department = parts[0].trim();
//             const roles = parts[1].split(",").map((r) => r.trim());
//             roles.forEach((role) => {
//               deptRoleMap[role] = department;
//             });
//           }
//         }
//       });
//     }

//     console.log("Mapped deptRoleMap:", deptRoleMap);

//     const taskList = await Promise.all(
//       tasks.map(async (item, index) => {
//         const taskLine = typeof item === "string" ? item : item.task;

//         if (typeof taskLine !== "string") {
//           console.warn("Skipping invalid task line:", item);
//           return null;
//         }

//         console.log(`[${index}] Processing task: ${taskLine}`);

//         // Handle en-dash separator – instead of parentheses
//         const dashParts = taskLine.split(/\s+–\s+/); // match en-dash
//         if (dashParts.length < 2) {
//           console.log(`[${index}] No departments found in task`);
//           return {
//             task: taskLine,
//             assignedTo: [],
//           };
//         }

//         const actionText = dashParts[0].trim();
//         const departmentsText = dashParts[1].trim();
//         const departmentAssignments = departmentsText
//           .split(";")
//           .map((s) => s.trim());

//         const taskRoles = [];

//         departmentAssignments.forEach((assignment) => {
//           const [deptName, roleNames] = assignment
//             .split(":")
//             .map((s) => s?.trim());
//           if (deptName && roleNames) {
//             roleNames
//               .split(",")
//               .map((r) => r.trim())
//               .forEach((role) => {
//                 taskRoles.push({
//                   department: deptName,
//                   role: role,
//                 });
//               });
//           }
//         });

//         console.log(
//           `[${index}] Parsed task roles: ${JSON.stringify(taskRoles)}`
//         );

//         const assignedUserIds = new Set();

//         await Promise.all(
//           taskRoles.map(async ({ department, role }) => {
//             const mappedDept = deptRoleMap[role] || department;
//             const standardizedDept = mappedDept
//               .toLowerCase()
//               .replace(/\s+/g, "_");

//             console.log(
//               `[${index}] Looking for users in department: ${department} (mapped: ${standardizedDept}), role: ${role}`
//             );

//             let users = await User.find({
//               DepartmentName: standardizedDept,
//             });

//             if (users.length === 0) {
//               const allUsers = await User.find({});
//               allUsers.forEach((user) => {
//                 const userDept = user.DepartmentName?.toLowerCase();
//                 if (userDept) {
//                   const deptWords = department.toLowerCase().split(/\s+/);
//                   const matchesKeywords = deptWords.some(
//                     (word) => word.length > 3 && userDept.includes(word)
//                   );
//                   if (matchesKeywords) {
//                     users.push(user);
//                   }
//                 }
//               });
//             }

//             const usersWithRole = await User.find({
//               $or: [
//                 {
//                   "rolePermissions.department": {
//                     $regex: new RegExp(department, "i"),
//                   },
//                 },
//                 { "rolePermissions.role": { $regex: new RegExp(role, "i") } },
//               ],
//             });

//             [...users, ...usersWithRole].forEach((user) => {
//               if (user && user._id) {
//                 assignedUserIds.add(user._id.toString());
//               }
//             });
//           })
//         );

//         const uniqueUserIds = [...assignedUserIds];
//         console.log(
//           `[${index}] Total unique users assigned: ${uniqueUserIds.length}`
//         );

//         return {
//           task: taskLine,
//           department: taskRoles.map((tr) => tr.department).join(", "),
//           role: taskRoles.map((tr) => tr.role).join(", "),
//           assignedTo: uniqueUserIds,
//           status: "pending",
//           startDate: new Date(),
//           endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
//         };
//       })
//     );

//     const filteredTaskList = taskList.filter((task) => task !== null);
//     const uniqueTasks = [];
//     const seenTasks = new Set();

//     filteredTaskList.forEach((task) => {
//       if (!seenTasks.has(task.task)) {
//         seenTasks.add(task.task);
//         uniqueTasks.push(task);
//       }
//     });

//     console.log(
//       `Filtered from ${filteredTaskList.length} to ${uniqueTasks.length} unique tasks`
//     );

//     console.log("Task assignments summary:");
//     uniqueTasks.forEach((task, idx) => {
//       const taskPreview =
//         task.task.length > 50 ? task.task.substring(0, 50) + "..." : task.task;
//       console.log(`[${idx}] Task: ${taskPreview}`);
//       console.log(`    Department: ${task.department}`);
//       console.log(`    Role: ${task.role}`);
//       console.log(`    Assigned to ${task.assignedTo.length} users`);
//     });

//     const taskGroup = new TaskGroup({
//       solutionText: Array.isArray(solution) ? solution.join("\n\n") : solution,
//       documentId: documentId || null,
//       documentName: documentName || null,
//       tasks: uniqueTasks,
//     });

//     await taskGroup.save();
//     console.log("TaskGroup saved with ID:", taskGroup._id);

//     return res.status(200).json({
//       message: "Tasks assigned successfully",
//       taskGroupId: taskGroup._id,
//       tasksCount: uniqueTasks.length,
//       unassignedTasks: uniqueTasks.filter(
//         (task) => !task.assignedTo || task.assignedTo.length === 0
//       ).length,
//     });
//   } catch (error) {
//     console.error("Error saving task group:", error);
//     return res.status(500).json({
//       message: "Failed to save tasks.",
//       error: error.message,
//     });
//   }
// };

// const getMyTasks = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const taskGroups = await TaskGroup.find({ "tasks.assignedTo": userId });

//     const uniqueTasks = new Map();

//     taskGroups.forEach((group) => {
//       group.tasks.forEach((task) => {
//         if (task.assignedTo.some((id) => id.equals(userId))) {
//           const taskKey = task.task;

//           if (
//             !uniqueTasks.has(taskKey) ||
//             uniqueTasks.get(taskKey).createdAt < task.createdAt
//           ) {
//             uniqueTasks.set(taskKey, {
//               _id: task._id,
//               task: task.task,
//               department: task.department,
//               role: task.role,
//               taskGroupId: group._id,
//               solutionText: group.solutionText,
//               status: task.status || "pending",
//               createdAt: task.createdAt,
//             });
//           }
//         }
//       });
//     });

//     const myTasks = Array.from(uniqueTasks.values());

//     return res.status(200).json({ tasks: myTasks });
//   } catch (error) {
//     console.error("Failed to fetch user tasks:", error);
//     return res.status(500).json({
//       message: "Something went wrong fetching your tasks.",
//       error: error.message,
//     });
//   }
// };
const getMyTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    // const taskGroups = await TaskGroup.find({ "tasks.assignedTo": userId });
    const taskGroups = await TaskGroup.find({ "tasks.assignedTo": userId })
      .populate("tasks.assignedTo", "firstname lastname email role")
      .exec();
    const myTasks = [];

    taskGroups.forEach((group) => {
      group.tasks.forEach((task) => {
        if (task.assignedTo.some((id) => id.equals(userId))) {
          myTasks.push({
            _id: task._id,
            headline: task.headline,
            description: task.description,
            task: task.task,
            department: task.department,
            role: task.role,

            frequency: task.frequency,
            customSchedule: task.customSchedule,
            startDate: task.startDate,
            endDate: task.endDate,
            status: task.status || "pending",
            createdAt: task.createdAt,
            taskGroupId: group._id,
            solutionText: group.solutionText,
            documentId: group.documentId,
            documentName: group.documentName,
            assignedTo: task.assignedTo.map((user) => ({
              _id: user._id,
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              role: user.role,
            })),
          });
        }
      });
    });
console.log("myTasks", myTasks);
    return res.status(200).json({ tasks: myTasks });
  } catch (error) {
    console.error("Failed to fetch user tasks:", error);
    return res.status(500).json({
      message: "Something went wrong fetching your tasks.",
      error: error.message,
    });
  }
};
const assigntaskApi = async (req, res) => {
  try {
    const { solution, documentId, documentName } = req.body;
    console.log("soulution", solution);

    if (!solution) {
      return res.status(400).json({ message: "Please provide solution" });
    }

    let tasks = [];
    let departments = [];

    try {
      const { data } = await axios.post(`${process.env.NGROK_URL}/get-tasks`, {
        solution,
      });
      console.log("data response", data);

      tasks = data.tasks || [];
      departments = data.departments || [];
    } catch (apiError) {
      console.error("NGROK policy API call failed:", apiError);
      return res.status(500).json({ error: "Failed to fetch solution." });
    }

    const deptRoleMap = {};

    if (Array.isArray(departments)) {
      departments.forEach((dep) => {
        if (
          dep &&
          typeof dep === "object" &&
          dep.department &&
          Array.isArray(dep.roles)
        ) {
          const department = dep.department.trim();
          dep.roles.forEach((role) => {
            if (typeof role === "string") {
              deptRoleMap[role.trim()] = department;
            }
          });
        } else if (typeof dep === "string") {
          const parts = dep.split(":");
          if (parts.length >= 2) {
            const department = parts[0].trim();
            const roles = parts[1].split(",").map((r) => r.trim());
            roles.forEach((role) => {
              deptRoleMap[role] = department;
            });
          }
        }
      });
    }

    const taskList = await Promise.all(
      tasks.map(async (item, index) => {
        const taskLine = typeof item === "string" ? item : item.task;
        const headlineItem = item?.title;
        const departmentItem = item?.department;

        console.log("headlines 64", headlineItem);

        if (typeof taskLine !== "string") {
          console.warn("Skipping invalid task line:", item);
          return null;
        }

        const dashParts = taskLine.split(/\s+–\s+/);
        if (dashParts.length < 2) {
          console.log(`[${index}] No departments found in task`);
          return {
            task: taskLine,
            assignedTo: [],
            headline: headlineItem, // fallback headline
            department: departmentItem,
            frequency: "daily", // default
          };
        }

        const departmentsText = dashParts[1].trim();
        const departmentAssignments = departmentsText
          .split(";")
          .map((s) => s.trim());

        const taskRoles = [];

        departmentAssignments.forEach((assignment) => {
          const [deptName, roleNames] = assignment
            .split(":")
            .map((s) => s?.trim());
          if (deptName && roleNames) {
            roleNames
              .split(",")
              .map((r) => r.trim())
              .forEach((role) => {
                taskRoles.push({
                  department: deptName,
                  role: role,
                });
              });
          }
        });

        const assignedUserIds = new Set();

        await Promise.all(
          taskRoles.map(async ({ department, role }) => {
            const mappedDept = deptRoleMap[role] || department;
            const standardizedDept = mappedDept
              .toLowerCase()
              .replace(/\s+/g, "_");

            let users = await User.find({
              DepartmentName: standardizedDept,
            });

            if (users.length === 0) {
              const allUsers = await User.find({});
              allUsers.forEach((user) => {
                const userDept = user.DepartmentName?.toLowerCase();
                if (userDept) {
                  const deptWords = department.toLowerCase().split(/\s+/);
                  const matchesKeywords = deptWords.some(
                    (word) => word.length > 3 && userDept.includes(word)
                  );
                  if (matchesKeywords) {
                    users.push(user);
                  }
                }
              });
            }

            const usersWithRole = await User.find({
              $or: [
                {
                  "rolePermissions.department": {
                    $regex: new RegExp(department, "i"),
                  },
                },
                { "rolePermissions.role": { $regex: new RegExp(role, "i") } },
              ],
            });

            [...users, ...usersWithRole].forEach((user) => {
              if (user && user._id) {
                assignedUserIds.add(user._id.toString());
              }
            });
          })
        );

        const uniqueUserIds = [...assignedUserIds];
        return {
          task: taskLine,
          headline: headlineItem, 
          description: "", 
          frequency: "daily", 
          customSchedule: "", 
          department: departmentItem,
          role: taskRoles.map((tr) => tr.role).join(", "),
          assignedTo: uniqueUserIds,
          status: "pending",
          startDate: new Date(),
          endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        };
      })
    );

    const filteredTaskList = taskList.filter((task) => task !== null);
    const uniqueTasks = [];
    const seenTasks = new Set();

    filteredTaskList.forEach((task) => {
      if (!seenTasks.has(task.task)) {
        seenTasks.add(task.task);
        uniqueTasks.push(task);
      }
    });

    uniqueTasks.forEach((task, idx) => {
      const taskPreview =
        task.task.length > 50 ? task.task.substring(0, 50) + "..." : task.task;
    });

    console.log("uniquetasks 190", uniqueTasks);

    const taskGroup = new TaskGroup({
      solutionText: Array.isArray(solution) ? solution.join("\n\n") : solution,
      documentId: documentId || null,
      documentName: documentName || null,
      tasks: uniqueTasks,
    });

    await taskGroup.save();
    console.log("TaskGroup saved with ID:", taskGroup._id);

    return res.status(200).json({
      message: "Tasks assigned successfully",
      taskGroupId: taskGroup._id,
      tasksCount: uniqueTasks.length,
      unassignedTasks: uniqueTasks.filter(
        (task) => !task.assignedTo || task.assignedTo.length === 0
      ).length,
    });
  } catch (error) {
    console.error("Error saving task group:", error);
    return res.status(500).json({
      message: "Failed to save tasks.",
      error: error.message,
    });
  }
};
// backend/controllers/taskController.js
// const getTasksByDocument = async (req, res) => {
//   try {
//     const { documentId } = req.query;

//     if (!documentId) {
//       return res.status(400).json({ message: "Document ID is required" });
//     }

//     const tasks = await TaskGroup.aggregate([
//       { $match: { documentId: new mongoose.Types.ObjectId(documentId) } },
//       { $unwind: "$tasks" },
//       {
//         $project: {
//           _id: "$tasks._id",
//           task: "$tasks.task",
//           status: "$tasks.status",
//           assignedTo: "$tasks.assignedTo",
//           startDate: "$tasks.startDate",
//           endDate: "$tasks.endDate",
//         },
//       },
//     ]);

//     res.status(200).json({ tasks });
//   } catch (error) {
//     console.error("Error fetching tasks by document:", error);
//     res
//       .status(500)
//       .json({ message: "Failed to fetch tasks", error: error.message });
//   }
// };

const getTasksByDocument = async (req, res) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    const tasks = await TaskGroup.aggregate([
      { $match: { documentId: new mongoose.Types.ObjectId(documentId) } },
      { $unwind: "$tasks" },
      {
        $project: {
          _id: "$tasks._id",
          headline: "$tasks.headline",
          description: "$tasks.description",
          frequency: "$tasks.frequency",
          customSchedule: "$tasks.customSchedule",
          task: "$tasks.task",
          department: "$tasks.department",
          role: "$tasks.role",
          assignedTo: "$tasks.assignedTo",
          status: "$tasks.status",
          startDate: "$tasks.startDate",
          endDate: "$tasks.endDate",
          createdAt: "$tasks.createdAt",
        },
      },
    ]);
    console.log("tasks 288", tasks);
    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks by document:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch tasks", error: error.message });
  }
};

const getDocumentsWithTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    const documents = await TaskGroup.aggregate([
      {
        $match: {
          "tasks.assignedTo": new mongoose.Types.ObjectId(userId),
          documentId: { $ne: null },
        },
      },
      { $unwind: "$tasks" },
      {
        $match: {
          "tasks.assignedTo": new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$documentId",
          documentName: { $first: "$documentName" },
        },
      },
      {
        $project: {
          id: "$_id",
          name: "$documentName",
          _id: 0,
        },
      },
    ]);

    console.log("documents 205", documents);
    res.status(200).json({ documents });
  } catch (error) {
    console.error("Failed to fetch documents with tasks:", error);
    return res.status(500).json({
      message: "Something went wrong fetching documents.",
      error: error.message,
    });
  }
};

const createManualTask = async (req, res) => {
  try {
    const {
      headline,
      description,
      department,
      dueDate,
      assignedTo,
      frequency,
      customSchedule,
      documentId,
      documentName,
    } = req.body;

    if (!headline || !description || !department || !dueDate || !assignedTo) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({ message: "Assigned user not found" });
    }

    const task = {
      headline,
      description,
      task: description, // optional for summary view
      department,
      role: assignedUser.role || "Staff",
      assignedTo: [assignedUser._id],
      startDate: new Date(),
      endDate: new Date(dueDate),
      frequency,
      customSchedule,
      status: "pending",
    };

    const newTaskGroup = new TaskGroup({
      solutionText: description,
      documentId: documentId || null,
      documentName: documentName || null,
      tasks: [task],
    });

    await newTaskGroup.save();
    console.log("task 260", task);
    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    console.error("Manual task creation error:", error);
    res.status(500).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
};

const getUsersByDepartment = async (req, res) => {
  try {
    const { department } = req.body;
    if (!department) {
      return res.status(400).json({ message: "Department is required" });
    }

    const users = await User.find({ DepartmentName: department }).select(
      "_id firstname lastname email Position role"
    );

    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users by department:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      headline,
      description,
      startDate,
      endDate,
      frequency,
      customSchedule,
      department,
      assignedTo,
    } = req.body;

    const taskGroup = await TaskGroup.findOne({ "tasks._id": id });

    if (!taskGroup) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = taskGroup.tasks.id(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found in group" });
    }

    // Update task fields
    task.headline = headline;
    task.description = description;
    task.task = description;
    task.startDate = startDate;
    task.endDate = endDate;
    task.frequency = frequency;
    task.customSchedule = customSchedule;
    task.department = department;
    task.assignedTo = [assignedTo];

    await taskGroup.save();

    return res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const taskGroup = await TaskGroup.findOneAndUpdate(
      { "tasks._id": id },
      { $pull: { tasks: { _id: id } } },
      { new: true }
    );

    if (!taskGroup) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  assigntaskApi,
  getMyTasks,
  getTasksByDocument,
  getDocumentsWithTasks,
  createManualTask,
  getUsersByDepartment,
  updateTask,
  deleteTask,
};
