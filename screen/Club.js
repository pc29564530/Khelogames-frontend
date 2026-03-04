import React, { useState, useEffect, useRef } from 'react';
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
    }, [axiosInstance, game]);
      

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

    navigation.setOptions({
        headerTitle: () => (
            <Text style={tailwind`text-xl font-bold text-white`}>Team</Text>
        ),
        headerStyle: {
            backgroundColor: tailwind.color('red-400'),
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        },
        headerTintColor: 'white',
        headerTitleAlign: 'center',
        headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()} style={tailwind`ml-4`}>
                <AntDesign name="arrowleft" size={24} color="white" />
            </Pressable>
        ),
    });

    const renderFilterTeams = ({ item }) => {
        return (
            <Pressable
                onPress={() => handleClub(item)}
                style={[
                    tailwind`rounded-xl bg-white shadow-md mb-3 p-4 flex-row items-center`,
                    { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }
                ]}
            >
                <View style={[tailwind`rounded-full h-14 w-14 overflow-hidden items-center justify-center`, { backgroundColor: '#f3f4f6' }]}>
                    {item.media_url ? (
                        <Image source={{ uri: item.media_url }} style={tailwind`h-full w-full`} resizeMode="cover" />
                    ) : (
                        <Text style={tailwind`text-red-400 text-2xl font-bold`}>{item?.name?.charAt(0).toUpperCase()}</Text>
                    )}
                </View>
                <View style={tailwind`flex-1 ml-4`}>
                    <Text style={tailwind`text-base font-bold text-gray-800`} numberOfLines={1}>{item.name}</Text>
                    <View style={tailwind`flex-row items-center mt-1`}>
                        <MaterialIcons name="location-on" size={14} color="#9ca3af" />
                        <Text style={tailwind`text-sm text-gray-500 ml-1`} numberOfLines={1}>
                            {item.country}
                        </Text>
                        <View style={tailwind`h-1 w-1 rounded-full bg-gray-400 mx-2`} />
                        <Text style={tailwind`text-sm text-gray-500 capitalize`}>{game.name}</Text>
                    </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
            </Pressable>
        )
    }

    const renderEmptyState = () => {
        if (loading) {
            return (
                <View style={tailwind`flex-1 items-center justify-center py-20`}>
                    <ActivityIndicator size="large" color="#f87171" />
                    <Text style={tailwind`text-gray-500 mt-4 text-base`}>Loading teams...</Text>
                </View>
            );
        }

        if (error?.global) {
            return (
                <View style={tailwind`flex-1 items-center justify-center px-6 py-20`}>
                    <MaterialIcons name="error-outline" size={64} color="#9ca3af" />
                    <Text style={tailwind`text-gray-700 text-lg font-semibold mt-4 text-center`}>Oops! Something went wrong</Text>
                    <Text style={tailwind`text-gray-500 text-sm mt-2 text-center`}>{error.global}</Text>
                </View>
            );
        }

        return (
            <View style={tailwind`flex-1 items-center justify-center px-6 py-20`}>
                <MaterialIcons name="sports-soccer" size={64} color="#9ca3af" />
                <Text style={tailwind`text-gray-700 text-lg font-semibold mt-4 text-center`}>No Teams Yet</Text>
                <Text style={tailwind`text-gray-500 text-sm mt-2 text-center mb-4`}>
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
        <View style={tailwind`flex-1 bg-gray-50`}>
            {/* Sports Filter Section */}
            <View style={{ marginTop: 4 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 10 }}>
                {games.map(s => {
                  const active = game?.id === s.id;
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => handleSport(s)}
                      style={{
                        flexDirection: 'row', alignItems: 'center',
                        paddingHorizontal: 18, paddingVertical: 8,
                        borderRadius: 20, gap: 6,
                        backgroundColor: active ? '#f87171' : '#1e293b',
                        borderWidth: active ? 0 : 1,
                        borderColor: '#334155',
                      }}
                    >
                      <Text style={{
                        color: active ? '#fff' : '#94a3b8',
                        fontWeight: active ? '700' : '500',
                        fontSize: 13,
                      }}>
                        {s.name.charAt(0).toUpperCase() + s.name.slice(1)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

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
            <View style={tailwind`absolute bottom-14 right-5`}>
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