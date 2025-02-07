import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import {Pressable, Text, View} from 'react-native';
import tailwind from "twrnc";
import useAxiosInterceptor from "../screen/axios_config";
import { addBowler, setBowlerScore } from "../redux/actions/actions";


export const AddCricketBowler = ({match, batTeam, homePlayer, awayPlayer, game, dispatch, bowlerToBeBowled, currentBowler, bowling}) => {
    const axiosInstance = useAxiosInterceptor();
    const handleAddNextBowler = async (item) => {
        try {
            const data = {
                match_id: match.id,
                team_id: batTeam !== match.awayTeam.id ? match.awayTeam.id : match.homeTeam.id,
                bowler_id: item.id,
                prev_bowler_id: bowling?.innings?.length > 0 ? currentBowler.player.id : null,
                ball: 0,
                runs: 0,
                wickets: 0,
                wide: 0,
                no_ball: 0,
                bowling_status: true,
                is_current_bowler: true
            }
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.post(`${BASE_URL}/${game.name}/addCricketBall`, data, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            if(response?.data?.current_bowler){
                console.log("not able to endter: ", response.data.current_bowler)
                dispatch(setBowlerScore(response.data.current_bowler));
            }
            dispatch(addBowler(response.data.next_bowler || {}));

        } catch (err) {
            console.log("Failed to add the bowler: ", err);
        }
    }

    return (
        <View>
            {bowlerToBeBowled.map((item, index) => (
                <Pressable key={index} onPress={() => {handleAddNextBowler(item)}} style={tailwind``}>
                    <Text style={tailwind`text-xl py-2 text-black`}>{item.player_name}</Text>
                </Pressable>
            ))}
        </View>
    );
}