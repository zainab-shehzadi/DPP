import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useDashboardStore = create(
  persist(
    (set, get) => ({
      // Existing state
      isSidebarOpen: false,
      file: null,
      loading: false,
      email: '',
      uploadStatus: '',
      
      // New facility management state
      facilities: [],
      selectedFacility: null,
      loadingFacilities: false,
      
      // Existing actions
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setFile: (file) => set({ file }),
      setLoading: (loading) => set({ loading }),
      setEmail: (email) => set({ email }),
      setUploadStatus: (status) => set({ uploadStatus: status }),
      
      // New facility management actions
      setFacilities: (facilities) => set({ facilities }),
      setSelectedFacility: (facility) => set({ selectedFacility: facility }),
      setLoadingFacilities: (loading) => set({ loadingFacilities: loading }),
      
      // Clear facility data (useful for logout)
      clearFacilityData: () => set({
        facilities: [],
        selectedFacility: null,
        loadingFacilities: false,
      }),
      
      // Get selected facility info
      getSelectedFacilityInfo: () => {
        const state = get();
        return state.selectedFacility;
      },
      
      // Check if user has multiple facilities
      hasMultipleFacilities: () => {
        const state = get();
        return state.facilities.length > 1;
      },
    }),
    {
      name: 'dashboard-storage',
      // Only persist selected facility, not the full facilities list
      partialize: (state) => ({
        selectedFacility: state.selectedFacility,
      }),
    }
  )
);