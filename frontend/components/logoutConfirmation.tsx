import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FaQuestionCircle } from "react-icons/fa";
import { Button } from "./ui/button";

const Logout = ({ isModalOpen, setIsModalOpen, handleConfirmLogout }) => {
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="flex flex-col justify-center items-center max-w-sm text-center bg-white-100">
        <DialogHeader>
          <FaQuestionCircle className="text-4xl text-primary mx-auto" />
          <DialogTitle>Are you sure you want to Sign Out?</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            No
          </Button>
          <Button className="bg-[#002D62] text-white hover:bg-[#001F4D]" onClick={handleConfirmLogout}>
  Yes
</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Logout;
