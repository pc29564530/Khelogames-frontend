import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Modal, Platform, PermissionsAndroid, Alert} from 'react-native';
import axiosInstance from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import tailwind from 'twrnc';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { getTournamentBySport } from '../services/tournamentServices';
import { getTournamentBySportAction, setGames, setGame } from '../redux/actions/actions';
import { useDispatch, useSelector } from 'react-redux';
import CountryPicker from 'react-native-country-picker-modal';
import { sportsServices } from '../services/sportsServices';
import Geolocation from "@react-native-community/geolocation";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming
} from "react-native-reanimated";
import { BASE_URL } from '../constants/ApiConstants';

const Tournament = () => {
  const navigation = useNavigation();
  const [currentRole, setCurrentRole] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCountryPicker, setIsCountryPicker] = useState(false);
  const [typeFilterModal, setTypeFilterModal] = useState(false);
  const [statusFilterModal, setStatusFilterModal] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedSport, setSelectedSport] = useState({ id: 1, min_players: 11, name: 'football' });
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const dispatch = useDispatch();
  const tournaments = useSelector((state) => state.tournamentsReducers.tournaments);
  const [filterTournaments, setFilterTournaments] = useState(tournaments?.tournaments || []);
  const [isDropDown, setIsDropDown] = useState(false);
  const games = useSelector((state) => state.sportReducers.games);
  const game = useSelector((state) => state.sportReducers.game);
  const scrollViewRef = useRef(null);

  const handleTournamentPage = (item) => {
    navigation.navigate('TournamentPage', { tournament: item, currentRole: currentRole });
  };

  useEffect(() => {
    const defaultSport = { id: 1, name: 'football', min_players: 11 };
    dispatch(setGame(defaultSport));
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await sportsServices({ axiosInstance });
        dispatch(setGames(data));
      } catch (error) {
        console.error('unable to fetch games data: ', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const checkRole = async () => {
      const role = await AsyncStorage.getItem('Role');
      setCurrentRole(role);
    };
    checkRole();
  }, []);

  useEffect(() => {
    const fetchTournament = async () => {
      const tournamentData = await getTournamentBySport({ axiosInstance, game });
      dispatch(getTournamentBySportAction(tournamentData.tournament));
    };

    if (game?.name) {
      fetchTournament();
    }
  }, [game, axiosInstance, dispatch]);

  const handleSport = useCallback(
    (item) => {
      setSelectedSport(item);
      dispatch(setGame(item));
    },
    [dispatch, game]
  );

    const scrollRight = () => {
        scrollViewRef.current.scrollTo({x:100, animated:true})
    }

  const filteredTournaments = useCallback(() => {
    const filtered = tournaments?.filter(
      (tournament) =>
        tournament.game_id === game.id &&
        (typeFilter === 'all' || tournament.level === typeFilter) &&
        (statusFilter === 'all' || tournament.status_code === statusFilter)
    );

    setFilterTournaments(filtered || tournaments);
  }, [tournaments, game, typeFilter, statusFilter]);

  useEffect(() => {
    filteredTournaments();
  }, [tournaments, game, typeFilter, statusFilter]);

    const scrollY = useSharedValue(0);
    const pos = useSharedValue(0);
    const FILTER_HEIGHT = 100;

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            const currentY = event.contentOffset.y;
            if (currentY > scrollY.value + 5) {
                // scrolling down
                if (pos.value === 0) {
                    pos.value = withTiming(-FILTER_HEIGHT, { duration: 250 });
                }
            } else if (currentY < scrollY.value - 5) {
                // scrolling up
                if (pos.value === -FILTER_HEIGHT) {
                    pos.value = withTiming(0, { duration: 250 });
                }
            }
            scrollY.value = currentY;
        },
    });

    const animatedSportAndFilter = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: pos.value }],
        };
    });


  const renderFilterTournament = ({item}) => {
    // Format date from timestamp
        const startDate = item.start_timestamp
        ? new Date(item.start_timestamp * 1000).toLocaleDateString()
        : "TBD";

        // Status badge colors
        let statusColor = tailwind`bg-gray-200 text-gray-700`;
        if (item.status === "live") statusColor = tailwind`bg-green-100 text-green-700`;
        else if (item.status === "finished") statusColor = tailwind`bg-red-100 text-red-700`;
        else if (item.status === "not_started") statusColor = tailwind`bg-yellow-100 text-yellow-700`;

        return (
            <Pressable
                style={tailwind`bg-white rounded-xl p-4 mb-[2%] shadow-md`}
                onPress={() => handleTournamentPage(item)}
            >
                <View style={tailwind`flex-row items-center`}>
                {/* Icon */}
                <FontAwesome
                    name="trophy"
                    size={32}
                    color="gold"
                    style={tailwind`mr-4`}
                />

                {/* Main Info */}
                <View style={tailwind`flex-1`}>
                    <Text style={tailwind`text-lg font-bold text-gray-900`}>
                    {item.name}
                    </Text>

                    {/* Level + Season + Country */}
                    <View style={tailwind`flex-row flex-wrap mt-1`}>
                    {item.season && (
                        <Text style={tailwind`text-sm text-gray-600 mr-2`}>
                        Season {item.season}
                        </Text>
                    )}
                    {item.country && (
                        <Text style={tailwind`text-sm text-gray-600`}>
                        {item.country}
                        </Text>
                    )}
                    </View>
                </View>

                    {/* Status Badge */}
                    <View style={tailwind`items-center`}>
                        <View
                            style={[
                            tailwind`px-3 py-1 ml-2`,
                            statusColor,
                            ]}
                        >
                            <Text style={tailwind`text-xs font-semibold capitalize`}>
                                {item.status || "not_started"}
                            </Text>
                        </View>
                        <View>
                            <Text style={tailwind`text-sm text-gray-500`}>
                                {startDate}
                            </Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        );
    }

    const reverseGeoCode = async (lat, lon) => {
  console.log("Reverse Latitude: ", lat);
  console.log("Reverse Longitude: ", lon);

  if (!lat || !lon) {
    console.log("Skipping reverse geocode - coordinates are null");
    return;
  }

  try {
    const response = await axiosInstance.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          lat: lat,
          lon: lon,
          format: 'json'
        },
        headers: {
          'User-Agent': 'KhelogamesApp/1.0',
          'Accept': 'application/json',
        },
      }
    );
    
    const data = response.data;
    console.log("Reverse geocode result: ", data);
    
    if (data && data.address) {
      const address = data.address;
      const cityName = address.city || address.town || address.village || '';
      const stateName = address.state || '';
      const countryName = address.country || '';
      
      setCity(cityName);
      setState(stateName);
      setCountry(countryName);
      console.log("Address set: ", cityName, stateName, countryName);
    }
  } catch (err) {
    console.error("Failed to get the reverse geocode: ", err);
    console.error("Error details:", err.response?.data || err.message);
    
    // Fallback or user notification
    Alert.alert(
      'Location Details Unavailable',
      'Could not retrieve city/state information. Please check your internet connection.'
    );
  }
};

    useEffect(() => {
      if(typeFilter === "nearby" && latitude && longitude){
        reverseGeoCode(latitude, longitude);
      }
    }, [typeFilter, latitude, longitude])

