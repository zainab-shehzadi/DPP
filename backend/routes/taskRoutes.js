const express = require("express");
const {
  assigntaskApi,
  getMyTasks,
  getTasksByDocument,
  getDocumentsWithTasks,
  createManualTask,
  getUsersByDepartment,
  updateTask,
  deleteTask
} = require("../controllers/taskController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/assign-task-api", protect , assigntaskApi);
router.post("/get-my-task" , protect , getMyTasks)
router.get("/get-by-document", protect, getTasksByDocument);
router.get("/documents-with-tasks", protect, getDocumentsWithTasks); // ✅ Add this
router.post("/create", protect, createManualTask);
router.post("/by-department", protect, getUsersByDepartment);
router.put("/update/:id", protect, updateTask);
router.delete("/delete/:id", protect, deleteTask);
 
module.exports = router;
 