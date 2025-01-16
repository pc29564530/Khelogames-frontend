import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import {Pressable, Text, View} from 'react-native';
import tailwind from "twrnc";
import useAxiosInterceptor from "../screen/axios_config";


export const AddCricketBatsman = ({matchData, batTeam, homePlayer, awayPlayer, game}) => {
    const axiosInstance = useAxiosInterceptor();
    const teamPlayer = batTeam === matchData.awayTeam.id ? awayPlayer : homePlayer;
    const handleAddNextBatsman = async (item) => {
        try {
            const data = {
                batsman_id: item.id,
                match_id: matchData.matchId,
                team_id: batTeam,
                position: item.position,
                runs_scored: 0,
                balls_faced: 0,
                fours: 0,
                sixes: 0,
                batting_status: true,
                is_striker:false
            }
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.post(`${BASE_URL}/${game.name}/addCricketBatScore`, data, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
        } catch (err) {
            console.log("Failed to add the batsman: ", err);
        }
    }

    return (
        <View>
            {teamPlayer.map((item, index) => (
                <Pressable key={index} onPress={() => {handleAddNextBatsman(item)}} style={tailwind``}>
                    <Text style={tailwind`text-xl py-2 text-black`}>{item.player_name}</Text>
                </Pressable>
            ))}
        </View>
    );
}