import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';

// Get location based on IP address
// Returns { city, state, country }
// Fast — no permission required
export const getIPBasedLocation = async () => {
  try {
    const response = await axios.get('https://ip-api.com/json/');
    const data = response.data; // axios: use response.data, NOT response.json()

    if (data && data.status === 'success') {
      let cleanedRegion = data.regionName || data.region || '';
      cleanedRegion = cleanedRegion
        .replace(/^National Capital Territory of /i, '')
        .replace(/^Union Territory of /i, '')
        .replace(/^State of /i, '')
        .trim();

      return {
        city: data.city || '',
        state: cleanedRegion,
        country: data.country || '',
      };
    }
    return null;
  } catch (err) {
    console.error('IP location failed:', err.message);
    return null;
  }
};

// Get GPS coordinates
// Returns { latitude, longitude } via callback
export const getGPSCoordinates = (onSuccess, onError, setIsLoading) => {
  if (setIsLoading) setIsLoading(true);

  const handleSuccess = (position) => {
    if (setIsLoading) setIsLoading(false);
    if (!position?.coords) {
      if (onError) onError(new Error('Unable to get coordinates'));
      return;
    }
    const { latitude, longitude } = position.coords;
    if (onSuccess) onSuccess({ latitude, longitude });
  };

  const handleError = (error) => {
    console.error('GPS error:', error);
    // Fallback: try with lower accuracy
    Geolocation.getCurrentPosition(
      handleSuccess,
      (finalError) => {
        if (setIsLoading) setIsLoading(false);
        if (onError) {
          onError(finalError);
        } else {
          Alert.alert(
            'Location Error',
            'Unable to get location. Please ensure GPS is enabled and try again.'
          );
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
  };

  Geolocation.getCurrentPosition(
    handleSuccess,
    handleError,
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    // removed: distanceFilter, forceRequestLocation, showLocationDialog
    // those belong to react-native-geolocation-service, not @react-native-community/geolocation
  );
};

// Request location permission then get GPS coordinates
export const requestLocationPermission = async (onSuccess, onError, setIsLoading) => {
  if (Platform.OS === 'ios') {
    getGPSCoordinates(onSuccess, onError, setIsLoading);
    return true;
  }

  if (Platform.OS !== 'android') return false;

  // Check if already granted — skip dialog if so
  const alreadyGranted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  if (alreadyGranted) {
    getGPSCoordinates(onSuccess, onError, setIsLoading);
    return true;
  }

  // Request — requestMultiple takes ONE array argument
  const results = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);

  const fine = results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
  const coarse = results[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];

  const allowed =
    fine === PermissionsAndroid.RESULTS.GRANTED ||
    coarse === PermissionsAndroid.RESULTS.GRANTED;

  if (allowed) {
    getGPSCoordinates(onSuccess, onError, setIsLoading);
    return true;
  }

  // User denied — check if permanently denied (NEVER_ASK_AGAIN)
  const permanentlyDenied =
    fine === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
    coarse === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;

  if (setIsLoading) setIsLoading(false);

  Alert.alert(
    'Location Permission Denied',
    permanentlyDenied
      ? 'Location permission was permanently denied. Please enable it in Settings.'
      : 'Location permission is required to use this feature.',
    permanentlyDenied
      ? [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      : [{ text: 'OK' }]
  );

  return false;
};
