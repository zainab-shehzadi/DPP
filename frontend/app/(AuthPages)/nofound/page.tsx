"use client"; // Ensures this component is client-side only

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';  // Correct import for the App Router

const SuccessPage = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; 
  }
  const handleRedirect = () => {
    router.push('/Dashboard');
  };

  return (
<div className="flex justify-center items-center min-h-screen bg-gray-100">
  <div className="bg-white p-8 w-80 text-center">
    <h1 className="text-2xl font-semibold mb-4 text-red-600">404 - Page Not Found</h1>
    <p className="text-lg mb-6 text-gray-700">
      Sorry, the page you are looking for does not exist.
    </p>
    <button
      onClick={handleRedirect}
      className="w-full py-2 px-4 text-lg bg-blue-900 text-white rounded-md hover:bg-blue-800"
    >
      Go to Home
    </button>
  </div>
</div>

  );
};

export default SuccessPage;
