import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import { Image, Pressable, Text, View, ScrollView, Dimensions, useWindowDimensions } from 'react-native';
import tailwind from "twrnc";
import axiosInstance from "../screen/axios_config";
import { addBatsman, setActionRequired } from "../redux/actions/actions";
import { useSelector } from "react-redux";


export const  AddCricketBatsman = ({ match, batTeam, game, dispatch, selectedBatsman, setSelectedBatsman, error, setError, setIsBatTeamPlayerModalVisible, onSuccess }) => {
    const { height: sHeight, width: sWidth } = useWindowDimensions();
    const [battingSquad, setBattingSquad] = useState([]);
    const currentInningNumber = useSelector((state) => state.cricketMatchInning.currentInningNumber);

    const fetchBattingSquad = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketMatchSquad`, {
                params: {
                    "match_public_id": match.public_id,
                    "team_public_id": batTeam
                },
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                }
            });
            setBattingSquad(response.data.data || []);
        } catch (err) {
            const backendErrors = err?.response?.data?.error?.fields;
            if (typeof setError === 'function') {
                setError({
                    global: "Unable to get batting squad",
                    fields: backendErrors,
                });
            }
            console.error("Failed to fetch batting squad", err);
        }
    };

    useEffect(() => {
        fetchBattingSquad();
    }, [match?.public_id, batTeam, game.name]);

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
                is_striker: false,
                is_currently_batting: true,
                inning_number: currentInningNumber,
            };

            const authToken = await AsyncStorage.getItem("AccessToken");
            const response = await axiosInstance.post(`${BASE_URL}/${game.name}/addCricketBatScore`, data, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response?.data?.success) {
                if (typeof onSuccess === "function") {
                    onSuccess(response.data.data);
                }
                if (typeof setIsBatTeamPlayerModalVisible === "function") {
                    setIsBatTeamPlayerModalVisible(false);
                }
            }
            dispatch(setActionRequired(null))
        } catch (err) {
            const errorCode = err?.response?.data?.error?.code;
            const errorMessage = err?.response?.data?.error?.message;
            const backendFields = err?.response?.data?.error?.fields;

            if (backendFields && Object.keys(backendFields).length > 0) {
                setError({ global: errorMessage || "Invalid input", fields: backendFields });
            } else if (errorCode && errorCode !== "INTERNAL_ERROR") {
                setError({ global: errorMessage, fields: {} });
            } else {
                setError({ global: "Unable to add new cricket batsman", fields: {} });
            }
            console.log("Failed to add the batsman: ", err?.response?.data?.error);
        }
    };

    return (
    <View>
        {error?.global && (
            <View style={[tailwind`mx-3 mb-3 p-3 rounded-lg`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                <Text style={{ color: '#fca5a5', fontSize: 13 }}>
                    {error.global}
                </Text>
            </View>
        )}
        {/* Player List */}
        {battingSquad.map((item, index) => (
            <Pressable
                key={index}
                onPress={() => handleAddNextBatsman(item)}
                style={[
                    tailwind`flex-row items-center py-3 px-3 rounded-xl mb-2`,
                    {
                        backgroundColor: '#0f172a',
                        borderWidth: 1,
                        borderColor: '#334155',
                    }
                ]}
            >
                {/* Avatar */}
                {item?.media_url ? (
                    <Image
                        source={{ uri: item.media_url }}
                        style={tailwind`h-12 w-12 rounded-full`}
                    />
                ) : (
                    <View style={tailwind`h-12 w-12 bg-red-400 rounded-full items-center justify-center`}>
                        <Text style={tailwind`text-white font-bold text-lg`}>
                            {item?.player?.name?.charAt(0)?.toUpperCase()}
                        </Text>
                    </View>
                )}

                {/* Player Info */}
                <View style={tailwind`ml-3 flex-1`}>
                    <Text
                        numberOfLines={1}
                        style={[tailwind`text-base font-semibold`, { color: '#f1f5f9' }]}
                    >
                        {item?.player?.name}
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={[tailwind`text-sm`, { color: '#94a3b8' }]}
                    >
                        {item?.player?.positions}
                    </Text>
                </View>
            </Pressable>
        ))}
    </View>
);
};
