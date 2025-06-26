
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaBuilding, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import { useFacilityAPI } from '@/hooks/useFacilityAPI';
import { useDashboardStore } from '@/stores/useDashboardStore';
import Cookies from 'js-cookie';

const FacilitySelector = ({ 
  onFacilityChange, 
  showFacilityInfo = true,
  className = "",
  disabled = false 
}) => {
  const dropdownRef = useRef(null);
  const userRole = Cookies.get('role');
  const userEmail = Cookies.get('email');
  
  const {
    facilities,
    selectedFacility,
    setFacilities,
    setSelectedFacility,
  } = useDashboardStore();
  console.log("facilities 26", facilities)

  const { 
    fetchRegionalAdminFacilities, 
    switchFacilityContext, 
    loading 
  } = useFacilityAPI();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch facilities on component mount
  useEffect(() => {
    const loadFacilities = async () => {
      if (userRole === 'Regional Admin' && userEmail) {
        try {
          const data = await fetchRegionalAdminFacilities(userEmail);
          setFacilities(data.facilities);
          
          // Set default facility if none selected
          if (data.facilities.length > 0 && !selectedFacility) {
            const defaultFacility = data.facilities[0];
            handleFacilitySelect(defaultFacility);
          }
        } catch (error) {
          console.error('Failed to load facilities:', error);
        }
      }
    };

    loadFacilities();
  }, [userRole, userEmail, fetchRegionalAdminFacilities, setFacilities, selectedFacility]);

  // Handle facility selection
  const handleFacilitySelect = (facility) => {
    setSelectedFacility(facility);
    switchFacilityContext(facility);
    setIsOpen(false);
    setSearchTerm('');
    
    // Call callback if provided
    if (onFacilityChange) {
      onFacilityChange(facility);
    }
  };

  // Filter facilities based on search term
  const filteredFacilities = facilities.filter(facility =>
    facility?.facilityName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    facility?.facilityCode?.toLowerCase().includes(searchTerm?.toLowerCase())
  );
  console.log("filteredFacilities 88", filteredFacilities)

  // Don't render for non-regional admins
  if (userRole !== 'Regional Admin') {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      
      {/* Selector Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={`
          flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-300 
          rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 
          focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
      >
        <div className="flex items-center space-x-3">
          <FaBuilding className="text-blue-600" />
          <div className="text-left">
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Selected Facility
            </div>
            <div className="font-semibold text-gray-900">
              {loading ? 'Loading...' : selectedFacility?.facilityName || 'No facility selected'}
            </div>
            {selectedFacility && (
              <div className="text-xs text-gray-500">
                Code: {selectedFacility.facilityCode}
              </div>
            )}
          </div>
        </div>
        <FaChevronDown 
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Search Input */}
          {facilities.length > 5 && (
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          )}

          {/* Facilities List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredFacilities.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No facilities match your search' : 'No facilities assigned'}
              </div>
            ) : (
              filteredFacilities.map((facility) => (
                <button
                  key={facility._id}
                  onClick={() => handleFacilitySelect(facility)}
                  className={`
                    w-full text-left p-4 hover:bg-blue-50 border-b border-gray-100 
                    last:border-b-0 transition-colors duration-150
                    ${selectedFacility?._id === facility._id 
                      ? 'bg-blue-100 border-blue-200' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className={`font-semibold ${
                        selectedFacility?._id === facility._id 
                          ? 'text-blue-900' 
                          : 'text-gray-900'
                      }`}>
                        {facility.facilityName}
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <FaBuilding className="text-xs" />
                          <span>Code: {facility.facilityCode}</span>
                        </span>
                        
                        <span className="flex items-center space-x-1">
                          <FaUser className="text-xs" />
                          <span>{facility.adminName}</span>
                        </span>
                      </div>
                      
                      {facility.facilityAddress && (
                        <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                          <FaMapMarkerAlt />
                          <span>{facility.facilityAddress}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3 mt-2 text-xs">
                        <span className="bg-gray-100 px-2 py-1 rounded-full">
                          {facility.noOfBeds} beds
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {facility.status}
                        </span>
                      </div>
                    </div>
                    
                    {selectedFacility?._id === facility._id && (
                      <div className="ml-2 text-blue-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Facility Info Card */}
      {showFacilityInfo && selectedFacility && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Current Facility Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-500 font-medium">Facility Code</span>
              <span className="text-gray-900">{selectedFacility.facilityCode}</span>
            </div>
            {/* <div className="flex flex-col">
              <span className="text-gray-500 font-medium">Number of Beds</span>
              <span className="text-gray-900">{selectedFacility.noOfBeds}</span>
            </div> */}
            <div className="flex flex-col">
              <span className="text-gray-500 font-medium">Admin</span>
              <span className="text-gray-900">{selectedFacility.adminName}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 font-medium">Status</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 w-fit">
                {selectedFacility.status}
              </span>
            </div>
          </div>
          {selectedFacility.facilityAddress && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <span className="text-gray-500 font-medium">Address: </span>
              <span className="text-gray-900">{selectedFacility.facilityAddress}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FacilitySelector;