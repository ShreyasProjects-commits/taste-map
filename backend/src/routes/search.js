// routes/search.js
// The /api/search HTTP endpoint.

const express = require('express');
const router = express.Router();
const { searchRestaurants: searchFoursquare } = require('../services/foursquare.js');
const { searchRestaurants: searchOSM } = require('../services/osm.js');
const { mergeResults } = require('../services/merge.js');
const { supabase } = require('../services/supabase.js');

router.get('/', async (req, res) => {
  try {
    const { q, location, radius } = req.query;

    if (!q || !location) {
      return res.status(400).json({
        error: 'Missing required query parameters',
        required: ['q', 'location']
      });
    }

    const locationRegex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
    if (!locationRegex.test(location)) {
      return res.status(400).json({
        error: 'Invalid location format',
        expected: 'lat,lng — for example: -33.87,151.21'
      });
    }

    const options = {
      query: q,
      location: location,
      radius: radius ? parseInt(radius) : 1000
    };

    const user = await getUserFromToken(req);

    // Call both sources in parallel
    const [fsResult, osmResult] = await Promise.allSettled([
      searchFoursquare(options),
      searchOSM(options)
    ]);

    console.log('Foursquare status:', fsResult.status);
    console.log('Foursquare error:', fsResult.reason?.message);
    console.log('OSM status:', osmResult.status);
    console.log('OSM error:', osmResult.reason?.message);

    const foursquareResults = fsResult.status === 'fulfilled' ? fsResult.value : [];
    const osmResults = osmResult.status === 'fulfilled' ? osmResult.value : [];

    const results = mergeResults(foursquareResults, osmResults);
    await saveSearchToDatabase(q, location, results, user?.id || null);

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

async function getUserFromToken(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '');
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

async function saveSearchToDatabase(q, location, results, userId = null) {
  try {
    // Save the search
    const { data: search, error: searchError } = await supabase
      .from('searches')
      .insert({ query: q, location, user_id: userId })
      .select()
      .single();

    if (searchError) throw searchError;

    // Save the results
    const rows = results.map((r) => ({
      search_id: search.id,
      name: r.name,
      address: r.address,
      lat: r.lat,
      lng: r.lng,
      rating: r.rating,
      price: r.price,
      source: r.source,
      external_id: r.externalId
    }));

    const { error: resultsError } = await supabase
      .from('results')
      .insert(rows);

    if (resultsError) throw resultsError;

  } catch (err) {
    // Log but don't crash the request
    console.error('Failed to save search to database:', err.message);
  }
}

module.exports = router;