import {useState, useEffect} from  'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, View, Text, ScrollView } from "react-native";
import { BASE_URL } from "../constants/ApiConstants";
import { setActionRequired, setBowlerScore } from "../redux/actions/actions";
import tailwind from "twrnc";
import axiosInstance from "../screen/axios_config";
import { useSelector } from "react-redux";

const SetCurrentBowler = ({match, batTeam, game, dispatch, selectBowler, setSelectedBowler, error, setError, setIsModalBowlingVisible, onSuccess}) => {
    
    const currentInningNumber = useSelector(state => state.cricketMatchInning.currentInningNumber);
    const [bowlingSquad, setBowlingSquad] = useState([]);

    const bowlingTeamPublicID = batTeam === match.homeTeam?.public_id ? match.awayTeam?.public_id : match.homeTeam?.public_id;
    const fetchBowlingSquad = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketMatchSquad`, {
                params: {
                    "match_public_id": match?.public_id,
                    "team_public_id": bowlingTeamPublicID
                },
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                }
            });
            setBowlingSquad(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch bowling squad", err);
        }
    };

    useEffect(() => {
        fetchBowlingSquad();
    }, []);

    const handleUpdateBowlerStatus = async (item) => {
        try {
            const data = {
                match_public_id: match.public_id,
                team_public_id: batTeam === match.homeTeam?.public_id ? match.awayTeam?.public_id : match.homeTeam?.public_id,
                next_bowler_public_id: item?.player?.public_id,
                inning_number: currentInningNumber
            }
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateBowlingBowlerStatus`, data, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            })
            dispatch(setActionRequired(null))
            setIsModalBowlingVisible(false);
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
        <View>
            {bowlingSquad?.map((item, index) => (
                <Pressable key={index} onPress={() => handleUpdateBowlerStatus(item)} 
                    style={[tailwind`flex-row items-center py-3 px-2 rounded-xl mb-2`, { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }]}
                >
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
                        <Text style={[tailwind`text-base font-semibold`, { color: '#f1f5f9' }]}>
                            {item?.player?.name}
                        </Text>
                        <Text style={[tailwind`text-sm`, { color: '#94a3b8' }]}>
                            {item?.player?.positions}
                        </Text>
                    </View>
                </Pressable>
            ))}
        </View>
    )
};

export default SetCurrentBowler;