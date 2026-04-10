import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, View, Text } from "react-native";
import { BASE_URL } from "../constants/ApiConstants";
import { setBowlerScore } from "../redux/actions/actions";
import tailwind from "twrnc";
import axiosInstance from "../screen/axios_config";

const SetCurrentBowler = ({match, batTeam, homePlayer, awayPlayer, game, dispatch, bowlingTeamPlayer, currentBowler, error, setError, inningNumber, setIsModalBowlingVisible}) => {
    const handleUpdateBowlerStatus = async (item) => {
        try {
            const data = {
                match_public_id: match.public_id,
                team_public_id: batTeam === match.homeTeam?.public_id ? match.awayTeam?.public_id : match.homeTeam?.public_id,
                next_bowler_public_id: item?.public_id,
                inning_number: inningNumber
            }
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateBowlingBowlerStatus`, data, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            })
           setIsModalBowlingVisible(false)
        } catch (err) {
            const backendErrors = err?.response?.data?.error?.fields;
            if(err?.response?.data?.error?.code === "FORBIDDEN") {
                setError({
                    global: err?.response?.data?.error?.message,
                    fields: {},
                })
            } else {
                setError({
                    global: "Unable to update bowler bowling status",
                    fields: backendErrors,
                });
            }
            console.error("Unable to update bowler bowling status; ", err);
        }
    }
    return (
        <View style={tailwind`flex-1`}>
            {bowlingTeamPlayer?.map((item, index) => (
                <Pressable key={index} onPress={() => handleUpdateBowlerStatus(item)} style={[tailwind`py-3 px-2 rounded-lg mb-2`, {backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155'}]}>
                    <Text style={[tailwind`text-xl`, {color: '#f1f5f9'}]}>{item.name}</Text>
                </Pressable>
            ))}
        </View>
    )
};

export default SetCurrentBowler;