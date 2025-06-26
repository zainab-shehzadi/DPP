import React, { useState, useEffect } from "react";

interface EditModalProps {
  setIsModalOpen: (val: boolean) => void;
  editedText: string;
  setEditedText: (text: string) => void;
  handleSaveChanges: () => void;
}

type QAPair = {
  question: string;
  answer: string;
  key: string; // e.g. question_1 / answer_1 for tracking
};

const parseEditedText = (text: string): QAPair[] => {
  const lines = text.split("\n").map((line) => line.trim());
  const pairs: QAPair[] = [];
  let currentQuestion = "";
  let currentAnswer = "";
  let currentKey = "";

  for (let line of lines) {
    if (line.startsWith("question_")) {
      if (currentQuestion || currentAnswer) {
        // push previous pair before starting new
        pairs.push({ question: currentQuestion, answer: currentAnswer, key: currentKey });
        currentAnswer = "";
      }
      currentKey = line.split(":")[0]; // e.g. question_1
      currentQuestion = line.substring(line.indexOf(":") + 1).trim();
    } else if (line.startsWith("answer_")) {
      currentAnswer = line.substring(line.indexOf(":") + 1).trim();
    } else if (line) {
      // multiline answer - append with newline
      currentAnswer += "\n" + line;
    }
  }
  // push last pair
  if (currentQuestion || currentAnswer) {
    pairs.push({ question: currentQuestion, answer: currentAnswer, key: currentKey });
  }
  return pairs;
};

const reconstructEditedText = (pairs: QAPair[]): string => {
  return pairs
    .map(
      (pair, i) =>
        `question_${i + 1}: ${pair.question}\nanswer_${i + 1}: ${pair.answer.trim()}`
    )
    .join("\n");
};

const EditModal: React.FC<EditModalProps> = ({
  setIsModalOpen,
  editedText,
  setEditedText,
  handleSaveChanges,
}) => {
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);

  useEffect(() => {
    setQaPairs(parseEditedText(editedText));
  }, [editedText]);

  const handleAnswerChange = (index: number, newAnswer: string) => {
    const updatedPairs = [...qaPairs];
    updatedPairs[index] = { ...updatedPairs[index], answer: newAnswer };
    setQaPairs(updatedPairs);
    setEditedText(reconstructEditedText(updatedPairs));
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={() => setIsModalOpen(false)}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-[1000px] max-h-[90vh] overflow-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Edit Plan of Correction</h2>

        <div className="space-y-6 flex-grow overflow-auto pr-2">
          {qaPairs.map((pair, i) => (
            <div key={i} className="flex flex-col">
              <b className="mb-2">{pair.question}</b>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500 resize-y"
                rows={5}
                value={pair.answer}
                onChange={(e) => handleAnswerChange(i, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-5 py-2 bg-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleSaveChanges();
              setIsModalOpen(false);
            }}
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
