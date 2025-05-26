"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Logout from "./logoutConfirmation";
import Cookies from "js-cookie";
import { useProfileStore } from "@/stores/useUserStore";

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const imageUrl = useProfileStore((state) => state.imageUrl);
  const setImageUrl = useProfileStore((state) => state.setImageUrl);

  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const storedEmail = Cookies.get("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/get-profile-image`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        const data = await response.json();
        if (data?.profileImage) {
          setImageUrl(data.profileImage);
        }
      } catch (error) {
        console.error("Fetch profile image error:", error);
      }
    };

    if (email) {
      fetchProfileImage();
    }
  }, [email, setImageUrl]);

  const handleLogout = () => {
    setIsModalOpen(true);
    setIsOpen(false);
  };

  const handleConfirmLogout = () => {
    try {
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      localStorage.clear();
      sessionStorage.clear();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const role = Cookies.get("role");

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center border border-gray-300 p-1 rounded-md space-x-1 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image
          src={imageUrl || "/assets/profile-icon.png"}
          width={20}
          height={20}
          className="rounded-full w-10 h-10"
          alt="User Profile"
        />
        <span className="text-gray-800 text-xs sm:text-sm">{role}</span>
        <span className="text-gray-600 text-xs">▾</span>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg border border-gray-200 rounded-md z-50">
          <button
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
            onClick={() => handleNavigation("/profileSettting")}
          >
            Profile Setting
          </button>
          <button
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
            onClick={() => handleNavigation("/facilitySetting")}
          >
            Facility Setting
          </button>
          <button
            className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}

      <Logout
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handleConfirmLogout={handleConfirmLogout}
      />
    </div>
  );
};

export default UserDropdown;
