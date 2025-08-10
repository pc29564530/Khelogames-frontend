import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import {Pressable, Text, View} from 'react-native';
import tailwind from "twrnc";
import axiosInstance from "../screen/axios_config";
import { addBatsman } from "../redux/actions/actions";
import { useSelector } from "react-redux";
import { getCricketMatchSquad } from "../redux/actions/actions";


export const AddCricketBatsman = ({match, batTeam, game, dispatch}) => {
    
    const currentInning = useSelector((state) => state.cricketMatchInning.currentInning)
    const currentInningNumber = useSelector((state) => state.cricketMatchInning.currentInningNumber)
    const cricketMatchSquad = useSelector(state => state.players.squads)

    const fetchBattingSquad = async () => {
            try {
                const authToken = await AsyncStorage.getItem('authToken');
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketMatchSquad`, {
                    params: {
                        "match_public_id": match.public_id,
                        "team_public_id": batTeam
                    },
                    headers: {
                        "Authorization": `Bearer ${authToken}`,
                        "Content-Type": "application/json"
                    }
                })
                console.log("Batting : ", response.data)
                dispatch(getCricketMatchSquad(response.data || []));
            } catch (err) {
                console.error("Failed to fetch batting squad", err);
            }
    }

    useEffect(() => {
        fetchBattingSquad();
    }, []);

    const handleAddNextBatsman = async (item) => {
        try {
            const data = {
                match_public_id: match.public_id,
                team_public_id: batTeam,
                batsman_public_id: item.player.public_id,
                position: item.position,
                runs_scored: 0,
                balls_faced: 0,
                fours: 0,
                sixes: 0,
                batting_status: true,
                is_striker:false,
                is_currently_batting: true,
                inning_number: currentInningNumber,
            }
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.post(`${BASE_URL}/${game.name}/addCricketBatScore`, data, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            dispatch(addBatsman(response.data || {}));
        } catch (err) {
            console.log("Failed to add the batsman: ", err);
        }
    }

    return (
        <View>
            {cricketMatchSquad.map((item, index) => (
                <Pressable key={index} onPress={() => {handleAddNextBatsman(item)}} style={tailwind``}>
                    <Text style={tailwind`text-xl py-2 text-black`}>{item?.player.name}</Text>
                </Pressable>
            ))}
        </View>
    );
}