const getCurrentCoordinates = () => {
    setIsLoadingLocation(true);
    console.log("Getting current coordinates with GPS...");

    let timeoutId = null;

    // Use getCurrentPosition with high accuracy for GPS
    Geolocation.getCurrentPosition(
      async (position) => {
        console.log("Got position: ", position);
        const {latitude: lat, longitude: lon} = position.coords;
        console.log("Latitude: ", lat, " Longitude: ", lon);

        // Clear timeout once we get a position
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }

        // Set state first
        setLatitude(lat);
        setLongitude(lon);
        setIsLoadingLocation(false);

        // Update location to server and reverse geocode
        try {
          const authToken = await AsyncStorage.getItem("AccessToken");
          const reqData = {
            latitude: lat.toString(),
            longitude: lon.toString()
          };
          const res = await axiosInstance.put(`${BASE_URL}/update-user-location`, reqData, {
            headers: {
              "Authorization": `Bearer ${authToken}`,
              "Content-Type": "application/json",
            }
          });

          console.log("Location updated on server: ", res.data);

          await AsyncStorage.setItem("UserLatitude", lat.toString());
          await AsyncStorage.setItem("UserLongitude", lon.toString());

          // Reverse geocode to get city/state/country
          await reverseGeoCode(lat, lon);

          Alert.alert('Success', 'Location retrieved and saved successfully!');
        } catch (err) {
          console.error("Failed to update location on server: ", err);
          // Still try to reverse geocode even if server update fails
          await reverseGeoCode(lat, lon);
          Alert.alert('Warning', 'Location retrieved but failed to save to server.');
        }
      },
      (error) => {
        console.error("getCurrentPosition error: ", error);

        // Clear timeout on error
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }

        setIsLoadingLocation(false);
        
        let errorMessage = 'Failed to get location.';
        
        if (error.code === 1) {
          // PERMISSION_DENIED
          errorMessage = 'Location permission denied. Please enable location permissions in app settings.';
        } else if (error.code === 2) {
          // POSITION_UNAVAILABLE
          errorMessage = 'Location unavailable. Please check:\n1. GPS is enabled\n2. You are not in a GPS-blocking area\n3. Try moving to an open area';
        } else if (error.code === 3) {
          // TIMEOUT
          errorMessage = 'Location request timed out.\n\nPlease:\n1. Ensure GPS/Location is enabled in device settings\n2. Move to an area with better GPS signal (outdoors)\n3. Wait a moment for GPS to initialize\n4. Try again';
        }

        Alert.alert('Location Error', errorMessage);
      },
      {
        enableHighAccuracy: true,  // Use GPS for accurate location
        timeout: 30000,  // 30 seconds timeout (GPS needs more time)
        maximumAge: 10000,  // Accept cached position up to 10 seconds old
      }
    );

    // Fallback timeout in case getCurrentPosition doesn't trigger error callback
    timeoutId = setTimeout(() => {
      console.log("Manual timeout triggered");
      setIsLoadingLocation(false);
      Alert.alert(
        'Location Timeout',
        'Location request took too long.\n\nTips:\n1. Make sure GPS is enabled in device settings\n2. Move to an open area (outdoors) for better GPS signal\n3. First GPS fix can take 30-60 seconds\n4. Try again or enter location manually'
      );
    }, 35000); // 35 second fallback timeout
  };
    

    const handleLocation = async () => {
        console.log("Platform: ", Platform.OS);
        if (Platform.OS === "android") {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'We need access to your location provide better result for matches, tournament etc.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          console.log("Granted: ", granted);
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getCurrentCoordinates(); // This now handles both getting location AND updating server
            return true;
          } else {
            Alert.alert(
              'Location Permission Denied',
              'You can still manually enter your city, state, and country.'
            );
            return false;
          }
        } else if (Platform.OS === "ios") {
          // For iOS, request permission through Geolocation
          getCurrentCoordinates();
        }
      };


  return (
    <View style={tailwind`flex-1 bg-gray-50`}>
        <View>
            <Animated.View style={[
                animatedSportAndFilter,
                {   position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    backgroundColor: "white",
                    paddingBottom: 10,
                    elevation: 6,
                },
            ]}>
            {/* Sports selector */}
                <View style={tailwind`flex-row mt-[2%] items-center`}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ref={scrollViewRef}
                        contentContainerStyle={tailwind`flex-row px-2`}
                    >
                        {games && 
                        games?.map((item, index) => (
                            <Pressable
                            key={index}
                            style={[
                                tailwind`px-4 py-2 rounded-full mr-2 shadow-md`,
                                selectedSport.id === item.id ? tailwind`bg-orange-500` : tailwind`bg-gray-200`,
                            ]}
                            onPress={() => handleSport(item)}
                            >
                            <Text
                                style={[
                                tailwind`font-semibold`,
                                selectedSport === item ? tailwind`text-white` : tailwind`text-gray-700`,
                                ]}
                            >
                                {item.name}
                            </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                    <Pressable onPress={scrollRight} style={tailwind`justify-center ml-2`}>
                        <MaterialIcons name="keyboard-arrow-right" size={30} color="black" />
                    </Pressable>
                </View>

                {/* Filter section */}
                <View style={tailwind`flex-row mt-6 items-center px-1`}>
                    <Text style={tailwind`text-lg font-bold mr-3`}>Filters:</Text>
                    <Pressable
                        style={tailwind`px-4 py-2 rounded-full bg-blue-500 mr-2`}
                        onPress={() => setTypeFilterModal(true)}
                    >
                        <Text style={tailwind`text-white`}>Categories</Text>
                    </Pressable>
                    <Pressable
                        style={tailwind`px-4 py-2 rounded-full bg-blue-500`}
                        onPress={() => setStatusFilterModal(true)}
                    >
                        <Text style={tailwind`text-white`}>Status</Text>
                    </Pressable>
                </View>

                {/* Active filter chips */}
                {(typeFilter !== 'all' || statusFilter !== 'all') && (
                <View style={tailwind`flex-row flex-wrap mt-3 px-4`}>
                    {typeFilter !== 'all' && (
                        <View style={tailwind`flex-row items-center bg-orange-100 px-3 py-1 rounded-full mr-2 mb-2`}>
                            <Text style={tailwind`text-orange-600 mr-2`}>{typeFilter}</Text>
                            <Pressable onPress={() => setTypeFilter('all')}>
                            <FontAwesome name="close" size={14} color="black" />
                            </Pressable>
                        </View>
                    )}
                    {statusFilter !== 'all' && (
                        <View style={tailwind`flex-row items-center bg-green-100 px-3 py-1 rounded-full mr-2 mb-2`}>
                            <Text style={tailwind`text-green-600 mr-2`}>{statusFilter}</Text>
                            <Pressable onPress={() => setStatusFilter('all')}>
                            <FontAwesome name="close" size={14} color="black" />
                            </Pressable>
                        </View>
                    )}
                </View>
                )}
            </Animated.View>
        </View>
        <Animated.FlatList 
            data={filterTournaments}
            keyExtractor={(item, index) => item.public_id ? item.public_id.toString() : index.toString()}
            renderItem={renderFilterTournament}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingTop: 120, // push down so content starts below header
              paddingBottom: 50,
            }}

        />

      {/* Floating Action Button */}
      <View style={tailwind`absolute bottom-10 right-6`}>
        <Pressable
          style={tailwind`p-4 bg-red-400 rounded-full shadow-xl mb-[4%]`}
          onPress={() => navigation.navigate('CreateTournament')}
        >
          <MaterialIcons name="add" size={28} color="white" />
        </Pressable>
      </View>

      {/* Type Filter Modal */}
      <Modal transparent={true} animationType="fade" visible={typeFilterModal} onRequestClose={() => setTypeFilterModal(false)}>
        <Pressable
          onPress={() => setTypeFilterModal(false)}
          style={tailwind`flex-1 justify-center items-center bg-black bg-opacity-50`}
        >
          <View style={tailwind`bg-white rounded-2xl p-6 w-3/4`}>
            <Text style={tailwind`text-lg font-bold text-gray-800 mb-4 text-center`}>Select Category</Text>
            {['international', 'country', 'nearby'].map((val) => (
              <Pressable
                key={val}
                style={tailwind`p-4 bg-gray-100 rounded-lg mb-3`}
                onPress={() => {
                  setTypeFilter(val);
                  setTypeFilterModal(false);
                  if (val === 'country') {
                    setIsCountryPicker(true)
                  } else if(val === 'nearby') {
                    handleLocation()
                  };
                }}
              >
                <Text style={tailwind`text-lg text-gray-800 capitalize`}>{val}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Status Filter Modal */}
      <Modal transparent={true} animationType="fade" visible={statusFilterModal} onRequestClose={() => setStatusFilterModal(false)}>
        <Pressable
          onPress={() => setStatusFilterModal(false)}
          style={tailwind`flex-1 justify-center items-center bg-black bg-opacity-50`}
        >
          <View style={tailwind`bg-white rounded-2xl p-6 w-3/4`}>
            <Text style={tailwind`text-lg font-bold text-gray-800 mb-4 text-center`}>Select Status</Text>
            {[
              { label: 'All', value: 'all' },
              { label: 'Upcoming', value: 'not_started' },
              { label: 'Live', value: 'live' },
            ].map((opt) => (
              <Pressable
                key={opt.value}
                style={tailwind`p-4 bg-gray-100 rounded-lg mb-3`}
                onPress={() => {
                  setStatusFilter(opt.value);
                  setStatusFilterModal(false);
                }}
              >
                <Text style={tailwind`text-lg text-gray-800`}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Country Picker */}
      {isCountryPicker && (
        <CountryPicker
          withFilter
          withFlag
          withCountryNameButton
          withAlphaFilter
          withCallingCode
          withEmoji
          onSelect={(selectedCountry) => {
            setTypeFilter(selectedCountry.name);
            setIsCountryPicker(false);
            setIsDropDown(false);
          }}
          visible={isCountryPicker}
          onClose={() => {
            setIsCountryPicker(false);
          }}
        />
      )}
    </View>
  );
};

export default Tournament;