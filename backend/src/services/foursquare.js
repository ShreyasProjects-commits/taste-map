// services/foursquare.js
// Knows how to call the Foursquare Places API.

const FOURSQUARE_KEY = process.env.FOURSQUARE_KEY;
const FOURSQUARE_API_URL = 'https://places-api.foursquare.com/places/search';
const FOURSQUARE_API_VERSION = '2025-06-17';

async function searchRestaurants({ query, location, radius = 1000, limit = 10 }) {
  if (!FOURSQUARE_KEY) {
    throw new Error('Missing FOURSQUARE_KEY environment variable');
  }

  const params = new URLSearchParams({
    query: query,
    ll: location,
    radius: String(radius),
    limit: String(limit)
  });

  const response = await fetch(`${FOURSQUARE_API_URL}?${params.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${FOURSQUARE_KEY}`,
      Accept: 'application/json',
      'X-Places-Api-Version': FOURSQUARE_API_VERSION
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Foursquare request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  const results = data.results || [];

  return results.map((item) => {
    const place = item.place || item;

    return {
      id: place.fsq_place_id || place.fsq_id || place.id,
      name: place.name || '',
      address:
        place.location?.formatted_address ||
        place.location?.address ||
        '',
      lat:
        place.latitude ??
        place.geocodes?.main?.latitude ??
        null,
      lng:
        place.longitude ??
        place.geocodes?.main?.longitude ??
        null,
      rating: place.rating ?? null,
      price: place.price ?? null,
      source: 'foursquare',
      externalId: place.fsq_place_id || place.fsq_id || place.id
    };
  });
}

module.exports = {
  searchRestaurants
};