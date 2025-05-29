import React from "react";

interface EditModalProps {
  setIsModalOpen: (val: boolean) => void;
  editedText: string;
  setEditedText: (text: string) => void;
  handleSaveChanges: () => void;
}

const EditModal: React.FC<EditModalProps> = ({
  setIsModalOpen,
  editedText,
  setEditedText,
  handleSaveChanges,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={() => setIsModalOpen(false)}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-[1000px] h-[500px] max-h-screen flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Edit Plan of Correction</h2>

        <textarea
          className="w-full flex-grow border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500 resize-none"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
        ></textarea>

        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-5 py-2 bg-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            className="px-5 py-2 bg-[#002f6c] text-white rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
