"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";

const MobileNavbar: React.FC = () => {
  const router = useRouter();

  const handleNavigateToPOCAI = () => {
    router.push("/POCAI"); // Navigate to POCAI page
  };

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger>
          <Menu className="cursor-pointer" />
        </SheetTrigger>
        <SheetContent className="bg-white">
          <SheetHeader>
            <ul className="flex flex-col gap-10 mt-10">
              <li className="mob-nav-item">Home</li>
              <li className="mob-nav-item">Product</li>
              <li
                className="mob-nav-item cursor-pointer hover:underline"
                onClick={handleNavigateToPOCAI}
              >
                About Us
              </li>
              <li className="mob-nav-item">Contact</li>
            </ul>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavbar;
