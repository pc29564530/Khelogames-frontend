import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, FlatList, Dimensions, ActivityIndicator} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import tailwind from 'twrnc';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { useSelector } from 'react-redux';
import TournamentPlayerStatsModal from '../components/modals/cricket/TournamentStats';
import TournamentPlayerStatsRow from '../components/TournamentPlayerStatsRow';
import Animated, {useSharedValue, useAnimatedScrollHandler} from 'react-native-reanimated';

const TournamentCricketStats = ({tournament, currentRole, parentScrollY, headerHeight, collapsedHeader}) => {
    const [selectedTab, setSelectedTab] = useState('batting');

    // Batting stats
    const [mostRuns, setMostRuns] = useState(null);
    const [highestRuns, setHighestRuns] = useState(null);
    const [mostSixes, setMostSixes] = useState(null);
    const [mostFours, setMostFours] = useState(null);
    const [mostFifties, setMostFifties] = useState(null);
    const [mostHundreds, setMostHundreds] = useState(null);
    const [battingAverage, setBattingAverage] = useState(null);
    const [battingStrike, setBattingStrike] = useState(null);

    // Bowling stats
    const [mostWickets, setMostWickets] = useState(null);
    const [bowlingAverage, setBowlingAverage] = useState(null);
    const [bowlingStrike, setBowlingStrike] = useState(null);
    const [bowlingEconomy, setBowlingEconomy] = useState(null);
    const [fiveWicketsHaul, setFiveWicketsHaul] = useState(null);

    // UI states
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [modalTitle, setModalTitle] = useState('');
    const [modalType, setModalType] = useState('');
    const [error, setError] = useState({
        global: null,
        fields: {},
    });

    const game = useSelector(state => state.sportReducers.game);
    const {height: sHeight} = Dimensions.get("window");

    const currentScrollY = useSharedValue(0);
    const handlerScroll = useAnimatedScrollHandler({
        onScroll:(event) => {
            if(parentScrollY.value === collapsedHeader){
                parentScrollY.value = currentScrollY.value
            } else {
                parentScrollY.value = event.contentOffset.y
            }
        }
    });

    useEffect(() => {
        fetchAllStats();
    }, []);

    const fetchAllStats = async () => {
        setLoading(true);
        await Promise.all([
            // Batting
            fetchMostRunsByPlayer(),
            fetchHighestRunsByPlayer(),
            fetchMostSixes(),
            fetchMostFours(),
            fetchMostFifties(),
            fetchMostHundreds(),
            fetchBattingAverage(),
            fetchBattingStrike(),
            // Bowling
            fetchBowlingWickets(),
            fetchBowlingEconomy(),
            fetchBowlingAverage(),
            fetchBowlingStrike(),
            fetchBowlingFiveWicketHaul()
        ]);
        setLoading(false);
    };

    const fetchStat = async (endpoint, setter, statName) => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/${endpoint}/${tournament.public_id}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'content-type': 'application/json'
                }
            });
            // Handle both response.data and response.data.data formats
            const data = response.data?.data || response.data || [];
            setter(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(`Failed to fetch ${statName}:`, err);
            setter([]);
        }
    };

    const fetchMostRunsByPlayer = () => fetchStat('getCricketTournamentMostRuns', setMostRuns, 'most runs');
    const fetchHighestRunsByPlayer = () => fetchStat('getCricketTournamentHighestRuns', setHighestRuns, 'highest runs');
    const fetchMostSixes = () => fetchStat('getCricketTournamentMostSixes', setMostSixes, 'most sixes');
    const fetchMostFours = () => fetchStat('getCricketTournamentMostFours', setMostFours, 'most fours');
    const fetchMostFifties = () => fetchStat('getCricketTournamentMostFifties', setMostFifties, 'most fifties');
    const fetchMostHundreds = () => fetchStat('getCricketTournamentMostHundreds', setMostHundreds, 'most hundreds');
    const fetchBattingAverage = () => fetchStat('getCricketTournamentBattingAverage', setBattingAverage, 'batting average');
    const fetchBattingStrike = () => fetchStat('getCricketTournamentBattingStrike', setBattingStrike, 'batting strike');
    const fetchBowlingWickets = () => fetchStat('getCricketTournamentMostWickets', setMostWickets, 'most wickets');
    const fetchBowlingEconomy = () => fetchStat('getCricketTournamentBowlingEconomy', setBowlingEconomy, 'bowling economy');
    const fetchBowlingAverage = () => fetchStat('getCricketTournamentBowlingAverage', setBowlingAverage, 'bowling average');
    const fetchBowlingStrike = () => fetchStat('getCricketTournamentBowlingStrike', setBowlingStrike, 'bowling strike');
    const fetchBowlingFiveWicketHaul = () => fetchStat('getCricketTournamentFiveWicketsHaul', setFiveWicketsHaul, 'five wickets haul');

    // Helper to render stat card
    const renderStatCard = (title, data, type) => {
        const topPlayers = data?.slice(0, 1) || [];

        return (
            <View style={tailwind`bg-white rounded-xl shadow-sm p-4 mb-3 mx-4`}>
                <View style={tailwind`flex-row justify-between items-center mb-3`}>
                    <View style={tailwind`flex-row items-center`}>
                        <Text style={tailwind`text-lg font-bold text-gray-900`}>
                            {title}
                        </Text>
                    </View>
                    {data && data.length > 0 && (
                        <Pressable
                            onPress={() => {
                                setModalData(data);
                                setModalTitle(title);
                                setModalType(type);
                                setModalVisible(true);
                            }}
                            style={tailwind`bg-gray-100 rounded-full px-3 py-2 flex-row items-center`}
                        >
                            <Text style={tailwind`text-gray-700 text-xs font-semibold mr-1`}>
                                View All
                            </Text>
                            <AntDesign name="right" size={12} color="#374151" />
                        </Pressable>
                    )}
                </View>

                {loading ? (
                    <View style={tailwind`py-8 items-center`}>
                        <ActivityIndicator size="small" color="#EF4444" />
                    </View>
                ) : !data || data.length === 0 ? (
                    <View style={tailwind`py-8 items-center`}>
                        <Text style={tailwind`text-gray-400 text-sm`}>No data available</Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={topPlayers}
                            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                            renderItem={({item, index}) => (
                                <TournamentPlayerStatsRow
                                    player={item}
                                    type={type}
                                    rank={index + 1}
                                />
                            )}
                            scrollEnabled={false}
                        />
                    </>
                )}
            </View>
        );
    };

    return (
        <View style={tailwind`flex-1`}>
            {error.global && (
                <View style={tailwind`mx-4 mt-3 mb-3 p-3 bg-red-50 border border-red-200 rounded-lg`}>
                    <Text style={tailwind`text-red-700 text-sm`}>
                        {error?.global}
                    </Text>
                </View>
            )}

            {/* Tab Buttons */}
            <View style={tailwind`flex-row justify-around mb-4 px-4 pt-4`}>
                {['batting', 'bowling'].map(tab => (
                    <Pressable
                        key={tab}
                        onPress={() => setSelectedTab(tab)}
                        style={tailwind`flex-1 mx-1 px-5 py-3 rounded-xl ${
                            selectedTab === tab
                                ? 'bg-red-500'
                                : 'bg-white border border-gray-200'
                        }`}>
                        <Text
                            style={tailwind`text-center font-semibold ${
                                selectedTab === tab
                                    ? 'text-white'
                                    : 'text-gray-700'
                            }`}>
                            {tab.toUpperCase()}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <Animated.ScrollView
                onScroll={handlerScroll}
                scrollEventThrottle={16}
                style={tailwind`flex-1`}
                contentContainerStyle={{paddingTop: 8, paddingBottom: 100, minHeight: sHeight + 100}}
                showsVerticalScrollIndicator={false}
            >
                {loading && !mostRuns && !mostWickets ? (
                    <View style={tailwind`py-20 items-center`}>
                        <ActivityIndicator size="large" color="#EF4444" />
                        <Text style={tailwind`text-gray-500 mt-3`}>Loading stats...</Text>
                    </View>
                ) : (
                    <>
                        {selectedTab === "batting" && (
                            <>
                                {renderStatCard("Most Runs", mostRuns, "mostRuns")}
                                {renderStatCard("Highest Score", highestRuns, "highestRuns")}
                                {renderStatCard("Most Sixes", mostSixes, "mostSixes")}
                                {renderStatCard("Most Fours", mostFours, "mostFours", "")}
                                {renderStatCard("Batting Average", battingAverage, "battingAverage")}
                                {renderStatCard("Strike Rate", battingStrike, "battingStrike")}
                                {renderStatCard("Most Fifties", mostFifties, "mostFifties")}
                                {renderStatCard("Most Hundreds", mostHundreds, "mostHundreds")}
                            </>
                        )}

                        {selectedTab === "bowling" && (
                            <>
                                {renderStatCard("Most Wickets", mostWickets, "mostWickets")}
                                {renderStatCard("Best Economy", bowlingEconomy, "bowlingEconomy")}
                                {renderStatCard("Best Average", bowlingAverage, "bowlingAverage")}
                                {renderStatCard("Best Strike Rate", bowlingStrike, "bowlingStrike")}
                                {renderStatCard("5-Wicket Hauls", fiveWicketsHaul, "fiveWicketsHaul")}
                            </>
                        )}
                    </>
                )}
            </Animated.ScrollView>

            {modalVisible && (
                <TournamentPlayerStatsModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    title={modalTitle}
                    data={modalData}
                    type={modalType}
                />
            )}
        </View>
    );
};

export default TournamentCricketStats;
