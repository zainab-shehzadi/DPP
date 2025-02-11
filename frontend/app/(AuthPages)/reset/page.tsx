"use client";
import Link from 'next/link';


import "@fortawesome/fontawesome-free/css/all.min.css";
import { CheckCircleIcon } from "@heroicons/react/24/solid"; 
import Image2 from "@/components/imageright"; // Ensure the correct import path
const Login: React.FC = () => {
  

  return (
    <div className="flex h-screen font-work-sans">
      {/* Left Side: Success Message and Login Button */}
      <div className="flex flex-1 justify-center items-center bg-white">
        <div className="w-full max-w-md px-6 py-6 text-center">
          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <CheckCircleIcon className="h-16 w-16 text-green-500" />
          </div>

       {/* Success message */}
<p className="text-sm sm:text-base md:text-lg font-medium text-gray-800 mb-8 text-center">
  Password reset successfully
</p>


          {/* Login button */}
          <Link href="/LoginPage">
            <button
              type="button"
              className="w-full py-3 bg-[#002f6c] text-white font-semibold rounded-lg  transition-colors shadow-lg"
            >
              Login
            </button>
          </Link>
        </div>
      </div>

      {/* Right Side: Image with Quote */}
      <Image2 />
    </div>
  );
};

export default Login;
