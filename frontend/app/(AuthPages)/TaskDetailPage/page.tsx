"use client"; // Ensures this file is treated as a client component

import { useRef, useState } from "react";
import Image from "next/image";
import { FaBell } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import { Editor, EditorState, RichUtils } from "draft-js";
import "draft-js/dist/Draft.css";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const editorRef = useRef<Editor | null>(null);

 
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Inline style toggler (e.g., Bold, Italic, Underline)
  const toggleInlineStyle = (style: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };


  // Focus Editor
  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar Component */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-8 w-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 w-full flex-wrap">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">
            Hello, <span className="text-blue-900">User</span>
          </h2>

          <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
            <FaBell className="text-gray-500 text-base sm:text-lg lg:text-xl" />
            <div className="flex items-center border border-gray-300 p-1 sm:p-2 rounded-md space-x-2">
              <Image
                src="/assets/image.png"
                width={28}
                height={28}
                className="rounded-full sm:w-10 sm:h-10 lg:w-12 lg:h-12"
                alt="User Profile"
              />
              <span className="text-gray-800 text-sm sm:text-base lg:text-lg">User</span>
            </div>
          </div>
        </header>

        {/* Task Detail Container */}
        <div
          className="bg-white p-6 rounded-lg shadow-md mx-auto mt-8 sm:mt-10 lg:ml-20"
          style={{
            maxWidth: "1481px",
            height: "auto",
            borderRadius: "16px",
            border: "1px solid #E0E0E0",
          }}
        >
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-6 ml-4 sm:ml-8">Task Detail</h3>
          <p className="text-gray-700 text-sm sm:text-base mb-4 ml-4 sm:ml-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="flex flex-col lg:flex-row lg:space-x-4">
    <div className="flex-1">
      <div className="relative border border-gray-300 rounded-lg p-3 sm:p-4 mx-4 sm:ml-8 mt-5">
        <label className="absolute top-1 left-2 text-xs sm:text-sm text-gray-500">Task Type</label>
        <p className="text-sm sm:text-base font-semibold text-gray-800 mt-4">Medical</p>
      </div>
    </div>
    <div className="flex-1">
      <div className="relative border border-gray-300 rounded-lg p-3 sm:p-4 mt-5 mx-4">
        <label className="absolute top-1 left-2 text-xs sm:text-sm text-gray-500">Task Type</label>
        <p className="text-sm sm:text-base font-semibold text-gray-800 mt-4">Medical</p>
      </div>
    </div>
  </div>
          <h4 className="mt-6 text-gray-800 text-sm sm:text-base ml-4 sm:ml-9">Upload File</h4>
          <div
            className="flex flex-col justify-center items-center mt-2 mx-4 sm:ml-8 p-4 sm:p-8"
            style={{
              maxWidth: "100%",
              height: "200px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
            }}
          >
            <Image src="/assets/vector.png" width={40} height={40} alt="Upload Icon" />
            <p className="mt-2 text-xs sm:text-sm">
              Drag and drop file here or <span className="text-[#002F6C] font-semibold">browse file</span>
            </p>
          </div>

          <div className="mt-6">
            <h4 className="text-gray-800 font-medium text-sm sm:text-base ml-4 sm:ml-8">Description</h4>
            <div
              className="border mt-2 mx-4 sm:ml-8 p-3 sm:p-4 cursor-text bg-white rounded-lg"
              style={{
                maxWidth: "680px",
                height: "auto",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
              }}
            >
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-2 p-2 border-b border-gray-300">
                {/* Inline Style Buttons */}
                <button onClick={() => toggleInlineStyle("BOLD")} className="font-bold text-xs sm:text-sm">
                  B
                </button>
                <button onClick={() => toggleInlineStyle("ITALIC")} className="italic text-xs sm:text-sm">
                  I
                </button>
                <button onClick={() => toggleInlineStyle("UNDERLINE")} className="underline text-xs sm:text-sm">
                  U
                </button>
                {/* Add More Buttons */}
              </div>

              <div onClick={focusEditor} className="h-full overflow-auto p-2 sm:p-4">
                <Editor editorState={editorState} onChange={setEditorState} ref={editorRef} placeholder="Type your description here..." />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
