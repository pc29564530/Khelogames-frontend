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
import { getCurrentLocation } from '../utils/locationService';

const Tournament = () => {
  const navigation = useNavigation();
  const [currentRole, setCurrentRole] = useState('');
  const [typeFilter, setTypeFilter] = useState('international');
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
      // console.log("Sport Data: ", tournamentData)
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

    const fetchTournamentByNearBy = async ({cityName, stateName, countryName}) => {
      try {
        if (!cityName && !stateName && !countryName) {
          console.log("No location data available yet, skipping API call");
          return;
        }

        const params = {
          city: cityName,
          state: stateName,
          country: countryName
        };

        console.log("Fetching tournaments by location:", params);

        const authToken = await AsyncStorage.getItem("AccessToken");
        const res = await axiosInstance.get(`${BASE_URL}/${game.name}/get-tournament-by-location`, {
          params: params,  // Correct: query parameters go inside config object
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        console.log(" Nearby tournaments fetched:", res.data);
        dispatch(getTournamentBySportAction(res.data.tournament));
      } catch (err) {
        console.error(" Failed to fetch tournament by location:", err.response?.data || err.message);
      }
    };


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
      console.log("Lat: ", lat)
      console.log("Long: ", lon)
      if (!lat || !lon) {
        console.log("Skipping reverse geocode - coordinates are null");
        return;
      }

      try {
        // BigDataCloud Free API - No authentication required
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
        
        console.log("Fetching from BigDataCloud:", url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Reverse geocode result: ", data);
        
        if (data) {
          const cityName = data.city || data.locality || '';
          const stateName = data.principalSubdivision || '';
          const countryName = data.countryName || '';
          
          setCity(cityName);
          setState(stateName);
          setCountry(countryName);
          console.log("Address set: ", cityName, stateName, countryName);
          fetchTournamentByNearBy({cityName, stateName, countryName})
        }
      } catch (err) {
        console.error("BigDataCloud geocoding failed: ", err.message);
      }
    };

    // useEffect(() => {
    //   if(typeFilter === "nearby" && latitude && longitude){
    //     reverseGeoCode(latitude, longitude);
    //   }
    // }, [typeFilter, latitude, longitude])


    const getFastLocation = async () => {
      return new Promise((resolve, reject) => {
          Geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            (err) => reject(err),
            {
              enableHighAccuracy: false,
              timeout: 8000,
              maximumAge: 60000,
            }
          )
      })
    }

    const getPreciseLocation = async () => {
      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => reject(err),
          {
            enableHighAccuracy: true,
            timeout: 25000,
            maximumAge: 0,
          }
        )
      });
    }


    const getCurrentCoordinates = async () => {
      setIsLoadingLocation(true);
      console.log("Getting location (robust)...");

      const fastPos = await getFastLocation();
      const { latitude: lat, longitude: lon } = fastPos.coords;
      console.log("FAST location:", lat, lon);

      setLatitude(lat);
      setLongitude(lon);

      await AsyncStorage.setItem("UserLatitude", lat.toString());
      await AsyncStorage.setItem("UserLongitude", lon.toString());

      reverseGeoCode(lat, lon); // quick nearby tournaments

      setTimeout(async () => {
        try {
          const precisePos = await getPreciseLocation();
          const {latitude: lat, longitude: lon} = precisePos.coords;
          console.log("Precise location:", lat, lon);

          setLatitude(lat);
          setLongitude(lon);

          await AsyncStorage.setItem("UserLatitude", lat.toString());
          await AsyncStorage.setItem("UserLongitude", lon.toString());
          reverseGeoCode(lat, lon)
        } catch(err) {
          console.error("Failed to get precise location: ", err)
        }
        setIsLoadingLocation(false);
      }, 1500);
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
              paddingTop: (typeFilter !== 'all' || statusFilter !== 'all') ? 170 : 120, // push down so content starts below header
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