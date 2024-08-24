const express = require('express');
const mongoose = require('mongoose');
const app = express();
const { google } = require('googleapis');
const analyticsreporting = google.analyticsreporting('v4');
const fs = require('fs');
const path = require('path');

mongoose.connect('mongodb+srv://anujkumarsinghcoder:QgSvKNYjniJWzg0F@project-next.amlt0ce.mongodb.net/?retryWrites=true&w=majority&appName=project-next');

const userSchema = new mongoose.Schema({
    username: String,
    links: [{ linkName: String, url: String }]
});

const User = mongoose.model('User', userSchema);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 









// Load the service account credentials
const keyPath = path.join(__dirname, 'config/black-media-433412-b0.json'); // Update with your JSON file path
const key = JSON.parse(fs.readFileSync(keyPath));

// Initialize JWT client
const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/analytics.readonly'],
  null
);


// View ID from Google Analytics
const VIEW_ID = '455823334'; // Replace with your GA View ID


// Function to fetch data
async function getLinkData(username, linkLabel) {
  try {
    const response = await analyticsreporting.reports.batchGet({
      auth: jwtClient,
      requestBody: {
        reportRequests: [
          {
            viewId: VIEW_ID,
            dateRanges: [
              {
                startDate: '30daysAgo',
                endDate: 'today',
              },
            ],
            metrics: [
              {
                expression: 'ga:totalEvents',
              },
            ],
            dimensions: [
              {
                name: 'ga:eventLabel',
              },
            ],
            filtersExpression: `ga:eventCategory==user_link`, // More general filter
          },
        ],
      },
    });

    const report = response.data.reports[0];
    const rows = report.data.rows;

    if (rows) {
      return rows
        .filter(row => row.dimensions[0] === `${username}_${linkLabel}`)
        .map(row => ({
          link: row.dimensions[0],
          clicks: row.metrics[0].values[0],
        }));
    } else {
      return [];
    }
  } catch (err) {
    console.error('Error fetching data:', err);
    return [];
  }
}











// Home route with sign-up form
app.get('/', (req, res) => {
    res.render('index');
});

// Create a new user
app.post('/signup', async (req, res) => {
    const { username } = req.body;

    // Check if the user already exists
    let user = await User.findOne({ username });
    if (user) {
        return res.send('Username already exists');
    }

    // Create a new user
    user = new User({ username, links: [] });
    await user.save();

    res.redirect(`/user/${username}`);
});

// User's page to view and add links
app.get('/user/:username', async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
        return res.send('User not found');
    }

    res.render('user', { user });
});

// Add a link to a user's page
app.post('/user/:username/add-link', async (req, res) => {
    const { username } = req.params;
    const { linkName, url } = req.body;

    // Find the user and add the link
    const user = await User.findOne({ username });
    if (!user) {
        return res.send('User not found');
    }

    user.links.push({ linkName, url });
    await user.save();

    res.redirect(`/user/${username}`);
});









app.get('/analytics/:username/:linkLabel', async (req, res) => {
  const { username, linkLabel } = req.params;
  const analyticsData = await getLinkData(username, linkLabel);
  
  res.render('analyticsPage', {
    username,
    analyticsData,
  });
});



  



// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
