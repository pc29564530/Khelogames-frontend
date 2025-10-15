import { useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import {Pressable, Text, View} from 'react-native';
import tailwind from "twrnc";
import axiosInstance from "../screen/axios_config";
import { addBowler, setBowlerScore } from "../redux/actions/actions";
import { useSelector  } from "react-redux";
import { getCricketMatchSquad } from "../redux/actions/actions";
import { useWebSocket } from '../context/WebSocketContext';


export const AddCricketBowler = ({match, batTeam, homeTeam, awayTeam, game, dispatch, bowling,  currentBowler}) => {
    const wsRef = useWebSocket();
    const lastPayloadRef = useRef(null);
    const currentInning = useSelector(state => state.cricketMatchInning.currentInning);
    const currentInningNumber = useSelector(state => state.cricketMatchInning.currentInningNumber);
    const cricketMatchSquad = useSelector(state => state.players.squads);
    console.log("Bat Team line no 19: ", batTeam)
    const fetchBowlingSquad = async () => {
        try {
            const authToken = await AsyncStorage.getItem('authToken');
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketMatchSquad`, {
                params: {
                    "match_public_id": match.public_id,
                    "team_public_id": batTeam === homeTeam.public_id ? awayTeam.public_id : homeTeam.public_id
                },
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                }
            })
            dispatch(getCricketMatchSquad(response.data || []));
        } catch (err) {
            console.error("Failed to fetch bowling squad", err);
        }
    }

    useEffect(() => {
        fetchBowlingSquad();
    }, []);
   
    const handleAddNextBowler = async (item) => {
        const bowlerPublicID = item.player.public_id
        console.log("Bowler Item: ", item.player.public_id)
        console.log("Current InningNumver: ", currentInningNumber)
        try {
            const prevBowlerPublicID = Array.isArray(currentBowler) && currentBowler.length > 0 ? currentBowler[0]?.bowler_public_id : null;
            const data = {
                match_public_id: match.public_id,
                team_public_id: batTeam !== match.awayTeam.public_id ? match.awayTeam.public_id : match.homeTeam.public_id,
                bowler_public_id: bowlerPublicID,
                prev_bowler_public_id: prevBowlerPublicID,
                ball: 0,
                runs: 0,
                wickets: 0,
                wide: 0,
                no_ball: 0,
                inning_number: currentInningNumber,
            }
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.post(`${BASE_URL}/${game.name}/addCricketBall`, data, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            const item = response.data;
            if(item){
                dispatch(addBowler(response.data.next_bowler))
            } else {
                dispatch(addBowler([]))
            }

        } catch (err) {
            console.log("Failed to add the bowler: ", err);
        }

            const handleAddBatsmanWebSocket = useCallback((event) => {
                 const rawData = event?.data;
                 try {
                    if (rawData === null || !rawData) {
                        console.error("raw data is undefined");
                        return;
                    }
        
                    const message = JSON.parse(rawData);
                    
                    // Prevent duplicate processing - check by message type and key data
                    const messageKey = `${message.type}_${JSON.stringify(message.payload)}`;
                    if (lastPayloadRef.current === messageKey) {
                        console.log("Duplicate message ignored:", messageKey);
                        return;
                    }
                    lastPayloadRef.current = messageKey;
        
                    if(message.type === "ADD_BATSMAN"){
                        dispatch(addBatsman(message.payload))
                    }
        
                 } catch(err) {
                    console.error("Failed to parse websocket message: ", err);
                 }
            })
        
            useEffect(() => {
                if(!wsRef.current) {
                    return
                }
        
                wsRef.current.onmessage = handleAddBatsmanWebSocket;
            }, [handleAddBatsmanWebSocket]);
    }

    return (
        <View style={tailwind`p-1`}>
            {/* Header */}
            <View style={tailwind`items-center mb-4`}>
                <View style={tailwind`w-40 h-1 bg-gray-300 rounded-full mb-2`} />
                <Text style={tailwind`text-lg font-semibold text-gray-800`}>
                Select Batsman
                </Text>
            </View>

            {/* Player List */}
            {cricketMatchSquad.map((item, index) => (
                <Pressable
                    key={index}
                    onPress={() => handleAddNextBowler(item)}
                    style={tailwind`flex-row items-center py-3 px-2 rounded-xl mb-2 bg-gray-100`}
                    >
                    {/* Avatar */}
                    {item?.media_url ? (
                        <Image
                            source={{ uri: item.media_url }}
                            style={tailwind`h-12 w-12 rounded-full`}
                        />
                    ) : (
                        <View
                        style={tailwind`h-12 w-12 bg-red-400 rounded-full items-center justify-center`}
                        >
                            <Text style={tailwind`text-white font-bold text-lg`}>
                                {item?.player?.name?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}

                    {/* Player Info */}
                    <View style={tailwind`ml-3`}>
                        <Text style={tailwind`text-base font-semibold text-gray-900`}>
                            {item?.player?.name}
                        </Text>
                        <Text style={tailwind`text-sm text-gray-600`}>
                            {item?.player?.positions}
                        </Text>
                    </View>
                </Pressable>
            ))}
        </View>
    );
}