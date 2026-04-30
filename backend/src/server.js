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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Taste Map backend running on http://localhost:${PORT}/api/health`);
});