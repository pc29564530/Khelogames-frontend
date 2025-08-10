import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {useState} from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { BASE_URL } from "../constants/ApiConstants";
import { useNavigation } from "@react-navigation/native";
import axiosInstance from "./axios_config";
import tailwind from "twrnc";

const TournamentDescription = ({route}) => {
    const tournament_id = route.params.tournament_id
    const [playerCount, setPlayerCount] = useState(null);
    const [teamCount, setTeamCount] = useState(null);
    const [groupCount, setGroupCount] = useState(null);
    const [advanceCount, setAdvanceCount] = useState(null);
    const [tournamentStart, setTournamentStart] = useState(new Date())
    const navigation = useNavigation();
    


    const createTournamentDescription = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const organization = {
                tournament_id: tournament_id,
                player_count: parseInt(playerCount),
                team_count: parseInt(teamCount),
                group_count: parseInt(groupCount),
                advanced_team: parseInt(advanceCount),
                tournament_start:parseInt(tournamentStart)
            }

            const resposne = await axiosInstance.post(`${BASE_URL}/createTournamentOrganization`, organization, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            
             navigation.navigate('Tournament');
        } catch (err) {
            console.error("unable to create the description: ", err)
        }
    }

    return (
        <View style={tailwind`flex-1 mt-4 rounded-lg bg-white`}>
            <View style={tailwind`flex-row justify-between mb-2 ml-2 mr-2`}>
                <Text style={tailwind`text-md`}>Inauguration </Text>
            </View>
            <View style={tailwind`flex-row justify-between mb-2 ml-2 mr-2`}>
                <Text style={tailwind`text-md `}>Registered Players</Text>
                <TextInput value={playerCount} onChange={setPlayerCount} placeholder="0" style={tailwind`rounded-lg h-8 w-8 shadow-lg bg-white p-2`}/>
            </View>
            <View style={tailwind`flex-row justify-between mb-2 ml-2 mr-2`}>
                <Text>Number of teams</Text>
                <TextInput value={teamCount} onChange={setTeamCount} placeholder="0" style={tailwind`rounded-lg h-8 w-8 shadow-lg bg-white p-2`}/>
            </View>
            <View style={tailwind`flex-row justify-between mb-2 ml-2 mr-2`}>
                <Text>No Of Groups</Text>
                <TextInput value={groupCount} onChange={setGroupCount} placeholder="0" style={tailwind`rounded-lg h-8 w-8 shadow-lg bg-white p-2`}/>
            </View>
            <View style={tailwind`flex-row justify-between mb-2 ml-2 mr-2`}>
                <Text>Advanced to next level</Text>
                <TextInput value={advanceCount} onChange={setAdvanceCount} placeholder="0" style={tailwind`rounded-lg h-8 w-8 shadow-lg bg-white p-2`}/>
            </View>
            <View style={tailwind`flex-row justify-end m-2`}>
                <Pressable onPress={() => createTournamentDescription()}>
                    <Text>Continue</Text>
                </Pressable>
            </View>
        </View>
    );
}

export default TournamentDescription;