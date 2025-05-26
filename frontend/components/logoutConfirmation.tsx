import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";

const Logout = ({ isModalOpen, setIsModalOpen, handleConfirmLogout }) => {
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-white shadow-lg">
        <DialogHeader className="text-left space-y-2">
          <DialogTitle className="text-lg font-bold">
            Are you sure you want to log out?
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            You'll be signed out of your account. Make sure you've saved your work before continuing.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-between gap- 2mt-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="w-full bg-[#002D62] text-white hover:bg-[#001F4D]"
            onClick={handleConfirmLogout}
          >
            Log out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Logout;
