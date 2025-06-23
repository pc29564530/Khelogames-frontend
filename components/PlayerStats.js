import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import useAxiosInterceptor from '../screen/axios_config';
import {Text, View, ScrollView, Pressable} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';

export const CricketPlayerStats = ({player}) => {
    const [cricketPlayerStats, setCricketPlayerStats] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [selectedMatchType, setSelectedMatchType] = useState("Test");
    const [playerStats, setPlayerStats] = useState(null);
    const [selectedFormat, setSelectedFormat] = useState("Test");

    const axiosInstance = useAxiosInterceptor();
    useEffect(() => {
        const fetchPlayerStats = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.get( `${BASE_URL}/getPlayerCricketStats`, {
                    params: {
                        "player_id": player.id
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                })
                setPlayerStats(response.data || []);
            } catch (err) {
                console.error("Failed to fetch player cricket stats", err);
            }
        }
        fetchPlayerStats();
    }, []);

    const renderStatBlock = () => {
        if (!playerStats) return null;

        const stats = playerStats?.[selectedFormat];
        if (!stats) return <Text>No data available</Text>;  

        return (
            <View style={tailwind`bg-white rounded-xl shadow-md p-4 mt-4`}>
                {Object.entries(stats).map(([key, value]) => (
                    <View key={key} style={tailwind`flex-row justify-between border-b border-gray-200 py-2`}>
                        <Text style={tailwind`text-gray-700 capitalize`}>{key.replace('_', ' ')}</Text>
                        <Text style={tailwind`text-black font-semibold`}>{value}</Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <ScrollView style={tailwind`p-4`}>
            <View style={tailwind`flex-row justify-around`}>
                {['Test', 'ODI', 'T20'].map((format) => (
                    <Pressable key={format} onPress={() => setSelectedFormat(format)}>
                        <Text style={selectedFormat === format ? tailwind`font-bold text-md text-blue-500` : tailwind`text-md`}>{format}</Text>
                    </Pressable>
                ))}
            </View>
            {renderStatBlock()}
        </ScrollView>
    );
}

export default CricketPlayerStats;
