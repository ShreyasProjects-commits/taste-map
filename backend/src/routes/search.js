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