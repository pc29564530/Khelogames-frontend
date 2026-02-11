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
import { validateTournamentField } from '../utils/validation/tournamentValidation';

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
  const [error, setError] = useState({
    global: null,   // screen-level errors
    fields: {},     // validation errors
  });
  const dispatch = useDispatch();
  const tournaments = useSelector((state) => state.tournamentsReducers.tournaments);
  const [filterTournaments, setFilterTournaments] = useState(tournaments?.tournaments || []);
  const [isDropDown, setIsDropDown] = useState(false);
  const [loading, setLoading] = useState(false);
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
        const response = await sportsServices({ axiosInstance });
        const item = response.data;
        dispatch(setGames(item));
      } catch (err) {
        console.log("Unable to get sports: ", err)
        logSilentError(err);
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
      try {
        setLoading(true);
        setError({ global: null, fields: {} });

        const response = await getTournamentBySport({ axiosInstance, game });
        const item = response.data;
        if(response.success && item.tournament.length === 0){
          //First to add new tournament
        }
        dispatch(getTournamentBySportAction(item.tournament));
      } catch(err) {
        logSilentError(err);

        // only set global error if no data exists
        if (!tournaments || tournaments.length === 0) {
          setError({
            global: 'Unable to load tournaments',
            fields: {},
          });
        }
      } finally {
        setLoading(false);
      }
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

        const formData = {
          city: cityName,
          state: stateName,
          country: countryName,
        }
        const validation = validateTournamentField(formData);
        if(!validation.isValid) {
          setError({
            global: null,
            fields: validation.errors,
          });
          return
        }

        const params = {
          city: cityName,
          state: stateName,
          country: countryName
        };

        console.log("Fetching tournaments by location:", params);

        const res = await axiosInstance.get(`${BASE_URL}/${game.name}/get-tournament-by-location`, {
          params: params,
        });

        console.log(" Nearby tournaments fetched:", res.data);
        dispatch(getTournamentBySportAction(res.data.tournament));
      } catch (err) {
        logSilentError(err);

        setError({
          global: 'Unable to fetch nearby tournaments',
          fields: {},
        });
        console.error(" Failed to fetch tournament by location:", err.response?.data || err.message);
      }
    };


  const renderFilterTournament = ({item}) => {
    // Format date from timestamp
        const startDate = item.start_timestamp
        ? new Date(item.start_timestamp * 1000).toLocaleDateString()
        : "TBD";

        // Status indicator
        const isLive = item.status === "live";
        const isFinished = item.status === "finished";

        return (
            <Pressable
                style={[tailwind`bg-white mx-4 mb-3 rounded-2xl overflow-hidden`, {shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2}]}
                onPress={() => handleTournamentPage(item)}
            >
                {/* Top accent line for live matches */}
                {isLive && <View style={tailwind`h-0.5 bg-red-400`} />}

                <View style={tailwind`p-4`}>
                    <View style={tailwind`flex-row items-center`}>
                        {/* Trophy icon in circle */}
                        <View style={tailwind`w-12 h-12 rounded-full bg-gray-50 items-center justify-center mr-3`}>
                            <FontAwesome name="trophy" size={20} color={isLive ? "#f87171" : "#9CA3AF"} />
                        </View>

                        {/* Main Info */}
                        <View style={tailwind`flex-1`}>
                            <Text style={tailwind`text-base font-bold text-gray-900`} numberOfLines={1}>
                                {item.name}
                            </Text>
                            <View style={tailwind`flex-row items-center mt-0.5`}>
                                {item.season && (
                                    <Text style={tailwind`text-xs text-gray-400 mr-2`}>
                                        Season {item.season}
                                    </Text>
                                )}
                                {/* {item.country && (
                                    <>
                                        <Text style={tailwind`text-gray-300 text-xs`}>&middot;</Text>
                                        <Text style={tailwind`text-xs text-gray-400 ml-2`}>
                                            {item.country}
                                        </Text>
                                    </>
                                )} */}
                            </View>
                        </View>

                        {/* Status + Date right aligned */}
                        <View style={tailwind`items-end ml-2`}>
                            <View style={tailwind`flex-row items-center`}>
                                {isLive && <View style={tailwind`w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5`} />}
                                <Text style={[
                                    tailwind`text-xs font-semibold capitalize`,
                                    isLive ? tailwind`text-red-400` : tailwind`text-gray-400`
                                ]}>
                                    {item.status === "not_started" ? "Upcoming" : item.status || "Upcoming"}
                                </Text>
                            </View>
                            <Text style={tailwind`text-xs text-gray-400 mt-1 font-semibold`}>
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
                <View style={tailwind`flex-row mt-1 items-center border-b border-gray-100`}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ref={scrollViewRef}
                        contentContainerStyle={tailwind`flex-row px-4`}
                    >
                        {games?.length > 0 ? (
                            games.map((item, index) => (
                                <Pressable
                                key={index}
                                style={[
                                    tailwind`px-4 py-3 mr-1`,
                                    selectedSport.id === item.id && {borderBottomWidth: 2, borderBottomColor: '#f87171'},
                                ]}
                                onPress={() => handleSport(item)}
                                >
                                <Text
                                    style={[
                                    tailwind`text-sm`,
                                    selectedSport.id === item.id ? tailwind`text-gray-900 font-bold` : tailwind`text-gray-400 font-medium`,
                                    ]}
                                >
                                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                                </Text>
                                </Pressable>
                            ))
                        ) : (
                            <View style={tailwind`px-4 py-3`}>
                                <Text style={tailwind`text-gray-400 text-sm`}>Loading...</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Filter row - subtle outline buttons like Airbnb */}
                <View style={tailwind`flex-row mt-3 items-center px-4`}>
                    <Pressable
                        style={[
                            tailwind`flex-row items-center px-3.5 py-2 rounded-lg border mr-2`,
                            typeFilter !== 'all' ? tailwind`border-red-400 bg-red-400` : tailwind`border-gray-200 bg-white`
                        ]}
                        onPress={() => setTypeFilterModal(true)}
                    >
                        <MaterialIcons name="filter-list" size={16} color={typeFilter !== 'all' ? "white" : "#9CA3AF"} />
                        <Text style={[
                            tailwind`text-sm ml-1.5`,
                            typeFilter !== 'all' ? tailwind`text-white font-medium` : tailwind`text-gray-500`
                        ]}>{typeFilter !== 'all' ? typeFilter : 'Category'}</Text>
                        {typeFilter !== 'all' && (
                            <Pressable onPress={() => setTypeFilter('all')} hitSlop={10} style={tailwind`ml-2`}>
                                <MaterialIcons name="close" size={14} color="white" />
                            </Pressable>
                        )}
                    </Pressable>
                    <Pressable
                        style={[
                            tailwind`flex-row items-center px-3.5 py-2 rounded-lg border`,
                            statusFilter !== 'all' ? tailwind`border-red-400 bg-red-400` : tailwind`border-gray-200 bg-white`
                        ]}
                        onPress={() => setStatusFilterModal(true)}
                    >
                        <MaterialIcons name="schedule" size={16} color={statusFilter !== 'all' ? "white" : "#9CA3AF"} />
                        <Text style={[
                            tailwind`text-sm ml-1.5`,
                            statusFilter !== 'all' ? tailwind`text-white font-medium` : tailwind`text-gray-500`
                        ]}>{statusFilter !== 'all' ? statusFilter : 'Status'}</Text>
                        {statusFilter !== 'all' && (
                            <Pressable onPress={() => setStatusFilter('all')} hitSlop={10} style={tailwind`ml-2`}>
                                <MaterialIcons name="close" size={14} color="white" />
                            </Pressable>
                        )}
                    </Pressable>
                </View>
            </Animated.View>
        </View>

        {/* Inline Error Display */}
        {!loading && error.global && (
          <View style={tailwind`mx-4 mt-28 p-4 bg-white rounded-2xl items-center`}>
            <MaterialIcons name="wifi-off" size={32} color="#D1D5DB" />
            <Text style={tailwind`text-gray-900 font-semibold text-sm mt-3 mb-1`}>
              Connection issue
            </Text>
            <Text style={tailwind`text-gray-400 text-xs text-center mb-4`}>
              {error.global}
            </Text>
            <Pressable
              onPress={() => dispatch(setGame(game))}
              style={tailwind`px-6 py-2.5 bg-red-400 rounded-full`}
            >
              <Text style={tailwind`text-white text-sm font-semibold`}>Try Again</Text>
            </Pressable>
          </View>
        )}

        <Animated.FlatList
            data={filterTournaments}
            keyExtractor={(item, index) => item.public_id ? item.public_id.toString() : index.toString()}
            renderItem={renderFilterTournament}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingTop: (typeFilter !== 'all' || statusFilter !== 'all') ? 170 : 120,
              paddingBottom: 50,
            }}

        />

      {/* Floating Action Button */}
      <View style={tailwind`absolute bottom-14 right-5`}>
        <Pressable
          style={[tailwind`p-3.5 bg-red-400 rounded-2xl`, {shadowColor: '#f87171', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6}]}
          onPress={() => navigation.navigate('CreateTournament')}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </Pressable>
      </View>

      {/* Type Filter Modal */}
      <Modal transparent={true} animationType="slide" visible={typeFilterModal} onRequestClose={() => setTypeFilterModal(false)}>
        <Pressable
          onPress={() => setTypeFilterModal(false)}
          style={tailwind`flex-1 justify-end bg-black/40`}
        >
          <View style={tailwind`bg-white rounded-t-3xl pt-2 pb-8`}>
            <View style={tailwind`w-10 h-1 bg-gray-200 rounded-full self-center mb-4`} />
            <Text style={tailwind`text-base font-bold text-gray-900 px-6 mb-3`}>Category</Text>
            {['international', 'country', 'nearby'].map((val) => (
              <Pressable
                key={val}
                style={tailwind`flex-row items-center px-6 py-4 border-b border-gray-50`}
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
                <MaterialIcons
                  name={val === 'international' ? 'public' : val === 'country' ? 'flag' : 'near-me'}
                  size={20} color="#9CA3AF" />
                <Text style={tailwind`text-base text-gray-800 ml-4 capitalize`}>{val}</Text>
                {typeFilter === val && <MaterialIcons name="check" size={20} color="#f87171" style={tailwind`ml-auto`} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Status Filter Modal */}
      <Modal transparent={true} animationType="slide" visible={statusFilterModal} onRequestClose={() => setStatusFilterModal(false)}>
        <Pressable
          onPress={() => setStatusFilterModal(false)}
          style={tailwind`flex-1 justify-end bg-black/40`}
        >
          <View style={tailwind`bg-white rounded-t-3xl pt-2 pb-8`}>
            <View style={tailwind`w-10 h-1 bg-gray-200 rounded-full self-center mb-4`} />
            <Text style={tailwind`text-base font-bold text-gray-900 px-6 mb-3`}>Status</Text>
            {[
              { label: 'All', value: 'all', icon: 'list' },
              { label: 'Upcoming', value: 'not_started', icon: 'schedule' },
              { label: 'Live', value: 'live', icon: 'fiber-manual-record' },
            ].map((opt) => (
              <Pressable
                key={opt.value}
                style={tailwind`flex-row items-center px-6 py-4 border-b border-gray-50`}
                onPress={() => {
                  setStatusFilter(opt.value);
                  setStatusFilterModal(false);
                }}
              >
                <MaterialIcons name={opt.icon} size={20} color={opt.value === 'live' ? '#f87171' : '#9CA3AF'} />
                <Text style={tailwind`text-base text-gray-800 ml-4`}>{opt.label}</Text>
                {statusFilter === opt.value && <MaterialIcons name="check" size={20} color="#f87171" style={tailwind`ml-auto`} />}
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