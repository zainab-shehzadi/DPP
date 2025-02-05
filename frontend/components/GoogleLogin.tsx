import React, { useState } from 'react';

const GoogleLogin = () => {
  const [authUrl, setAuthUrl] = useState(null);

  // Fetch the Google Auth URL
  const getAuthUrl = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/calendar/auth-url`);
      if (!response.ok) {
        throw new Error('Failed to fetch auth URL');
      }
      const data = await response.json();
      if (data.authUrl) {
        setAuthUrl(data.authUrl);
      } else {
        console.error('Auth URL not provided in the response');
      }
    } catch (error:any) {
      console.error('Error fetching auth URL:', error.message);
    }
  };

  // Handle login button click
  const handleLogin = () => {
    if (authUrl) {
      window.location.href = authUrl; // Redirect the user to Google login
    } else {
      console.error('Auth URL not available.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Google Calendar Integration</h1>
      <p>Log in to your Google account to authorize access to your calendar.</p>
      <button 
        onClick={getAuthUrl} 
        style={{
          padding: '10px 20px',
          backgroundColor: '#4285F4',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Get Google Auth URL
      </button>
      {authUrl && (
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={handleLogin} 
            style={{
              padding: '10px 20px',
              backgroundColor: '#34A853',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Log in with Google
          </button>
        </div>
      )}
    </div>
  );
};

export default GoogleLogin;