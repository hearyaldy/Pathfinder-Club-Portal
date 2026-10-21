import { ChurchOrganization } from '../types/club';

// Earth radius in miles
const EARTH_RADIUS_MILES = 3958.8;
// Earth radius in meters
const EARTH_RADIUS_METERS = 6371000;

/**
 * Calculates distance between two latitude/longitude points in miles using Haversine formula
 */
export function calculateDistanceMiles(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_MILES * c * 10) / 10;
}

/**
 * Calculates distance between two points in meters
 */
export function calculateDistanceMeters(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_METERS * c);
}

/**
 * Finds the nearest church organization from user coordinates
 */
export function findNearestChurch(
  lat: number, 
  lng: number, 
  churches: ChurchOrganization[]
): { church: ChurchOrganization; distanceMiles: number } | null {
  if (churches.length === 0) return null;

  let nearest = churches[0];
  let minDistance = calculateDistanceMiles(lat, lng, nearest.latitude, nearest.longitude);

  for (let i = 1; i < churches.length; i++) {
    const d = calculateDistanceMiles(lat, lng, churches[i].latitude, churches[i].longitude);
    if (d < minDistance) {
      minDistance = d;
      nearest = churches[i];
    }
  }

  return { church: nearest, distanceMiles: minDistance };
}

/**
 * Filters churches based on geofence radius in miles (0 = all churches)
 */
export function filterChurchesByGeofence(
  lat: number | null,
  lng: number | null,
  churches: ChurchOrganization[],
  radiusMiles: number
): Array<ChurchOrganization & { distanceMiles?: number }> {
  if (lat === null || lng === null || radiusMiles <= 0) {
    return churches.map(c => {
      const distance = (lat !== null && lng !== null) 
        ? calculateDistanceMiles(lat, lng, c.latitude, c.longitude)
        : undefined;
      return { ...c, distanceMiles: distance };
    });
  }

  return churches
    .map(c => ({
      ...c,
      distanceMiles: calculateDistanceMiles(lat, lng, c.latitude, c.longitude),
    }))
    .filter(c => c.distanceMiles <= radiusMiles)
    .sort((a, b) => a.distanceMiles - b.distanceMiles);
}

/**
 * Pre-defined simulation locations for easy testing of geofence rules
 */
export const PRESET_SIMULATED_LOCATIONS = [
  {
    id: 'loc-grace',
    name: 'At Grace SDA Church (Springfield)',
    description: 'Directly on campus at 100 Faith Way',
    latitude: 44.0462,
    longitude: -123.0220,
    expectedChurchId: 'org-grace',
  },
  {
    id: 'loc-berean',
    name: 'At Berean SDA Church (Eugene)',
    description: 'West Eugene district campus at 450 Hope Blvd (4.1 mi from Grace)',
    latitude: 44.0521,
    longitude: -123.0868,
    expectedChurchId: 'org-berean',
  },
  {
    id: 'loc-livinghope',
    name: 'At Living Hope Church (Corvallis)',
    description: 'Benton County parish campus at 88 River Rd (38 mi north)',
    latitude: 44.5646,
    longitude: -123.2620,
    expectedChurchId: 'org-livinghope',
  },
  {
    id: 'loc-outside',
    name: 'Outside District 4 (Portland Metro)',
    description: 'Outside local district geofence (105 miles north)',
    latitude: 45.5152,
    longitude: -122.6784,
    expectedChurchId: undefined,
  },
];
