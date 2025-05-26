// 📁 components/Modals/TaskDetailModal.tsx
import React, { useState } from "react";

interface TaskDetailModalProps {
  userLoading: boolean;
  userRole: string;
  isOpen: boolean;
  task: any;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  userLoading,
  userRole,
  isOpen,
  task,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !task) return null;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const formatDate = (d: string) => new Date(d).toLocaleDateString();

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b pb-4 mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-1">
              {task.headline}
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Status: <span className="capitalize">{task.status}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {!userLoading &&
              ["Facility Admin", "Regional Admin"].includes(userRole || "") && (
                <>
                  <button
                    onClick={onEdit}
                    className="text-sm font-medium text-blue-700 border border-blue-600 hover:bg-blue-50 transition px-4 py-1.5 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-sm font-medium text-red-600 border border-red-500 hover:bg-red-50 transition px-4 py-1.5 rounded-md"
                  >
                    Delete
                  </button>
                </>
              )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-xl ml-2"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
          <p>
            <strong>Start Date:</strong> {formatDate(task.startDate)}
          </p>
          <p>
            <strong>End Date:</strong> {formatDate(task.endDate)}
          </p>
          <p>
            <strong>Assigned To:</strong>{" "}
            {task.assignedTo?.map((u: any) => u.firstname).join(", ") || "N/A"}
          </p>
          {/* <p>
            <strong>Task ID:</strong> {task._id}
          </p> */}
          <p>
            <strong>Frequency:</strong> {task.frequency || "AI Generated Task"}
          </p>
          <p>
          <strong>Created Date:</strong> {formatDate(task.createdAt)}
          </p>

          {task.frequency === "custom" && task.customSchedule?.length > 0 && (
            <p className="col-span-1 sm:col-span-2">
              <strong>Custom Schedule:</strong> {task.customSchedule}
            </p>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2">Description</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap border rounded p-3 bg-gray-50">
            {task?.task }
          </p>
        </div>
      </div>
    
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex justify-center items-center px-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Delete
            </h2>
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to delete this task?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete?.();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default TaskDetailModal;
