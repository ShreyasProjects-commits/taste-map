// Importing the libraries installed
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Creates the Express app
const app = express();

// Middleware which runs on every request, in order
app.use(cors());           // allows the frontend to call backend APIs
app.use(express.json());   // parse incoming JSON bodies

// Routes — what to do when a request hits a URL
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'taste-map-backend',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test-foursquare', async (req, res) => {
  try {
    const { searchRestaurants } = require('./services/foursquare.js');
    const results = await searchRestaurants({
      query: 'ramen',
      location: '-33.87,151.21'
    });
    res.json({ count: results.length, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Taste Map backend running on http://localhost:${PORT}/api/test-foursquare`);
});