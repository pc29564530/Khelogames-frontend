import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import { View, Text, Pressable, Image, Modal, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { formattedDate, formattedTime, formatToDDMMYY, convertToISOString } from '../utils/FormattedDateTime';
import { findTournamentByID, getTournamentBySport } from '../services/tournamentServices';
import { useDispatch, useSelector } from 'react-redux';
import { getTournamentByIdAction, getTournamentBySportAction } from '../redux/actions/actions';
import { renderInningScore } from '../screen/Matches';
import Animated, {useSharedValue, useAnimatedScrollHandler} from 'react-native-reanimated';
import { logSilentError } from '../utils/errorHandler';

const ClubCricketMatch = ({ teamData, parentScrollY, headerHeight, collapsedHeader }) => {
    const [matches, setMatches] = useState([]);
    const [isDropDownVisible, setIsDropDownVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({ global: null, fields: {} });
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [allMatches, setAllMatches] = useState([]);
    const [currentRole, setCurrentRole] = useState('');
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const tournaments = useSelector((state) => state.tournamentsReducers.tournaments);
    const tournament = useSelector((state) => state.tournamentsReducers.tournament);
    const game = useSelector((state) => state.sportReducers.game);

    const { height: sHeight, width: sWidth } = Dimensions.get("window");

    const currentScrollY = useSharedValue(0);
    const handlerScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            if(parentScrollY === collapsedHeader){
                parentScrollY.value = currentScrollY.value;
            } else {
                parentScrollY.value = event.contentOffset.y;
            }
        }
    })

    const checkSportForMatchPage = (item, game) => {
        if (game.name==='football'){
            navigation.navigate("FootballMatchPage",{item: item.id} )
        } else if(game.name === 'cricket') {
            navigation.navigate("CricketMatchPage", {item: item.id})
        }
    }

    useEffect(() => {
        fetchClubMatch();
    }, []);

    const fetchClubMatch = async () => {
        try {
            setLoading(true);
            setError({ global: null, fields: {} });

            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getMatchesByTeam/${teamData.public_id}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.data.data) {
                setMatches([]);
            } else {
                setMatches(response.data.data);
                setAllMatches(response.data.data);
            }
        } catch (err) {
            logSilentError(err);
            setError({
                global: 'Unable to load matches. Please try again.',
                fields: {},
            });
            console.log("unable to get the match by teams ", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDropDown = () => {
        setIsDropDownVisible(true);
    };

    const handleTournamentNavigate = async (tournamentItem) => {
            const filterMatches = matches.filter((item) => item.tournament.public_id === selectedTournament.public_id);
            console.log("Selected Tournament: ", selectedTournament.name, " Filtered Matches: ", filterMatches.length);
            setMatches(filterMatches);
    };

    const handleResetFilter = () => {
        console.log("selected tournament: ", selectedTournament)
        setMatches(allMatches);
        setSelectedTournament(null);
    }

    let tournamentsPublicID = new Set();
    matches.map((item) => {
        tournamentsPublicID.add(item.tournament.public_id);
    })

    const renderEmptyState = () => {
        if (loading) {
            return (
                <View style={tailwind`flex-1 items-center justify-center py-20`}>
                    <ActivityIndicator size="large" color="#f87171" />
                    <Text style={tailwind`text-gray-500 mt-4 text-base`}>Loading matches...</Text>
                </View>
            );
        }

        if (error?.global) {
            return (
                <View style={tailwind`flex-1 items-center justify-center px-6 py-20`}>
                    <MaterialIcons name="error-outline" size={64} color="#9ca3af" />
                    <Text style={tailwind`text-gray-700 text-lg font-semibold mt-4 text-center`}>
                        Oops! Something went wrong
                    </Text>
                    <Text style={tailwind`text-gray-500 text-sm mt-2 text-center`}>
                        {error.global}
                    </Text>
                </View>
            );
        }

        return (
            <View style={tailwind`flex-1 items-center justify-center px-6 py-20`}>
                <MaterialIcons name="sports-cricket" size={64} color="#9ca3af" />
                <Text style={tailwind`text-gray-700 text-lg font-semibold mt-4 text-center`}>
                    No Matches Yet
                </Text>
                <Text style={tailwind`text-gray-500 text-sm mt-2 text-center`}>
                    Matches will appear here once scheduled
                </Text>
            </View>
        );
    };

    return (
        <View style={tailwind`flex-1 bg-white`}>
            <Animated.ScrollView
                style={tailwind`flex-1 bg-gray-50`}
                onScroll={handlerScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: 12,
                    paddingBottom: 100,
                    minHeight: sHeight+100,
                }}
            >
                {/* Tournament Filter Button */}
                {matches.length > 0 && (
                    <View style={tailwind`px-4 mb-3`}>
                        <Pressable
                            style={tailwind`flex-row items-center justify-center py-3 rounded-lg bg-white border border-gray-200`}
                            onPress={() => handleDropDown()}
                        >
                            <MaterialIcons name="filter-list" size={20} color="#6b7280" />
                            <Text style={tailwind`text-gray-700 font-semibold ml-2`}>Filter by Tournament</Text>
                            <MaterialIcons name="expand-more" size={20} color="#6b7280" style={tailwind`ml-1`} />
                        </Pressable>
                        {selectedTournament && (
                            <Pressable
                                style={tailwind`flex-row items-center justify-center py-3 rounded-lg bg-white border border-gray-200 mt-2`}
                                onPress={() => handleResetFilter()}
                            >
                                <MaterialIcons name="close" size={20} color="#6b7280" />
                                <Text style={tailwind`text-gray-700 font-semibold ml-2`}>{selectedTournament.name}</Text>
                            </Pressable>
                        )}
                    </View>
                )}

                {/* Matches List */}
                {loading || error?.global || matches.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <View style={tailwind`px-4`}>
                        {matches.map((item, index) =>
                            matchesData(item, index, navigation, item.tournament)
                        )}
                    </View>
                )}
            </Animated.ScrollView>

            {/* Tournament Filter Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isDropDownVisible}
                onRequestClose={() => setIsDropDownVisible(false)}
            >
                <View style={tailwind`flex-1 justify-end bg-black/50`}>
                    <Pressable
                        style={tailwind`flex-1`}
                        onPress={() => setIsDropDownVisible(false)}
                    />
                    <View style={tailwind`bg-white rounded-t-3xl`}>
                        {/* Modal Header */}
                        <View style={tailwind`flex-row items-center justify-between p-4 border-b border-gray-100`}>
                            <Text style={tailwind`text-lg font-bold text-gray-900`}>Select Tournament</Text>
                            <Pressable onPress={() => setIsDropDownVisible(false)}>
                                <MaterialIcons name="close" size={24} color="#6b7280" />
                            </Pressable>
                        </View>

                        {/* Tournament List */}
                        <ScrollView
                            style={tailwind`max-h-96`}
                            contentContainerStyle={tailwind`p-4`}
                            showsVerticalScrollIndicator={false}
                        >
                            {[...tournamentsPublicID]?.map((tournamentPublicID, index) => {
                                const tournamentItem = matches.find((item) => item.tournament.public_id === tournamentPublicID );
                                return (
                                    <Pressable
                                        key={index}
                                        style={tailwind`flex-row items-center bg-gray-50 p-4 mb-2 rounded-xl`}
                                        onPress={() => {
                                            setSelectedTournament(tournamentItem.tournament)
                                            handleTournamentNavigate(tournamentItem)
                                            setIsDropDownVisible(false);
                                        }}
                                    >
                                        <View style={tailwind`w-10 h-10 rounded-full bg-yellow-100 items-center justify-center mr-3`}>
                                            <MaterialIcons name="emoji-events" size={24} color="#f59e0b" />
                                        </View>
                                        <Text style={tailwind`text-base font-medium text-gray-800 flex-1`}>
                                            {tournamentItem?.tournament?.name}
                                        </Text>
                                        <MaterialIcons name="chevron-right" size={20} color="#9ca3af" />
                                    </Pressable>
                                )
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const matchesData = (item, ind, navigation, tournament) => {
    const handleCricketMatchPage = (item) => {
        navigation.navigate("CricketMatchPage", {matchPublicID: item.public_id, tournament: tournament});
    }

    return (
        <Pressable
            key={ind}
            style={[
                tailwind`mb-3 bg-white rounded-xl overflow-hidden`,
                {shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2}
            ]}
            onPress={() => handleCricketMatchPage(item)}
        >   

            {/* Tournament Header */}
            <View style={tailwind`bg-gray-50 px-4 py-2 border-b border-gray-100`}>
                <Text style={tailwind`text-gray-600 text-xs font-semibold`} numberOfLines={1}>
                    {item?.tournament?.name || 'Tournament'}
                </Text>
            </View>

            {/* Match Content */}
            <View style={tailwind`p-4`}>
                <View style={tailwind`flex-row items-center justify-between`}>
                    {/* Teams */}
                    <View style={tailwind`flex-1`}>
                        {/* Home Team */}
                        <View style={tailwind`flex-row items-center mb-3`}>
                            <View style={tailwind`w-6 h-6 rounded-full bg-gray-100 items-center justify-center overflow-hidden`}>
                                {item?.homeTeam?.media_url ? (
                                    <Image
                                        source={{ uri: item.homeTeam.media_url }}
                                        style={tailwind`w-full h-full`}
                                    />
                                ) : (
                                    <Text style={tailwind`text-red-400 font-bold text-md`}>
                                        {item?.homeTeam?.name?.charAt(0).toUpperCase()}
                                    </Text>
                                )}
                            </View>
                            <Text style={tailwind`text-gray-900 font-semibold ml-3 flex-1`} numberOfLines={1}>
                                {item?.homeTeam?.name}
                            </Text>
                            {item?.status !== "not_started" && item?.homeScore && (
                                <Text style={tailwind`text-gray-900 font-bold text-md ml-2`}>
                                    {item.homeScore.goals}
                                    {item.homeScore?.penalty_shootout && (
                                        <Text style={tailwind`text-gray-500 text-md`}> ({item.homeScore.penalty_shootout})</Text>
                                    )}
                                </Text>
                            )}
                        </View>

                        {/* Away Team */}
                        <View style={tailwind`flex-row items-center`}>
                            <View style={tailwind`w-6 h-6 rounded-full bg-gray-100 items-center justify-center overflow-hidden`}>
                                {item?.awayTeam?.media_url ? (
                                    <Image
                                        source={{ uri: item.awayTeam.media_url }}
                                        style={tailwind`w-full h-full`}
                                    />
                                ) : (
                                    <Text style={tailwind`text-red-400 font-bold text-md`}>
                                        {item?.awayTeam?.name?.charAt(0).toUpperCase()}
                                    </Text>
                                )}
                            </View>
                            <Text style={tailwind`text-gray-900 font-semibold ml-3 flex-1`} numberOfLines={1}>
                                {item?.awayTeam?.name}
                            </Text>
                            {item?.status !== "not_started" && item?.awayScore && (
                                <Text style={tailwind`text-gray-900 font-bold text-md ml-2`}>
                                    {item.awayScore.goals}
                                    {item.awayScore?.penalty_shootout && (
                                        <Text style={tailwind`text-gray-500 text-sm`}> ({item.awayScore.penalty_shootout})</Text>
                                    )}
                                </Text>
                            )}
                        </View>
                    </View>
                    
                    {/* Vertical divider */}
                    <View style={tailwind`w-px bg-gray-100 my-3`} />

                    {/* Match Info */}
                    <View style={tailwind`items-end ml-4`}>
                        <Text style={tailwind`text-gray-600 text-xs font-semibold mb-1`}>
                            {formatToDDMMYY(convertToISOString(item?.start_timestamp))}
                        </Text>
                        {item?.status !== "not_started" ? (
                            <View style={tailwind`px-2 py-1 rounded bg-gray-100`}>
                                <Text style={tailwind`text-xs font-semibold capitalize`}>
                                    {item?.status_code || item?.status}
                                </Text>
                            </View>
                        ) : (
                            <Text style={tailwind`text-gray-500 text-xs`}>
                                {formattedTime(convertToISOString(item?.start_timestamp))}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

export default ClubCricketMatch;
