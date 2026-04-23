import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, Text, Pressable, Image, FlatList, ActivityIndicator, TextInput, Modal } from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { useDispatch, useSelector } from 'react-redux';
import { setGames, setGame, getTeamsBySport } from '../redux/actions/actions';
import { sportsServices } from '../services/sportsServices';
import { logSilentError } from '../utils/errorHandler';
import SportSelector from '../components/SportSelector';
import { getIPBasedLocation } from '../utils/locationService';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming
} from "react-native-reanimated";
import CountryPicker from '../components/CountryPicker';

const Club = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [typeFilterModal, setTypeFilterModal] = useState(false);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [currentRole, setCurrentRole] = useState('');
    const [isCountryPicker, setIsCountryPicker] = useState(false);
    const [error, setError] = useState({global: null, fields:{}});
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const game = useSelector(state => state.sportReducers.game);
    const teams = useSelector((state) => state.teams.teamsBySports);

    const scrollY = useSharedValue(0);
    const pos = useSharedValue(0);
    const FILTER_HEIGHT = 100;

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            const currentY = event.contentOffset.y;
            if (currentY > scrollY.value + 5) {
                if (pos.value === 0) {
                    pos.value = withTiming(-FILTER_HEIGHT, { duration: 250 });
                }
            } else if (currentY < scrollY.value - 5) {
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await sportsServices();
                dispatch(setGames(response.data));
            } catch (err) {
                logSilentError(err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const roleStatus = async () => {
            const checkRole = await AsyncStorage.getItem('Role');
            setCurrentRole(checkRole);
        }
        roleStatus();
    }, []);

    useEffect(() => {
        const getClubData = async () => {
            try {
                setLoading(true);
                setError({ global: null, fields: {} });
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTeamsBySport/${game.id}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                const data = response.data.data || [];
                dispatch(getTeamsBySport(data));
                const item = data.filter((team) => team.type !== 'individual');
                setFilteredTeams(item);
                setSearchQuery('');
            } catch (err) {
                logSilentError(err);
                setError({
                    global: 'Unable to load teams. Please try again later.',
                    fields: {},
                });
            } finally {
                setLoading(false);
            }
        }

        if (game?.name) {
            getClubData();
        }
    }, [game, typeFilter]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <Text style={tailwind`text-xl font-bold text-white`}>Team</Text>
            ),
            headerStyle: {
                backgroundColor: '#1e293b',
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 0,
            },
            headerTintColor: 'white',
            headerTitleAlign: 'center',
            headerLeft: () => (
                <Pressable onPress={() => navigation.goBack()} style={tailwind`ml-4`}>
                    <AntDesign name="arrowleft" size={24} color="white" />
                </Pressable>
            ),
        });
    }, [navigation]);

    const fetchTeamByFilter = async ({cityName, stateName, countryName}) => {
        try {
            const params = { city: cityName, state: stateName, country: countryName };
            const res = await axiosInstance.get(`${BASE_URL}/${game.name}/get-team-by-location`, { params });
            const data = res.data.data.team || [];
            dispatch(getTeamsBySport(data));
            setFilteredTeams(data);
            setError({ global: null, fields: {} });
        } catch (err) {
            logSilentError(err);
            setError({
                global: 'Unable to fetch nearby teams',
                fields: {},
            });
        }
    }

    const fetchTeamByNearBy = async () => {
        try {
            const location = await getIPBasedLocation();
            await fetchTeamByFilter({
                cityName: location.city || '',
                stateName: location.state || '',
                countryName: location.country || '',
            });
        } catch {
            setError({
                global: 'Unable to detect location. Use Country filter.',
                fields: {},
            });
            setTypeFilter('all');
        }
    }

    const handleSearchTeam = useCallback((text) => {
        setSearchQuery(text);
        if (!text) {
            setFilteredTeams(teams || []);
            return;
        }
        const filtered = (teams || []).filter((team) =>
            team.name?.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredTeams(filtered);
    }, [teams]);

    const handleClub = (item) => {
        navigation.navigate('ClubPage', { teamData: item, game: game });
    }

    const renderFilterTeams = ({ item }) => {
        return (
            <Pressable
                onPress={() => handleClub(item)}
                style={[
                    tailwind`rounded-xl mb-3 p-4 flex-row items-center`,
                    { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1 }
                ]}
            >
                <View style={[tailwind`rounded-full h-14 w-14 overflow-hidden items-center justify-center`, { backgroundColor: '#334155' }]}>
                    {item.media_url ? (
                        <Image source={{ uri: item.media_url }} style={tailwind`h-full w-full`} resizeMode="cover" />
                    ) : (
                        <Text style={tailwind`text-red-400 text-2xl font-bold`}>{item?.name?.charAt(0).toUpperCase()}</Text>
                    )}
                </View>
                <View style={tailwind`flex-1 ml-4`}>
                    <Text style={{color: '#f1f5f9', fontSize: 16, fontWeight: '700'}} numberOfLines={1}>{item.name}</Text>
                    <View style={tailwind`flex-row items-center mt-1`}>
                        <MaterialIcons name="location-on" size={14} color="#64748b" />
                        <Text style={{color: '#94a3b8', fontSize: 14, marginLeft: 4}} numberOfLines={1}>
                            {item.country}
                        </Text>
                        <View style={[tailwind`h-1 w-1 rounded-full mx-2`, {backgroundColor: '#475569'}]} />
                        <Text style={{color: '#94a3b8', fontSize: 14, textTransform: 'capitalize'}}>{game.name}</Text>
                    </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#475569" />
            </Pressable>
        )
    }

    const renderEmptyState = () => {
        if (loading) {
            return (
                <View style={tailwind`flex-1 items-center justify-center py-20`}>
                    <ActivityIndicator size="large" color="#f87171" />
                    <Text style={{color: '#94a3b8', marginTop: 16, fontSize: 16}}>Loading teams...</Text>
                </View>
            );
        }

        if (error?.global) {
            return (
                <View style={tailwind`flex-1 items-center justify-center px-6 py-20`}>
                    <MaterialIcons name="error-outline" size={64} color="#475569" />
                    <Text style={{color: '#f1f5f9', fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center'}}>Oops! Something went wrong</Text>
                    <Text style={{color: '#94a3b8', fontSize: 14, marginTop: 8, textAlign: 'center'}}>{error.global}</Text>
                </View>
            );
        }

        return (
            <View style={tailwind`flex-1 items-center justify-center px-6 py-20`}>
                <MaterialIcons name="sports-soccer" size={64} color="#475569" />
                <Text style={{color: '#f1f5f9', fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center'}}>No Teams Yet</Text>
                <Text style={{color: '#94a3b8', fontSize: 14, marginTop: 8, textAlign: 'center', marginBottom: 16}}>
                    Create your first team to get started
                </Text>
                <Pressable
                    onPress={() => navigation.navigate('CreateClub')}
                    style={tailwind`bg-red-400 px-6 py-3 rounded-lg`}
                >
                    <Text style={tailwind`text-white font-semibold`}>Create Team</Text>
                </Pressable>
            </View>
        );
    };

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
              <View style={[tailwind`flex-row items-center px-4 py-3`, { gap: 8 }]}>
                <View style={[
                  tailwind`flex-1 flex-row items-center px-3 rounded-xl`,
                  { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }
                ]}>
                  <AntDesign name="search1" size={15} color="#64748b" />
                  <TextInput
                    placeholder="Search teams..."
                    placeholderTextColor="#64748b"
                    value={searchQuery}
                    onChangeText={handleSearchTeam}
                    style={{ flex: 1, color: '#f1f5f9', paddingVertical: 9, paddingHorizontal: 8, fontSize: 14 }}
                  />
                  {searchQuery.length > 0 && (
                    <Pressable onPress={() => handleSearchTeam('')}>
                      <AntDesign name="closecircle" size={14} color="#64748b" />
                    </Pressable>
                  )}
                </View>

                <Pressable
                  onPress={() => setTypeFilterModal(true)}
                  style={[
                    tailwind`flex-row items-center px-3 rounded-xl`,
                    {
                      paddingVertical: 10,
                      backgroundColor: typeFilter !== 'all' ? '#ef4444' : '#1e293b',
                      borderWidth: 1,
                      borderColor: typeFilter !== 'all' ? 'transparent' : '#334155',
                    }
                  ]}
                >
                  <MaterialIcons name="tune" size={18} color={typeFilter !== 'all' ? '#ffffff' : '#94a3b8'} />
                  {typeFilter !== 'all' && (
                    <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '600', marginLeft: 4, textTransform: 'capitalize' }}>
                      {typeFilter}
                    </Text>
                  )}
                </Pressable>
              </View>
            </Animated.View>

            <Animated.FlatList
                data={filteredTeams}
                keyExtractor={(item, index) => item?.public_id ? item.public_id.toString() : index.toString()}
                renderItem={renderFilterTeams}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            />

            <View style={tailwind`absolute bottom-18 right-5`}>
                <Pressable
                style={[tailwind`p-3.5 bg-red-400 rounded-2xl`, {shadowColor: '#f87171', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6}]}
                onPress={() => navigation.navigate('CreateClub')}
                >
                <MaterialIcons name="add" size={24} color="white" />
                </Pressable>
            </View>

            <Modal transparent={true} animationType="slide" visible={typeFilterModal} onRequestClose={() => setTypeFilterModal(false)}>
                <Pressable
                onPress={() => setTypeFilterModal(false)}
                style={tailwind`flex-1 justify-end bg-black/60`}
                >
                <View style={[tailwind`rounded-t-3xl pt-2 pb-8`, {backgroundColor: '#1e293b', borderTopWidth: 1, borderColor: '#334155'}]}>
                    <View style={[tailwind`w-10 h-1 rounded-full self-center mb-4`, {backgroundColor: '#475569'}]} />
                    <Text style={{color: '#f1f5f9', fontSize: 16, fontWeight: '700', paddingHorizontal: 24, marginBottom: 12}}>Category</Text>
                    {['all', 'international', 'country', 'nearby'].map((val) => (
                    <Pressable
                        key={val}
                        style={[tailwind`flex-row items-center px-6 py-4`, {borderBottomWidth: 1, borderColor: '#334155'}]}
                        onPress={() => {
                            setTypeFilterModal(false);
                            setTypeFilter(val);
                            setIsCountryPicker(false);
                            if (val === 'nearby') {
                                fetchTeamByNearBy();
                            } else if (val === 'country') {
                                setIsCountryPicker(true);
                            }
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

            {isCountryPicker && (
                <CountryPicker
                    visible={isCountryPicker}
                    onClose={() => setIsCountryPicker(false)}
                    onSelectCountry={(country) => {
                        fetchTeamByFilter({
                            cityName: '',
                            stateName: '',
                            countryName: country.name,
                        });
                    }}
                />
            )}
        </View>
    );
}

export default Club;
