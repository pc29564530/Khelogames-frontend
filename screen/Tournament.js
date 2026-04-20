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
import CountryPicker from '../components/CountryPicker';
import CityPicker from '../components/CityPicker';
import { sportsServices } from '../services/sportsServices';
import Geolocation from "@react-native-community/geolocation";
import { FilterBar } from '../components/FilterBar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming
} from "react-native-reanimated";
import { BASE_URL } from '../constants/ApiConstants';
import { validateTournamentField, validateTournamentForm } from '../utils/validation/tournamentValidation';
import { logSilentError } from '../utils/errorHandler';
import SportSelector from '../components/SportSelector';

const Tournament = () => {
  const navigation = useNavigation();
  const [currentRole, setCurrentRole] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isCountryPicker, setIsCountryPicker] = useState(false);
  const [isCityPicker, setIsCityPicker] = useState(false);
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
    const fetchData = async () => {
      try {
        const response = await sportsServices({ axiosInstance });
        dispatch(setGames(response.data));
      } catch (err) {
        console.log("Unable to get sports: ", err);
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
  }, [game, dispatch]);

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

    const fetchIPLocation = async () => {
          const location = await getIPBasedLocation();
          if (location) {
              setCity(location.city);
              setState(location.state);
              setCountry(location.country);
              await fetchTournamentByNearBy({cityName: location.city, stateName: location.state, countryName: location.country})
          }
    };

    const fetchTournamentByNearBy = async ({cityName, stateName, countryName}) => {
      try {

        const params = {
          city: cityName,
          state: stateName,
          country: countryName
        };

        console.log("Fetching tournaments by location:", params);

        const res = await axiosInstance.get(`${BASE_URL}/${game.name}/get-tournament-by-location`, {
          params: params,
        });

        console.log(" Nearby tournaments fetched:", res.data.data);
        dispatch(getTournamentBySportAction(res.data.data.tournament));
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
                style={[{backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1}, tailwind`mx-4 mb-1.5 rounded-2xl overflow-hidden mt-1.5`]}
                onPress={() => handleTournamentPage(item)}
            >
                {/* Top accent line for live matches */}
                {isLive && <View style={tailwind`h-0.5 bg-red-400`} />}

                <View style={tailwind`p-4`}>
                    <View style={tailwind`flex-row items-center`}>
                        {/* Trophy icon in circle */}
                        <View style={[tailwind`w-12 h-12 rounded-full items-center justify-center mr-3`, {backgroundColor: '#334155'}]}>
                            <FontAwesome name="trophy" size={20} color={isLive ? "#f87171" : "#94a3b8"} />
                        </View>

                        {/* Main Info */}
                        <View style={tailwind`flex-1`}>
                            <Text style={{color: '#f1f5f9', fontSize: 16, fontWeight: '700'}} numberOfLines={1}>
                                {item.name}
                            </Text>
                            <View style={tailwind`flex-row items-center mt-0.5`}>
                                {item.season && (
                                    <Text style={{color: '#94a3b8', fontSize: 12, marginRight: 8}}>
                                        Season {item.season}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Status + Date right aligned */}
                        <View style={tailwind`items-end ml-2`}>
                            <View style={tailwind`flex-row items-center`}>
                                {isLive && <View style={tailwind`w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5`} />}
                                <Text style={[
                                    tailwind`text-xs font-semibold capitalize`,
                                    isLive ? tailwind`text-red-400` : {color: '#94a3b8'}
                                ]}>
                                    {item.status === "not_started" ? "Upcoming" : item.status || "Upcoming"}
                                </Text>
                            </View>
                            <Text style={{color: '#64748b', fontSize: 12, marginTop: 4, fontWeight: '600'}}>
                                {startDate}
                            </Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        );
    }

  return (
    <View style={{flex: 1, backgroundColor: '#0f172a'}}>
            <Animated.View
              style={[
                animatedSportAndFilter,
                tailwind`shadow-lg`,
                {
                  backgroundColor: "#1e293b",
                  borderBottomColor: "#334155",
                  zIndex: 10
                }
              ]}
            >
              <SportSelector />
            </Animated.View>
            <Animated.FlatList
              data={filterTournaments}
              keyExtractor={(item, index) =>
                item.public_id ? item.public_id.toString() : index.toString()
              }
              renderItem={renderFilterTournament}
              ListHeaderComponent={
                <FilterBar
                  typeFilter={typeFilter}
                  statusFilter={statusFilter}
                  setTypeFilterModal={setTypeFilterModal}
                  setStatusFilterModal={setStatusFilterModal}
                />
              }
              ListEmptyComponent={() =>
                !loading && (
                  <View style={tailwind`flex-1 justify-center items-center py-20`}>
                    <MaterialIcons name="emoji-events" size={40} color="#475569" />

                    <Text style={{color: '#f1f5f9', fontWeight: '600', marginTop: 16}}>
                      No Tournaments Found
                    </Text>

                    <Text style={{color: '#94a3b8', marginTop: 6}}>
                      Create a new tournament.
                    </Text>
                  </View>
                )
              }
              stickyHeaderIndices={[0]}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              contentContainerStyle={{
                paddingBottom: 80
              }}
            />

        {/* Inline Error Display */}
        {!loading && error.global && (
          <View style={[tailwind`mx-4 mt-28 p-4 rounded-2xl items-center`, {backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1}]}>
            <MaterialIcons name="wifi-off" size={32} color="#64748b" />
            <Text style={{color: '#f1f5f9', fontWeight: '600', fontSize: 14, marginTop: 12, marginBottom: 4}}>
              Connection issue
            </Text>
            <Text style={{color: '#94a3b8', fontSize: 12, textAlign: 'center', marginBottom: 16}}>
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

      {/* Floating Action Button */}
      <View style={tailwind`absolute bottom-18 right-5`}>
        <Pressable
          onPress={() => navigation.navigate("CreateTournament")}
          style={[
            tailwind`p-4 rounded-lg`,
            {
              backgroundColor: "#f87171",
              elevation: 6
            }
          ]}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </Pressable>
      </View>

      {/* Type Filter Modal */}
      <Modal transparent={true} animationType="slide" visible={typeFilterModal} onRequestClose={() => setTypeFilterModal(false)}>
        <Pressable
          onPress={() => setTypeFilterModal(false)}
          style={tailwind`flex-1 justify-end bg-black/60`}
        >
          <View style={[tailwind`rounded-t-3xl pt-2 pb-8`, {backgroundColor: '#1e293b', borderTopWidth: 1, borderColor: '#334155'}]}>
            <View style={[tailwind`w-10 h-1 rounded-full self-center mb-4`, {backgroundColor: '#475569'}]} />
            <Text style={{color: '#f1f5f9', fontSize: 16, fontWeight: '700', paddingHorizontal: 24, marginBottom: 12}}>Category</Text>
            {['all', 'international', 'country', 'city', 'nearby'].map((val) => (
              <Pressable
                key={val}
                style={[tailwind`flex-row items-center px-6 py-4`, {borderBottomWidth: 1, borderColor: '#334155'}]}
                onPress={() => {
                  setTypeFilter(val);
                  setTypeFilterModal(false);
                  if (val === 'country') {
                    setIsCountryPicker(true)
                  } else if(val == 'city') {
                    setIsCityPicker(true)
                  } else if(val === 'nearby') {
                    fetchIPLocation()
                  };
                }}
              >
                <MaterialIcons
                  name={val === 'international' ? 'public' : val === 'country' ? 'flag' : 'near-me'}
                  size={20} color="#94a3b8" />
                <Text style={{color: '#cbd5e1', fontSize: 16, marginLeft: 16, textTransform: 'capitalize'}}>{val}</Text>
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
          style={tailwind`flex-1 justify-end bg-black/60`}
        >
          <View style={[tailwind`rounded-t-3xl pt-2 pb-8`, {backgroundColor: '#1e293b', borderTopWidth: 1, borderColor: '#334155'}]}>
            <View style={[tailwind`w-10 h-1 rounded-full self-center mb-4`, {backgroundColor: '#475569'}]} />
            <Text style={{color: '#f1f5f9', fontSize: 16, fontWeight: '700', paddingHorizontal: 24, marginBottom: 12}}>Status</Text>
            {[
              { label: 'All', value: 'all', icon: 'list' },
              { label: 'Upcoming', value: 'not_started', icon: 'schedule' },
              { label: 'Live', value: 'live', icon: 'fiber-manual-record' },
            ].map((opt) => (
              <Pressable
                key={opt.value}
                style={[tailwind`flex-row items-center px-6 py-4`, {borderBottomWidth: 1, borderColor: '#334155'}]}
                onPress={() => {
                  setStatusFilter(opt.value);
                  setStatusFilterModal(false);
                }}
              >
                <MaterialIcons name={opt.icon} size={20} color={opt.value === 'live' ? '#f87171' : '#94a3b8'} />
                <Text style={{color: '#cbd5e1', fontSize: 16, marginLeft: 16}}>{opt.label}</Text>
                {statusFilter === opt.value && <MaterialIcons name="check" size={20} color="#f87171" style={tailwind`ml-auto`} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
      {isCountryPicker && (
        <CountryPicker
          visible={isCountryPicker}
          onClose={() => setIsCountryPicker(false)}
          onSelectCountry={(country) => {
            setSelectedCountry(country);
            fetchTournamentByNearBy({
              cityName: '',
              stateName: '',
              countryName: country.name,
            });
          }}
        />
      )}
      {isCityPicker && (
        <CityPicker
          visible={isCityPicker}
          onClose={() => setIsCityPicker(false)}
          onSelectCity={(location) => {

            setSelectedCountry(location.country);
            setSelectedCity(location.city);

            fetchTournamentByNearBy({
              cityName: location.city,
              stateName: '',
              countryName: location.country,
            });

            setIsCityPicker(false);
          }}
        />
      )}
    </View>
  );
};

export default Tournament;