"use client";
import Link from 'next/link';


import "@fortawesome/fontawesome-free/css/all.min.css";
import Image2 from "@/components/imageright"; // Ensure the correct import path
const Login: React.FC = () => {
  


  



  return (
    <div className="flex h-screen font-work-sans bg-black-50">
      {/* Left Side: Login Form */}
      <div className="flex flex-1 justify-center items-center bg-white">
        <div className="w-full max-w-md px-6 py-6 text-left">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Check your Email
          </h2>

          <p className="text-medium text-gray-600 mb-10">
  We have sent an email with password reset information to f****i@e***e.com.
</p>

<p className="text-sm text-black-500 mb-5" style={{ marginTop: '12rem' }}>
  Didn’t receive the email? Check spam or promotion folder or
</p>

            <button
  type="submit"
  className="w-full py-3 bg-[#002f6c] text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
>
  Send
</button>


<Link href="/LoginPage">
  <button
    type="button"
    className="w-full px-3 py-2 border border-black-300 rounded-lg font-weight: 700 focus:outline-none mt-5 font-semibold"
  >
    Back to login
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
