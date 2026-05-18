// routes/search.js
// The /api/search HTTP endpoint.

const express = require('express');
const router = express.Router();
const { searchRestaurants } = require('../services/foursquare.js');

router.get('/', async (req, res) => {
  try {
    const { q, location, radius } = req.query;

    // Validation: require q and location
    if (!q || !location) {
      return res.status(400).json({
        error: 'Missing required query parameters',
        required: ['q', 'location']
      });
    }

    // Validate location format (must be lat,lng like -33.87,151.21)
    const locationRegex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
    if (!locationRegex.test(location)) {
      return res.status(400).json({
        error: 'Invalid location format',
        expected: 'lat,lng — for example: -33.87,151.21'
      });
    }

    // Call the Foursquare service
    const results = await searchRestaurants({
      query: q,
      location: location,
      radius: radius ? parseInt(radius) : 1000
    });

    // Return structured response
    res.json({
      query: q,
      location: location,
      count: results.length,
      results: results
    });
  } catch (err) {
    res.status(500).json({
      error: 'Search failed',
      message: err.message
    });
  }
});

module.exports = router;