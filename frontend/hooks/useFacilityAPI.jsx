import { useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

export const useFacilityAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get API headers with auth token
  const getHeaders = useCallback(() => {
    const token = Cookies.get('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, []);

  // Fetch facilities for regional admin
  const fetchRegionalAdminFacilities = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/regional-admin-facilities`,
        { email },
        { headers: getHeaders() }
      );

      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Failed to fetch facilities');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch facilities';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  // Fetch facility-specific data (POCs, documents, etc.)
  const fetchFacilityData = useCallback(async (facilityId, dataType = 'pocs') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facilities/${facilityId}/${dataType}`,
        { headers: getHeaders() }
      );

      if (response.status === 200) {
        return response.data;
      }
      throw new Error(`Failed to fetch ${dataType}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to fetch ${dataType}`;
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  // Upload file with facility context
  const uploadFileToFacility = useCallback(async (file, facilityId, additionalData = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('facilityId', facilityId);
      
      // Add any additional data
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 201) {
        toast.success('File uploaded successfully');
        return response.data;
      }
      throw new Error('Upload failed');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Upload failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get facility statistics
  const getFacilityStats = useCallback(async (facilityId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facilities/${facilityId}/stats`,
        { headers: getHeaders() }
      );

      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Failed to fetch facility stats');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch facility stats';
      setError(errorMessage);
      // Don't show toast for stats errors as they might be called frequently
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  // Switch facility context (for regional admins)
  const switchFacilityContext = useCallback((facility) => {
    try {
      // Update cookies with selected facility info
      Cookies.set('selectedFacilityId', facility._id);
      Cookies.set('facilityName', facility.facilityName);
      Cookies.set('facilityCode', facility.facilityCode);
      
      if (facility.facilityAddress) {
        Cookies.set('facilityAddress', facility.facilityAddress);
      }
      
      toast.success(`Switched to ${facility.facilityName}`);
      return true;
    } catch (err) {
      toast.error('Failed to switch facility');
      return false;
    }
  }, []);

  return {
    loading,
    error,
    fetchRegionalAdminFacilities,
    fetchFacilityData,
    uploadFileToFacility,
    getFacilityStats,
    switchFacilityContext,
    clearError: () => setError(null),
  };
};