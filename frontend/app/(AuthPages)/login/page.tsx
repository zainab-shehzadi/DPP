// "use client";

// import Link from "next/link";
// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Image2 from "@/components/imageright";
// import { toast } from "react-toastify";
// import Image from "next/image";
// import Cookies from "js-cookie";

// const Login: React.FC = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState<string>("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const router = useRouter();

//   const setCookie = (name: string, value: string, days = 7) => {
//     const expires = new Date(Date.now() + days * 86400000).toUTCString();
//     document.cookie = `${name}=${value}; path=/; expires=${expires}; secure`;
//   };
//   const getCookie = (name: string) => {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if (parts.length === 2) return parts.pop()?.split(";").shift();
//     return null;
//   };
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (isSubmitting) return; // prevent double submission
//     setIsSubmitting(true);

//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/login`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ email, password }),
//         }
//       );

//       const data = await response.json();

//       if (response.ok) {
//         toast.success("Login successful! Redirecting...", {
//           position: "top-right",
//         });

//         setCookie("name", data.name);
//         setCookie("token", data.token);
//         setCookie("email", data.email);
//         setCookie("role", data.role);
//         setCookie("DepartmentName", data.DepartmentName || "");
//         setCookie("priceType", data.priceType || "");
//         setCookie("priceCycle", data.priceCycle || "");

//         const storedRole = getCookie("role");
//         const priceCycle = getCookie("priceCycle");

//        if (priceCycle === "Annual" || priceCycle === "Bi-Annual") {
//           setTimeout(() => router.push(`/Dashboard`), 2000);
//         } else {
//           setTimeout(() => router.push(`/Pricing`), 3000);
//         }
//       } else {
//         toast.error(data.message || "Login failed!", { position: "top-right" });
//         setIsSubmitting(false);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       toast.error("An error occurred. Please try again.", {
//         position: "top-right",
//       });
//       setIsSubmitting(false);
//     }
//   };

//   const handleGoogleLogin = async () => {
//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/calendar/auth-url`
//       );
//       if (!response.ok) {
//         throw new Error("Failed to fetch Google Auth URL.");
//       }

//       const data = await response.json();
//       if (data.authUrl) {
//         window.location.href = data.authUrl;
//       } else {
//         toast.error("Google Auth URL not provided in the response.", {
//           position: "top-right",
//         });
//       }
//     } catch (error) {
//       toast.error("Error during Google login.", { position: "top-right" });
//     }
//   };

//   useEffect(() => {
//     if (message) {
//       const timer = setTimeout(() => {
//         setMessage("");
//       }, 2000);
//       return () => clearTimeout(timer);
//     }
//   }, [message]);

//   return (
//     <div className="flex h-screen font-work-sans bg-gray-50">
//       {/* Left Side: Login Form */}
//       <div className="flex flex-1 justify-center items-center bg-white ">
//         <div className="w-full max-w-md px-6 py-6 text-left">
//           <h2 className="text-3xl font-bold text-gray-800 mb-4 text-left">
//             Log In
//           </h2>
//           <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//             {/* Email Input Field */}
//             <div className="mb-4">
//               <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
//               />
//             </div>

//             {/* Password Input Field */}
//             <div className="mb-4">
//               <label className="block text-sm sm:text-base font-bold text-gray-700 mb-1">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
//               />
//             </div>

//             {/* Forgot Password Link */}
//             <div className="text-right ">
//               <Link
//                 href="/forgetpassword"
//                 className="text-sm sm:text-base text-blue-900 hover:underline"
//               >
//                 Forgot your password?
//               </Link>
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className={`w-full py-3 font-semibold rounded-lg transition-colors text-sm sm:text-base ${
//                 isSubmitting
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-[#002f6c] text-white"
//               }`}
//             >
//               {isSubmitting ? "Signing in..." : "Sign in"}
//             </button>
//           </form>

//           <div className="flex items-center my-4">
//             <hr className="flex-grow border-gray-300" />
//             <span className="px-4 text-gray-500">or</span>
//             <hr className="flex-grow border-gray-300" />
//           </div>

//           {/* Button */}
//           <div className="flex gap-4">
//             <button
//               onClick={handleGoogleLogin}
//               className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-[#ffffff] hover:text-black transition-colors"
//             >
//               <Image
//                 src="/assets/google-icon.png"
//                 alt="Google Logo"
//                 width={24}
//                 height={24}
//                 className="mr-3"
//               />

