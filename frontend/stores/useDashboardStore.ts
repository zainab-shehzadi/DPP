// stores/useDashboardStore.ts
import { create } from "zustand";

type DashboardStore = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (value: boolean) => void;

  file: File | null;
  setFile: (file: File | null) => void;

  loading: boolean;
  setLoading: (value: boolean) => void;

  email: string | null;
  setEmail: (email: string | null) => void;

  uploadStatus: string;
  setUploadStatus: (status: string) => void;
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (value) => set(() => ({ isSidebarOpen: value })),

  file: null,
  setFile: (file) => set({ file }),

  loading: false,
  setLoading: (loading) => set({ loading }),

  email: null,
  setEmail: (email) => set({ email }),

  uploadStatus: "",
  setUploadStatus: (uploadStatus) => set({ uploadStatus }),
}));
