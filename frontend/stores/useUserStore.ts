
import { create } from "zustand";

interface ProfileState {
  imageUrl: string;
  setImageUrl: (url: string) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  imageUrl: "/assets/profile-icon.png", 
  setImageUrl: (url) => set({ imageUrl: url }),
}));
