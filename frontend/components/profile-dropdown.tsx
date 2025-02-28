"use client";

import { useState ,useRef, useEffect} from 'react';
import Image from 'next/image';
import { useRouter} from 'next/navigation';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const handleNavigation = (path) => {
    router.push(path);
    setIsOpen(false);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleLogout = () => {
    setIsModalOpen(true); 
    setIsOpen(false);
  };
  const handleConfirmLogout = () => {
    try {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      localStorage.clear();
      sessionStorage.clear();
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
     <div
  className="flex items-center border border-gray-300 p-1 rounded-md space-x-1 cursor-pointer"
  onClick={() => setIsOpen(!isOpen)}
>
  <Image
    src="/assets/profile-icon.png"
    width={20}
    height={20}
    className="rounded-full w-10 h-10"
    alt="User Profile"
  />
  <span className="text-gray-800 text-xs sm:text-sm">User</span>
  <span className="text-gray-600 text-xs">▾</span>
</div>


      {isOpen && (
    <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg border border-gray-200 rounded-md z-50">
          <button className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left" onClick={() => handleNavigation("/profileSettting")}>
            Profile Setting
          </button>
          <button className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left" onClick={() => handleNavigation("/facilitySetting")}>
            Facility Setting
          </button>
          <button className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed top-0 left-0 z-50 w-screen min-h-screen h-full bg-[#00000035] flex justify-center items-center">
          <div className="bg-white p-6 text-center w-[400px] rounded-md">
            <p className="text-lg font-bold text-gray-900">
              Are you sure you want to log out?
            </p>
            <div className="mt-6 flex justify-between">
              <button className="border border-gray-300 text-black px-6 py-2 rounded-md w-full mr-2" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="bg-[#002D62] text-white px-6 py-2 rounded-md w-full ml-2" onClick={handleConfirmLogout}>Log out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
