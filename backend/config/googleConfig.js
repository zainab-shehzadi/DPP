const { google } = require('googleapis');
const path = require('path');

// Initialize OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
console.log(oauth2Client);

// Initialize Google Calendar API
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Log the calendar object configuration
console.log('Google Calendar API Initialized:');
console.log(calendar);

module.exports = {
  oauth2Client,
  calendar,
};
