import { useState, useEffect } from "react";

const DateDisplay: React.FC = () => {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    setCurrentDate(formattedDate);
  }, []);

  return (
    <div className="flex justify-end ">
      <div className="border-2 border-blue-900 px-5 py-3 rounded-lg shadow-md text-sm bg-white">
        <span className="text-black">{currentDate}</span>
      </div>
    </div>
  );
};

export default DateDisplay;
