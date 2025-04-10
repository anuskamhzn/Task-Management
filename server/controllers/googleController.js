const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Store tokens in memory (for demo only – use DB in production)
let userTokens = null;

exports.googleAuth = (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/calendar'];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  res.redirect(authUrl);
};

exports.googleCallback = async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    userTokens = tokens; // Save to DB in production
    res.send('Google Calendar connected successfully!');
  } catch (err) {
    res.status(500).send('Error retrieving access token');
  }
};

exports.createEvent = async (req, res) => {
  try {
    if (!userTokens) return res.status(401).send('User not authenticated');

    oauth2Client.setCredentials(userTokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: req.body.summary || 'Test Event',
      description: req.body.description || '',
      start: { dateTime: req.body.start },
      end: { dateTime: req.body.end },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error('Create Event Error:', err);
    res.status(500).send('Failed to create event');
  }
};

// List events from Google Calendar
exports.listEvents = async (req, res) => {
  try {
    if (!userTokens) {
      return res.status(401).send('User not authenticated');
    }

    oauth2Client.setCredentials(userTokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Fetch events from the primary calendar
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(), // Optional: only future events
      maxResults: 10, // Optional: limit number of events
      singleEvents: true,
      orderBy: 'startTime', // Order by start time
    });

    // Send events as JSON response
    res.json(response.data.items);
  } catch (err) {
    console.error('Error retrieving events:', err);
    res.status(500).send('Failed to fetch events');
  }
};
