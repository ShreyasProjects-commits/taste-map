// services/merge.js
// Takes results from multiple sources, deduplicates, and returns one clean list.

function normaliseName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
}

function mergeResults(foursquareResults, osmResults) {
  const seen = new Set();
  const merged = [];

  // Add all Foursquare results first (better data quality)
  for (const place of foursquareResults) {
    const key = normaliseName(place.name);
    seen.add(key);
    merged.push(place);
  }

  // Add OSM results only if not already seen
  for (const place of osmResults) {
    const key = normaliseName(place.name);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(place);
    }
  }

  return merged;
}

module.exports = { mergeResults };
