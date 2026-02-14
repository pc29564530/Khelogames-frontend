//Move the location service to a separate file

import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// Get location based on IP address
// Returns { city, state, country }
// Fast and doesn't require GPS permission

export const getIPBasedLocation = async () => {
  try {
    console.log("Getting IP-based location...");

    const response = await fetch('http://ip-api.com/json/', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const data = await response.json();
    console.log("IP location response:", data);

    if (data && data.status === 'success') {
      // Clean up region names (remove prefixes like "National Capital Territory of")
      let cleanedRegion = data.regionName || data.region || '';
      cleanedRegion = cleanedRegion
        .replace(/^National Capital Territory of /i, '')
        .replace(/^Union Territory of /i, '')
        .replace(/^State of /i, '')
        .trim();

      const location = {
        city: data.city || '',
        state: cleanedRegion,
        country: data.country || '',
      };

      console.log("✓ IP Location:", location);
      return location;
    }

    return null;
  } catch (err) {
    console.error("IP location failed:", err.message);
    return null;
  }
};

// Get GPS coordinates with buffering for accuracy
// Returns { latitude, longitude }
// Requires location permission
export const getGPSCoordinates = (onSuccess, onError, setIsLoading) => {
  if (setIsLoading) setIsLoading(true);
  console.log("Getting GPS coordinates...");

  let locationBuffer = [];

  const handlePositionSuccess = (position) => {
    console.log("✓ GPS Position received:", position);

    if (!position || !position.coords) {
      if (setIsLoading) setIsLoading(false);
      if (onError) onError(new Error('Unable to get coordinates'));
      return;
    }

    const { latitude, longitude, accuracy } = position.coords;
    console.log("Coordinates:", latitude, longitude, "Accuracy:", accuracy);

    // Buffer coordinates for better accuracy (average of 3 readings)
    locationBuffer.push({ latitude, longitude });
    if (locationBuffer.length > 3) {
      locationBuffer.shift();
    }

    if (locationBuffer.length >= 3) {
      const avgLat = locationBuffer.reduce((sum, p) => sum + p.latitude, 0) / locationBuffer.length;
      const avgLng = locationBuffer.reduce((sum, p) => sum + p.longitude, 0) / locationBuffer.length;
      console.log("Avg coordinates:", avgLat, avgLng);
      if (setIsLoading) setIsLoading(false);
      if (onSuccess) onSuccess({ latitude: avgLat, longitude: avgLng });
    } else {
      if (setIsLoading) setIsLoading(false);
      if (onSuccess) onSuccess({ latitude, longitude });
    }
  };

  // First try with high accuracy
  Geolocation.getCurrentPosition(
    handlePositionSuccess,
    (error) => {
      console.error("High accuracy failed:", error);
      console.log("Trying with lower accuracy...");

      // Fallback to lower accuracy
      Geolocation.getCurrentPosition(
        handlePositionSuccess,
        (finalError) => {
          console.error("Final geolocation error:", finalError);
          if (setIsLoading) setIsLoading(false);
          if (onError) {
            onError(finalError);
          } else {
            Alert.alert(
              'Location Error',
              `Unable to get location. Please ensure:\n• GPS is enabled\n• You're in an open area\n• Location services are on\n\nError: ${finalError.message}`
            );
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 10000,
      distanceFilter: 0,
      forceRequestLocation: true,
      showLocationDialog: true,
    }
  );
};

// Request location permission and get GPS coordinates
// Returns coordinates via callback: onSuccess({ latitude, longitude })

export const requestLocationPermission = async (onSuccess, onError, setIsLoading) => {
  console.log("Platform:", Platform.OS);

  if (Platform.OS === "android") {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'We need access to your location to get GPS coordinates.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );

    console.log("Permission granted:", granted);

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      getGPSCoordinates(onSuccess, onError, setIsLoading);
      return true;
    } else {
      Alert.alert(
        'Location Permission Denied',
        'You can still continue without precise GPS location.'
      );
      if (setIsLoading) setIsLoading(false);
      return false;
    }
  } else if (Platform.OS === "ios") {
    getGPSCoordinates(onSuccess, onError, setIsLoading);
    return true;
  }
};
