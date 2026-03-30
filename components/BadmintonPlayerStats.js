import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import axiosInstance from "../screen/axios_config";
import { BASE_URL } from "../constants/ApiConstants";
import tailwind from "twrnc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

const StatRow = ({ label, value }) => {
    return (
        <View style={[tailwind`flex-row justify-between items-center px-4 py-3`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
            <Text style={[tailwind`text-sm`, { color: '#94a3b8' }]}>{label}</Text>
            <Text style={[tailwind`text-sm font-bold`, { color: '#f1f5f9' }]}>{value ?? '-'}</Text>
        </View>
    )
};

const playerStatsRows = {
    matches: 'Matches Played',
    wins: 'Matches Won',
    losses: 'Matches Lost',
    sets_won: 'Sets Won',
    sets_lost: 'Sets Lost',
    current_streak: 'Current Streak',
    best_streak: 'Best Streak',
    win_percentage: 'Win Rate', 
}

const BadmintonPlayerStats = ({ player, parentScrollY, headerHeight, collapsedHeader }) => {
    const [playerStats, setPlayerStats] = useState(null);
    const [stats, setStats] = useState([]);
    const [playType, setPlayType] = useState('singles');
    const [singles, setSingles] = useState(null);
    const [doubles, setDoubles] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });

    const currentScrollY = useSharedValue(0);

    const handlerScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            if (parentScrollY === collapsedHeader) {
                parentScrollY.value = currentScrollY.value;
            } else {
                parentScrollY.value = event.contentOffset.y;
            }
        }
    });

    useEffect(() => {
        const fetchPlayerStats = async () => {
            setLoading(true);
            try {
                const authToken = await AsyncStorage.getItem("AccessToken");
                const playerStatsResponse = await axiosInstance.get(
                    `${BASE_URL}/badminton/getBadmintonPlayerStats/${player.public_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                const item = playerStatsResponse.data?.data || [];
                setPlayerStats(item);
            } catch (err) {
                const backendErrors = err?.response?.data?.error?.fields || {};
                setError({
                    global: err?.response?.data?.error?.message || "Unable to load player stats",
                    fields: backendErrors,
                });
                console.error("Failed to fetch badminton player stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayerStats();
    }, [player?.public_id]);

    useEffect(() => {
        if (playerStats) {
            const singlesRes = playerStats.filter(p => p.play_type === 'singles');
            setSingles(singlesRes);
            if (playType === 'singles') {
                setStats(singlesRes);
            }
        }
    }, [playerStats]);

    if (loading) {
        return (
            <View style={[tailwind`flex-1 items-center justify-center`, { backgroundColor: '#0f172a' }]}>
                <ActivityIndicator size="large" color="#f87171" />
                <Text style={[tailwind`mt-2`, { color: '#94a3b8' }]}>Loading stats...</Text>
            </View>
        );
    }

    if (error?.global) {
        return (
            <View style={[tailwind`flex-1 items-center justify-center`, { backgroundColor: '#0f172a' }]}>
                <Text style={[tailwind`text-sm`, { color: '#f87171' }]}>{error.global}</Text>
            </View>
        );
    }

    if (!playerStats) {
        return (
            <View style={[tailwind`flex-1 items-center justify-center`, { backgroundColor: '#0f172a' }]}>
                <Text style={[tailwind`text-sm`, { color: '#64748b' }]}>No career stats available</Text>
            </View>
        );
    }

    const formatLabel = (key) => {
        switch (key) {
            case 'matches':
                return 'Matches Played';
            case 'wins':
                return 'Matches Won';
            case 'losses':
                return 'Matches Lost';
            case 'sets_won':
                return 'Sets Won';
            case 'sets_lost':
                return 'Sets Lost';
            case 'current_streak':
                return 'Current Streak';
            case 'best_streak':
                return 'Best Streak';
            case 'win_percentage':
                return 'Win Rate';
            default:
                return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }
    };

    const handlePlayTypeChange = (type) => {
        setPlayType(type);
        if (type === "singles") {
            const singlesRes = playerStats.filter(p => p.play_type === type);
            setStats(singlesRes);
        } else {
            const doublesRes = playerStats.filter(p => p.play_type === 'doubles');
            setStats(doublesRes);
        }
    };
            

    return (
        <View style={[tailwind`flex-1`, { backgroundColor: '#0f172a' }]}>
            <Animated.ScrollView
                onScroll={handlerScroll}
                scrollEventThrottle={16}
                contentContainerStyle={tailwind`pb-28`}
                showsVerticalScrollIndicator={false}
            >
                {/* Career Summary */}
                <View style={tailwind`mx-3 mt-3`}>
                    <View style={tailwind`flex-row bg-slate-800 rounded-2xl p-1`}>
                        {/* Singles */}
                        <Pressable
                            onPress={() => handlePlayTypeChange('singles')}
                            style={({ pressed }) => [
                                tailwind`flex-1 py-2.5 rounded-xl items-center`,
                                playType === 'singles' && tailwind`bg-red-400`,
                                pressed && { opacity: 0.8 }
                            ]}
                        >
                            <Text style={[ tailwind`text-sm font-semibold`,{ color: playType === 'singles' ? '#0f172a' : '#94a3b8'}]}>
                                Singles
                            </Text>
                        </Pressable>
                        {/* Doubles */}
                        <Pressable
                            onPress={() => handlePlayTypeChange('doubles')}
                            style={({ pressed }) => [
                                tailwind`flex-1 py-2.5 rounded-xl items-center`,
                                playType === 'doubles' && tailwind`bg-red-400`,
                                pressed && { opacity: 0.8 }
                            ]}
                        >
                            <Text style={[ tailwind`text-sm font-semibold`, { color: playType === 'doubles' ? '#0f172a' : '#94a3b8' }]}>
                                Doubles
                            </Text>
                        </Pressable>
                    </View>
                </View>
                <View style={[tailwind`rounded-2xl mx-3 mt-4 overflow-hidden`, { backgroundColor: '#1e293b' }]}>
                    <View style={[tailwind`px-4 py-3`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
                        <Text style={[tailwind`text-base font-bold`, { color: '#f1f5f9' }]}>Career Summary</Text>
                    </View>
                    {stats.length > 0 && stats.map((item) => {
                        return Object.keys(item)
                        .filter(key => playerStatsRows[key]).map((key, index) => {
                            return (
                                <StatRow key={index} label={formatLabel(key)} value={item[key]} />
                            )
                        })
                    })}
                </View>
            </Animated.ScrollView>
        </View>
    );
};

export default BadmintonPlayerStats;
