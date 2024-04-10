import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import { View, Text, Pressable, Image} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';

const Fixture = ({clubName}) => {
    const [match, setMatch] = useState([]);
    const axiosInstance = useAxiosInterceptor();
    useEffect(() => {
        fetchTournamentMatch();
    }, []);
    console.log("ClubNameL ", clubName)
    const fetchTournamentMatch = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getMatchByClubName` ,{
                params: {
                    club_name: clubName
                },
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if(!response.data || response.data === null ){
                setMatch([]);
            } else {
                const item = response.data.map((item) => {
                    //date
                    const timestampStrDate = item.date_on;
                    const timestampDate = new Date(timestampStrDate);
                    const optionsDate = { weekday: 'long', month: 'long', day: '2-digit' };
                    const formattedDate = timestampDate.toLocaleString('en-US', optionsDate);
                    //time
                    const timestampStr = item.start_at;
                    const timestamp = new Date(timestampStr);
                    const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true };
                    const formattedTime = timestamp.toLocaleTimeString('en-US', optionsTime);
                    item.date_on = formattedDate;
                    item.start_at = formattedTime;
                    return item;
                });
                setMatch(item)
            }
            console.log("LIne no 245 Match: ", response.data)
        } catch (err) {
            console.log("unable to get the tournament match ", err);
        }
    }

    return (
        <View style={tailwind` mt-4 `}>
            <View>
                {match.length>0 && match.map((item , index) => (
                    <Pressable key={index} style={tailwind`mb-4 p-4 bg-white rounded-lg shadow-md`}>
                    <View style={tailwind``}>
                        <Text style={tailwind``}>{item.tournament_name}</Text>
                    </View>
                    <View style={tailwind`flex-row justify-between items-center mb-2 gap-2 p-2`}>
                        <View style={tailwind`items-center`}>
                            <Image source={{ uri: item.team1_avatar_url }} style={tailwind`w-10 h-10 bg-violet-200 rounded-full `} />
                            <Text style={tailwind`ml-2 text-xl font-semibold text-gray-800`}>{item.team1_name}</Text>
                        </View>
                        <Text style={tailwind`text-gray-600 text-lg`}>vs</Text>
                        <View style={tailwind` items-center`}>
                            <Image source={{ uri: item.team2_avatar_url }} style={tailwind`w-10 h-10 bg-violet-200 rounded-full`} />
                            <Text style={tailwind`ml-2 text-xl font-semibold text-gray-800`}>{item.team2_name}</Text>
                        </View>
                    </View>
                    <View style={tailwind`flex-row justify-between`}>
                        <Text style={tailwind`text-gray-600`}>{item.date_on}</Text>
                        <Text style={tailwind`text-gray-600`}>{item.start_at}</Text>
                    </View>
                </Pressable>
                ))}
            </View>
        </View>
    );
}

export default Fixture;