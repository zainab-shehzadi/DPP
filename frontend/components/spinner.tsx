
  import { useState, useEffect } from "react";

const Spinner = ({ delay = 1000 }) => { // Default delay of 1 second
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(true);
    }, delay);

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [delay]);

  if (!showSpinner) return null; // Do not render if spinner should be hidden

  return (
    <div className="flex items-center justify-center w-full h-screen ma-10">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
  );
};

export default Spinner;
