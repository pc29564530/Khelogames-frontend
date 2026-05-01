import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import { View, Text, Pressable, Image, Modal, ScrollView, Dimensions, ActivityIndicator, useWindowDimensions } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { formattedDate, formattedTime, formatToDDMMYY, convertToISOString } from '../utils/FormattedDateTime';
import { findTournamentByID, getTournamentBySport } from '../services/tournamentServices';
import { useDispatch, useSelector } from 'react-redux';
import { getTournamentByIdAction, getTournamentBySportAction } from '../redux/actions/actions';
import { convertBallToOvers } from '../utils/ConvertBallToOvers';
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

    const { height: sHeight, width: sWidth } = useWindowDimensions();

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

    useEffect(() => {
        fetchClubMatch();
    }, []);

    const fetchClubMatch = async () => {
        try {
            setLoading(true);
            setError({ global: null, fields: {} });
            if (!teamData) return;
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
            //console.log("Selected Tournament: ", selectedTournament.name, " Filtered Matches: ", filterMatches.length);
            setMatches(filterMatches);
    };

    const handleResetFilter = () => {
        // console.log("selected tournament: ", selectedTournament)
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
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <Animated.ScrollView
                style={{ flex: 1, backgroundColor: '#0f172a' }}
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
                            style={[
                                tailwind`flex-row items-center justify-center py-3 rounded-lg`,
                                { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }
                            ]}
                            onPress={() => handleDropDown()}
                        >
                            <MaterialIcons name="filter-list" size={20} color="#94a3b8" />
                            <Text style={{ color: '#f1f5f9', fontWeight: '600', marginLeft: 8 }}>Filter by Tournament</Text>
                            <MaterialIcons name="expand-more" size={20} color="#64748b" style={tailwind`ml-1`} />
                        </Pressable>
                        {selectedTournament && (
                            <Pressable
                                style={[
                                    tailwind`flex-row items-center justify-center py-3 rounded-lg mt-2`,
                                    { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }
                                ]}
                                onPress={() => handleResetFilter()}
                            >
                                <MaterialIcons name="close" size={20} color="#94a3b8" />
                                <Text style={[tailwind`font-semibold ml-2`, { color: '#f1f5f9' }]}>{selectedTournament.name}</Text>
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

const CompactInningScore = ({ scores }) => {
    if (!scores?.length) return null;
    return (
        <View style={tailwind`items-end`}>
            {scores.map((score, index) => (
                <View key={index} style={tailwind`flex-row items-center`}>
                    <Text style={[tailwind`text-sm font-bold`, { color: '#f1f5f9' }]}>
                        {score.score}/{score.wickets}
                    </Text>
                    {score.overs !== undefined && (
                        <Text style={[tailwind`text-xs ml-1`, { color: '#94a3b8' }]}>
                            ({convertBallToOvers(score.overs)})
                        </Text>
                    )}
                </View>
            ))}
        </View>
    );
};

const matchesData = (item, ind, navigation, tournament) => {
    const handleCricketMatchPage = (item) => {
        navigation.navigate("CricketMatchPage", {matchPublicID: item.public_id, tournament: tournament});
    }

    const isLive = item?.status === "live";

    return (
        <Pressable
            key={ind}
            style={[
                tailwind`mb-3 rounded-xl overflow-hidden`,
                { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }
            ]}
            onPress={() => handleCricketMatchPage(item)}
        >
            {/* Live accent bar */}
            {isLive && <View style={tailwind`h-0.5 bg-red-400`} />}

            {/* Tournament Header */}
            <View style={[tailwind`px-4 py-2`, { backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
                <Text style={[tailwind`text-xs font-semibold`, { color: '#94a3b8' }]} numberOfLines={1}>
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
                            <View style={[tailwind`w-6 h-6 rounded-full items-center justify-center overflow-hidden`, { backgroundColor: '#334155' }]}>
                                {item?.homeTeam?.media_url ? (
                                    <Image
                                        source={{ uri: item.homeTeam.media_url }}
                                        style={tailwind`w-full h-full`}
                                    />
                                ) : (
                                    <Text style={[tailwind`font-bold text-xs`, { color: '#f87171' }]}>
                                        {item?.homeTeam?.name?.charAt(0).toUpperCase()}
                                    </Text>
                                )}
                            </View>
                            <Text style={[tailwind`font-semibold ml-3 flex-1`, { color: '#f1f5f9' }]} numberOfLines={1}>
                                {item?.homeTeam?.name}
                            </Text>
                            <CompactInningScore scores={item?.homeScore} />
                        </View>

                        {/* Away Team */}
                        <View style={tailwind`flex-row items-center`}>
                            <View style={[tailwind`w-6 h-6 rounded-full items-center justify-center overflow-hidden`, { backgroundColor: '#334155' }]}>
                                {item?.awayTeam?.media_url ? (
                                    <Image
                                        source={{ uri: item.awayTeam.media_url }}
                                        style={tailwind`w-full h-full`}
                                    />
                                ) : (
                                    <Text style={[tailwind`font-bold text-xs`, { color: '#f87171' }]}>
                                        {item?.awayTeam?.name?.charAt(0).toUpperCase()}
                                    </Text>
                                )}
                            </View>
                            <Text style={[tailwind`font-semibold ml-3 flex-1`, { color: '#f1f5f9' }]} numberOfLines={1}>
                                {item?.awayTeam?.name}
                            </Text>
                            <CompactInningScore scores={item?.awayScore} />
                        </View>
                    </View>

                    {/* Vertical divider */}
                    <View style={[tailwind`w-px my-3 ml-3`, { backgroundColor: '#334155' }]} />

                    {/* Match Info */}
                    <View style={tailwind`items-end ml-4`}>
                        <Text style={[tailwind`text-xs font-semibold mb-1`, { color: '#64748b' }]}>
                            {formatToDDMMYY(convertToISOString(item?.start_timestamp))}
                        </Text>
                        {item?.status !== "not_started" ? (
                            <View style={[tailwind`px-2 py-1 rounded`, { backgroundColor: isLive ? '#f8717120' : '#334155' }]}>
                                <Text style={[tailwind`text-xs font-semibold capitalize`, { color: isLive ? '#f87171' : '#cbd5e1' }]}>
                                    {item?.status_code || item?.status}
                                </Text>
                            </View>
                        ) : (
                            <Text style={[tailwind`text-xs`, { color: '#cbd5e1' }]}>
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
