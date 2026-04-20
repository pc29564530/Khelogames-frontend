import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions, Image, FlatList, ActivityIndicator } from 'react-native';
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming
} from "react-native-reanimated";

const Club = () => {
    const navigation = useNavigation();
    const scrollViewRef = useRef(null);
    
    const [currentRole, setCurrentRole] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [error, setError] = useState({global: null, fields:{}});
    const [loading, setLoading] = useState(false);
    const [selectedSport, setSelectedSport] = useState({ id: 1, name: 'football', min_players: 11 });
    const dispatch = useDispatch();
    const games = useSelector(state => state.sportReducers.games);
    const game = useSelector(state => state.sportReducers.game);
    const teams = useSelector((state) => state.teams.teamsBySports);

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await sportsServices();
                dispatch(setGames(response.data));
            } catch (err) {
                logSilentError(err);
                console.error("Unable to fetch games data: ", err);
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
                setError({
                    global: null,
                    fields: {},
                })
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTeamsBySport/${game.id}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                const item = response.data;
                dispatch(getTeamsBySport(item.data));
            } catch (err) {
                logSilentError(err);
                setError({
                    global: 'Unable to load teams. Please try again later.',
                    fields: {},
                })
                console.error("Unable to fetch all team: ", err);
            } finally {
                setLoading(false);
            }
        }

        if (game?.name) {
            getClubData();
        }
    }, [game]);
      

    const handleAddClub = () => {
        navigation.navigate('CreateClub');
    }

    const scrollRight = () => {
        scrollViewRef.current.scrollTo({ x: 100, animated: true });
    }

    const handleClub = (item) => {
        navigation.navigate('ClubPage', { teamData: item, game: game });
    }

    const handleSport = (item) => {
        setSelectedSport(item);
        dispatch(setGame(item));
    }

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
            {/* Sports Filter Section */}
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

            {/* Teams List */}
            <FlatList
                data={teams}
                keyExtractor={(item, index) => item?.public_id ? item.public_id.toString() : index.toString()}
                renderItem={renderFilterTeams}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
            />

            {/* Floating Action Button */}
            <View style={tailwind`absolute bottom-18 right-5`}>
                <Pressable
                style={[tailwind`p-3.5 bg-red-400 rounded-2xl`, {shadowColor: '#f87171', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6}]}
                onPress={() => navigation.navigate('CreateClub')}
                >
                <MaterialIcons name="add" size={24} color="white" />
                </Pressable>
            </View>
        </View>
    );
}

export default Club;