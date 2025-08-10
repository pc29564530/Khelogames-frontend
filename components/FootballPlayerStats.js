import {useState, useEffect} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import axiosInstance from '../screen/axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlatList } from 'native-base';

const FootballPlayerStats = ({player}) => {
    const [playerStats, setPlayerStats] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    


    useEffect(() => {
        const fetchPlayerStats = async () => {
            setIsLoading(true);
            try {
                const authToken = await AsyncStorage.getItem('authToken');
                const response = await axiosInstance.get(`${BASE_URL}/getFootballPlayerStats/${player.public_id}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                })
                setPlayerStats(response.data);
            } catch(err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchPlayerStats()
    }, []);

    if (isLoading){
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#1D4ED8" />
            </View>
        )
    }

    const playerStatsData = [
        { label: 'Matches', value: playerStats?.matches },
        { label: 'Minutes', value: playerStats?.minutes_played },
        { label: 'Goals', value: playerStats?.goals_scored },
        { label: 'Goals Conceded', value: playerStats?.goals_conceded },
        { label: 'Assists', value: playerStats?.assists },
        { label: 'Clean Sheets', value: playerStats?.clean_sheet },
        { label: 'Yellow Cards', value: playerStats?.yellow_cards },
        { label: 'Red Cards', value: playerStats?.red_cards },
    ]

    if (!playerStats){
        return (
            <View style={tailwind`p-10 bg-white rounded-lg shadow-md items-center`}>
                <Text style={tailwind`text-xl text-gray-800`}>No Activing Yet</Text>
            </View>
        )
    }

    return (
        <View style={tailwind`p-4 bg-white rounded-lg shadow-md`}>
            <Text style={tailwind`text-xl font-bold text-gray-800 mb-4`}>Player Statistics</Text>
                <FlatList 
                    data={playerStatsData}
                    numColumns={2}
                    keyExtractor={(item) => {item.id}}
                    renderItem={(item) => (
                    <View
                        style={tailwind`bg-gray-100 p-4 flex-1 rounded-lg shadow-sm item-center m-2 `}
                    >   
                            <Text style={tailwind`text-sm text-black`}>{item.item.label}</Text>
                            <Text style={tailwind`text-lg font-semibold text-gray-900`}>
                                {item.item.value !== undefined ? item.item.value : 'N/A'}
                            </Text>
                    </View>
                    )}
                />
        </View>
    );

}

export default FootballPlayerStats;