// services/osm.js
// Service module: queries OpenStreetMap via the Overpass API.
// No API key required.

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

async function searchRestaurants({ query, location, radius = 1000 }) {
  const [lat, lng] = location.split(',').map(Number);

  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["amenity"="restaurant"](around:${radius},${lat},${lng});
      node["amenity"="cafe"](around:${radius},${lat},${lng});
    );
    out body;
  `;

  const url = `${OVERPASS_URL}?data=${encodeURIComponent(overpassQuery.trim())}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'User-Agent': 'TasteMap/1.0 (student project, COMP4060 Macquarie University)'
    }
  });

  if (!response.ok) {
    throw new Error(`Overpass request failed: ${response.status}`);
  }

  const data = await response.json();
  const elements = data.elements || [];

  // OSM has no text search — filter by name if query provided
  const filtered = query
    ? elements.filter(el =>
        el.tags?.name?.toLowerCase().includes(query.toLowerCase())
      )
    : elements;

  return filtered.map((el) => {
    const tags = el.tags || {};
    const addressParts = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:suburb'],
      tags['addr:city']
    ].filter(Boolean);

    return {
      id: `osm:${el.id}`,
      name: tags.name || 'Unknown',
      address: addressParts.join(' ') || '',
      lat: el.lat,
      lng: el.lon,
      rating: null,
      price: null,
      source: 'osm',
      externalId: String(el.id)
    };
  });
}

module.exports = { searchRestaurants };