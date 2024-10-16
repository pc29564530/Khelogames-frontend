import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import useAxiosInterceptor from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BASE_URL } from '../constants/ApiConstants';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { TopTabFootball } from '../navigation/TopTabFootball';
import TopTabCricket from '../navigation/TopTabCricket';

const TournamentPage = ({ route }) => {
    const { tournament, currentRole, game } = route.params;
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [teams, setTeams] = useState([]);
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();

    const checkSport = (game) => {
        switch (game.name) {
            case "badminton":
                return <TopTabBadminton />;
            case "cricket":
                return <TopTabCricket tournament={tournament} currentRole={currentRole} game={game} />;
            case "hockey":
                return <TopTabHockey />;
            case "tennis":
                return <TopTabBTennis />;
            default:
                return <TopTabFootball tournament={tournament} currentRole={currentRole} game = {game}/>;
        }
    }

    const handleSearchTeam = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`${BASE_URL}/searchTeam`, { club_name: searchQuery }, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            setTeams(response.data);
        } catch (err) {
            console.error("Unable to search the team: ", err);
        }
    }

    useEffect(() => {
        navigation.setOptions({
            headerTitle: '',
            headerRight: () => (
                <View style={tailwind`items-center justify-center mr-20`}>
                    {showSearchInput ? (
                        <View style={tailwind`flex-row rounded-lg shadow-lg w-50 p-2 items-center justify-between`}>
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
        });
    }, [showSearchInput, searchQuery]);

    const handleSetTeamTournament = async (item) => {
        try {
            const addTeamTournament = {
                tournament_id: tournament.tournament_id,
                team_id: item.id
            }
            const authToken = await AsyncStorage.getItem("AccessToken");
            await axiosInstance.post(`${BASE_URL}/${sport}/addTeam`, addTeamTournament, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            navigation.goBack();
        } catch (err) {
            console.error("unable to add the team to tournament: ", err);
        }
    }
    return (
        <View style={tailwind`flex-1`}>
            <ScrollView
                contentContainerStyle={{height: 930}}
                scrollEnabled={true}
            >
                {showSearchInput ? (
                    <>
                        {currentRole === "admin" && (
                            <View style={tailwind`mt-10 bg-orange-300 gap-4`}>
                                {teams.length > 0 && teams.map((item, index) => (
                                    <Pressable key={index} style={tailwind`bg-red-500`} onPress={() => handleSetTeamTournament(item)}>
                                        <Text style={tailwind`text-black text-lg`}>{item.club_name}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </>
                ) : (
                    <View style={tailwind`flex-1`}>
                        <View style={tailwind`justify-center items-center p-10`}>
                            <View style={tailwind`border rounded-full h-20 w-20 bg-red-400 items-center justify-center`}>
                                <Text style={tailwind`text-2xl`}>{tournament?.displayText}</Text>
                            </View>
                            <View style={tailwind`mt-2`}>
                                <Text style={tailwind`text-xl`}>{tournament?.name}</Text>
                            </View>
                            <View style={tailwind`flex-row gap-2`}>
                                <Text style={tailwind`text-lg`}>Teams: {tournament?.teams_joined}</Text>
                                <Text style={tailwind`text-lg`}>|</Text>
                                <Text style={tailwind`text-lg`}>{game.name}</Text>
                            </View>
                        </View>
                        <View style={tailwind`flex-1`}>{checkSport(game)}</View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

export default TournamentPage;