//               <span className="ml-2">Log In With Google</span>
//             </button>
//           </div>
//           {/* <div className="mt-6 text-left">
//             <p
//               className="text-lg mb-4"
//               style={{ fontFamily: "Poppins, sans-serif", color: "#969AB8" }}
//             >
//               Don't have an account?{" "}
//               <Link href="/signup" className="text-[#002f6c] font-bold ">
//                 Sign Up
//               </Link>
//             </p>
//           </div> */}
//         </div>
//       </div>

//       <Image2 />

//       {message && (
//         <div className="fixed bottom-4 left-4 p-4 bg-green-700 text-white rounded-lg">
//           {message}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Login;

"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image2 from "@/components/imageright";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const setCookie = (name: string, value: string, days = 7) => {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${value}; path=/; expires=${expires}; secure`;
  };
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const facilityRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/check-facility123`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const facilityData = await facilityRes.json();
      console.log("data 48", facilityData);
      Cookies.set("selectedFacilityId", facilityData?.facility?._id);
      Cookies.set("facilityId", facilityData?.facility?._id)
      Cookies.set("facilityName", facilityData?.facility?.facilityName);
      Cookies.set("facilityAddress", facilityData?.facility?.facilityAddress);
      if (facilityData.message !== "OK" || facilityData.access !== "granted") {
        toast.error("Facility is not assigned to this user.", {
          position: "top-right",
        });
        setIsSubmitting(false);
        return;
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Login successful! Redirecting...", {
          position: "top-right",
        });

        setCookie("name", data.name);
        setCookie("token", data.token);
        setCookie("email", data.email);
        setCookie("role", data.role);
        setCookie("DepartmentName", data.DepartmentName || "");
        setCookie("priceType", data.priceType || "");
        setCookie("priceCycle", data.priceCycle || "");

        const normalize = (v: string | null | undefined) =>
          (v || "").toLowerCase().replace(/['"]+/g, "").trim();

        const role = normalize(getCookie("role"));
        const cycle = normalize(getCookie("priceCycle"));

        if (role === "facility admin") {
          if (!cycle || cycle === "undefined" || cycle === "null") {
            setTimeout(() => router.push("/Pricing"), 2000);
          } else {
            setTimeout(() => router.push("/Dashboard"), 2000);
          }
        } else if (role === "facility users") {
          setTimeout(() => router.push("/TaskListPage"), 2000);
        } else {
          setTimeout(() => router.push("/Dashboard"), 2000);
        }
      } else {
        toast.error(data.message || "Login failed!", {
          position: "top-right",
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.", {
        position: "top-right",
      });
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/calendar/auth-url`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Google Auth URL.");
      }

      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error("Google Auth URL not provided in the response.", {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error("Error during Google login.", { position: "top-right" });
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="flex h-screen font-work-sans bg-gray-50">
      {/* Left Side: Login Form */}
      <div className="flex flex-1 justify-center items-center bg-white ">
        <div className="w-full max-w-md px-6 py-6 text-left">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-left">
            Log In
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Input Field */}
            <div className="mb-4">
              <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>

            {/* Password Input Field */}
            <div className="mb-4">
              <label className="block text-sm sm:text-base font-bold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right ">
              <Link
                href="/forgetpassword"
                className="text-sm sm:text-base text-blue-900 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 font-semibold rounded-lg transition-colors text-sm sm:text-base ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#002f6c] text-white"
              }`}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-4 text-gray-500">or</span>
            <hr className="flex-grow border-gray-300" />
          </div> */}

          {/* Button */}

          {/* <div className="mt-6 text-left">
            <p
              className="text-lg mb-4"
              style={{ fontFamily: "Poppins, sans-serif", color: "#969AB8" }}
            >
              Don't have an account?{" "}
              <Link href="/signup" className="text-[#002f6c] font-bold ">
                Sign Up
              </Link>
            </p>
          </div> */}
        </div>
      </div>

      <Image2 />

      {message && (
        <div className="fixed bottom-4 left-4 p-4 bg-green-700 text-white rounded-lg">
          {message}
        </div>
      )}
    </div>
  );
};

export default Login;
