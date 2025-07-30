import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, View, Text } from "react-native";
import { BASE_URL } from "../constants/ApiConstants";
import { setBowlerScore } from "../redux/actions/actions";
import tailwind from "twrnc";
import useAxiosInterceptor from "../screen/axios_config";

const SetCurrentBowler = ({match, batTeam, homePlayer, awayPlayer, game, dispatch, existingBowler, currentBowler}) => {
    const axiosInstance = useAxiosInterceptor()

    const handleUpdateBowlerStatus = async (item) => {
        try {
            const data = {
                match_public_id: match.public_id,
                team_public_id: batTeam === match.homeTeam.public_id ? batTeam : match.awayTeam.public_id,
                current_bowler_public_id: currentBowler.player.public_id,
                next_bowler_public_id: item.public_id,
                inning_number: inningNumber
            }
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateBowlingBowlerStatus`, data, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            })
            dispatch(setBowlerScore(response.data.next_bowler || {}));
           dispatch(setBowlerScore(response.data.current_bowler || {}));
           
        } catch (err) {
            console.error("Failed to update bowler bowling status; ", err);
        }
    }
    return (
        <View style={tailwind`flex-1`}>
            {existingBowler?.map((item, index) => (
                <Pressable key={index} onPress={() => handleUpdateBowlerStatus(item)}>
                    <Text style={tailwind`text-xl py-2 text-black`}>{item.player_name}</Text>
                </Pressable>
            ))}
        </View>
    )
};

export default SetCurrentBowler;