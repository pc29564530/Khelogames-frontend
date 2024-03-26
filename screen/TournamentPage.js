import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import useAxiosInterceptor from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BASE_URL } from '../constants/ApiConstants';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { TopTabFootball } from '../navigation/TopTabFootball';

const TournamentPage = ({ route }) => {
    const tournament = route.params.item.item;
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [scrollEnabled, setScrollEnabled] = useState(false);
    const [teams, setTeams] = useState([]);
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();

    const checkSport = () => {
        switch (tournament.sport_type) {
            case "Badminton":
                return <TopTabBadminton />;
            case "Cricket":
                return <TopTabCricket tournament={tournament} />;
            case "Hockey":
                return <TopTabHockey />;
            case "Tennis":
                return <TopTabBTennis />;
            default:
                return <TopTabFootball tournament={tournament} />;
        }
    }

    const handleSearchTeam = async () => {
        try {
            console.log("SearchQuery: ", searchQuery);
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`${BASE_URL}/searchTeam`, { club_name: searchQuery }, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            setTeams(response.data);
            console.log("Result: ", response.data);
        } catch (err) {
            console.error("Unable to search the team: ", err);
        }
    }


    navigation.setOptions({
        headerTitle: '',
        headerRight: () => (
            <View style={tailwind`items-center justify-center mr-20`}>
                {showSearchInput ? (
                    <View style={tailwind` flex-row rounded-lg shadow-lg w-50 p-2 items-center justify-between`}>
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search teams..."
                        />
                        <Pressable onPress={handleSearchTeam}>
                            <MaterialIcons name="search" size={24} color="black" />
                        </Pressable>
                    </View>
                ) : (
                    <Pressable onPress={() => setShowSearchInput(true)}>
                        <MaterialIcons name="search" size={24} color="black" />
                    </Pressable>
                )}
            </View>
        )
    })
    

    const handleSetTeamTournament = async (item) => {
        try {
            console.log("Item: ", item)
            const addTeamTournament = {
                tournament_id: tournament.tournament_id,
                team_id: item.id
            }
            const authToken = await AsyncStorage.getItem("AccessToken");
            const response = await axiosInstance.post(`${BASE_URL}/addTeam`, addTeamTournament, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            })
            console.log("Tournament: ", response.data)
            navigation.goBack();
        } catch (err) {
            console.error("unable to add the team to tournament: ", err);
        }
    }
    console.log("Show: ", showSearchInput)
    console.log("Teams: ", teams.length)
    return (
        <View style={tailwind`flex-1 mt-2`}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                scrollEnabled={scrollEnabled}
            >
             { showSearchInput? (
                <View style={tailwind`mt-10 bg-orange-300 gap-4`}>
                    { teams.length>0 && teams.map((item, index) => (
                        <Pressable key={index} style={tailwind` bg-red-500`} onPress={() => handleSetTeamTournament(item)} >
                            <Text style={tailwind`text-black text-lg`}>{item.club_name}</Text>
                        </Pressable>
                    ))}
                </View>
             ):(
                <>
                    <View style={tailwind`justify-center ml-2 mr-2 items-center p-16`}>
                        <View style={tailwind`border rounded-full h-20 w-20 bg-red-400 items-center justify-center`}>
                            <Text style={tailwind``}>Text</Text>
                        </View>
                        <View style={tailwind`mt-2`}>
                            <Text style={tailwind`text-xl`}>{tournament.tournament_name}</Text>
                        </View>
                        <View style={tailwind`flex-row gap-2`}>
                            <Text style={tailwind`text-lg`}>Teams: {tournament.teams_joined}</Text>
                            <Text style={tailwind`text-lg`}>|</Text>
                            <Text style={tailwind`text-lg`}>{tournament.sport_type}</Text>
                        </View>
                    </View>
                    <View>
                        {checkSport()}
                    </View>
                </>
             )}
                        
                
            </ScrollView>
        </View>
    );
}

export default TournamentPage;
