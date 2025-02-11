"use client"; // Ensures this component is client-side only

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';  // Correct import for the App Router

const SuccessPage = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure the component only uses the router after it has mounted on the client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Prevent rendering until the component is mounted on the client-side
  }

  const handleRedirect = () => {
    // Redirecting to the Dashboard or a different page after successful payment
    router.push('/Dashboard');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-80 text-center">
        <h1 className="text-2xl font-semibold mb-4">Payment Successful</h1>
        <p className="text-lg mb-6">
          Thank you for your payment! Your transaction has been completed successfully.
        </p>
        <button
          onClick={handleRedirect}
          className="w-full py-2 px-4 text-lg bg-[#002F6C] text-white rounded-md hover:bg-[#002F6C]"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
