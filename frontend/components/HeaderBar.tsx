import React from "react";
import Notification from "./Notification";
import UserDropdown from "./profile-dropdown";
import Cookies from "js-cookie";

const HeaderBar: React.FC = () => {
  const role = Cookies.get("name") || "User"; // fallback if cookie is missing

  return (
    <header className="flex items-center justify-between mb-6 w-full flex-wrap">
      <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">
        Hello, <span className="text-blue-900 capitalize">{role}</span>
      </h2>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Notification />
        <UserDropdown />
      </div>
    </header>
  );
};

export default HeaderBar;
