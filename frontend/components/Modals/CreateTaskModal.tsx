import React, { useState } from "react";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    headline: string;
    description: string;
    dueDate: string;
    assignedTo: string;
    frequency: string;
    customSchedule: string;
  }) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [frequency, setFrequency] = useState("");
  const [customSchedule, setCustomSchedule] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      headline,
      description,
      dueDate,
      assignedTo,
      frequency,
      customSchedule,
    });
  };

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
          Create New Task
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Task Headline"
            className="p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task Description"
            rows={3}
            className="p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            name="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Department</option>
            <option value="Admin">Admin</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Operations">Operations</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Assign to</option>
            <option value="ABC">ABC</option>
            <option value="XYZ">XYZ</option>
          </select>

          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
