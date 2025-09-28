import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import { useSelector } from 'react-redux';
import Animated, {useSharedValue, useAnimatedScrollHandler} from 'react-native-reanimated';

const TournamentCricketInfo = ({tournament, currentRole, parentScrollY, headerHeight, collapsedHeader}) => {
    const [organizationData, setOrganizationData] = useState(null);
    
    const game = useSelector(state => state.sportReducers.game);

    const currentScrollY = useSharedValue(0);

    const handlerScroll = useAnimatedScrollHandler({
        onScroll:(event) => {
            if(parentScrollY.value === collapsedHeader){
                parentScrollY.value = currentScrollY.value
            } else {
                parentScrollY.value = event.contentOffset.y
            }
        }
    })

    useEffect(() => {
        const fetchTournamentOrganization = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/getTournamentOrganization`, {
                    params: {
                        tournament_id: tournament.tournament_id
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                const item = response.data;
                const timestampStr = item.tournament_start;
                const timestampDate = new Date(timestampStr);
                const options = { weekday: 'long', month: 'long', day: '2-digit' };
                const date = timestampDate.toLocaleDateString('en-US', options)
                item.tournament_start = date;
                setOrganizationData(item);
            } catch (err) {
                console.error("Unable to fetch tournament info: ", err);
            }
        }
        fetchTournamentOrganization();
    }, []);

    return (
        <View style={tailwind`flex-1 mt-4 bg-white p-4 rounded-lg`}>
            <View style={tailwind`mb-4`}>
                <Text style={tailwind`text-lg font-bold`}>Tournament Information</Text>
                <View style={tailwind`mt-2 border-b border-gray-300`}></View>
            </View>
            {organizationData && (
                <View>
                    <View style={tailwind`mb-4 flex-row justify-between`}>
                        <Text style={tailwind`text-lg font-bold mb-1`}>Inauguration:</Text>
                        <Text style={tailwind`items-center mt-2`}>{organizationData.tournament_start}</Text>
                    </View>
                    <View style={tailwind`mb-4 flex-row justify-between`}>
                        <Text style={tailwind`text-lg font-bold mb-1`}>Registered Players:</Text>
                        <Text style={tailwind`items-center mt-2`}>{organizationData.player_count}</Text>
                    </View>
                    <View style={tailwind`mb-4 flex-row justify-between`}>
                        <Text style={tailwind`text-lg font-bold mb-1`}>Number of Teams:</Text>
                        <Text style={tailwind`items-center mt-2`}>{organizationData.team_count}</Text>
                    </View>
                    <View style={tailwind`mb-4 flex-row justify-between`}>
                        <Text style={tailwind`text-lg font-bold mb-1`}>Number of Groups:</Text>
                        <Text style={tailwind`items-center mt-2`}>{organizationData.group_count}</Text>
                    </View>
                    <View style={tailwind`mb-4 flex-row justify-between`}>
                        <Text style={tailwind`text-lg font-bold mb-1`}>Advanced to Next Level:</Text>
                        <Text style={tailwind`items-center mt-2`}>{organizationData.advanced_team}</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

export default TournamentCricketInfo;