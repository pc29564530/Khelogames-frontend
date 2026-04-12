import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import { Image, Pressable, Text, View } from 'react-native';
import tailwind from "twrnc";
import axiosInstance from "../screen/axios_config";
import { addBowler } from "../redux/actions/actions";
import { useSelector } from "react-redux";


export const AddCricketBowler = ({ match, batTeam, homeTeam, awayTeam, game, dispatch, bowling, currentBowler, error, setError, setIsBowlTeamPlayerModalVisible, onSuccess }) => {
    const currentInningNumber = useSelector(state => state.cricketMatchInning.currentInningNumber);
    const [bowlingSquad, setBowlingSquad] = useState([]);

    const bowlingTeamPublicID = batTeam === homeTeam?.public_id ? awayTeam?.public_id : homeTeam?.public_id;

    const fetchBowlingSquad = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketMatchSquad`, {
                params: {
                    "match_public_id": match.public_id,
                    "team_public_id": bowlingTeamPublicID
                },
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                }
            });
            setBowlingSquad(response.data.data || []);
        } catch (err) {
            console.log("Failed to fetch bowling squad", err);
            setError({
                global: "Failed to get bowling squad",
                fields: {},
            })
        }
    };

    useEffect(() => {
        fetchBowlingSquad();
    }, []);

    const handleAddNextBowler = async (item) => {
        const bowlerPublicID = item.player.public_id;
        try {
            const prevBowlerPublicID = Array.isArray(currentBowler) && currentBowler.length > 0 ? currentBowler[0]?.bowler_public_id : null;
            const data = {
                match_public_id: match.public_id,
                team_public_id: bowlingTeamPublicID,
                bowler_public_id: bowlerPublicID,
                prev_bowler_public_id: prevBowlerPublicID,
                ball: 0,
                runs: 0,
                wickets: 0,
                wide: 0,
                no_ball: 0,
                inning_number: currentInningNumber,
            };
            const authToken = await AsyncStorage.getItem("AccessToken");
            const response = await axiosInstance.post(`${BASE_URL}/${game.name}/addCricketBall`, data, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data?.success && response.data?.data) {
                if (typeof onSuccess === "function") {
                    onSuccess(response.data.data);
                }
                if (typeof setIsBowlTeamPlayerModalVisible === "function") {
                    setIsBowlTeamPlayerModalVisible(false);
                }
            }
        } catch (err) {
            const backendErrors = err?.response?.data?.error?.fields;
            if (err?.response?.data?.error?.code === "FORBIDDEN") {
                setError({
                    global: err?.response?.data?.error?.message,
                    fields: {},
                });
            } else {
                setError({
                    global: "Unable to add new cricket bowler",
                    fields: backendErrors,
                });
            }
            console.log("Failed to add new cricket bowler: ", err);
        }
    };

    return (
        <View style={tailwind`p-1`}>

            {/* Player List */}
            {bowlingSquad.map((item, index) => (
                <Pressable
                    key={index}
                    onPress={() => handleAddNextBowler(item)}
                    style={[tailwind`flex-row items-center py-3 px-2 rounded-xl mb-2`, { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }]}
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
    );
};
