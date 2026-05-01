import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import axiosInstance from "../screen/axios_config";

export const addCricketScoreServices = async ({game, matchPublicID, teamPublicID, currentInningNumber}) => {
        const data = {
            match_public_id:matchPublicID,
            team_public_id: teamPublicID,
            inning_number: currentInningNumber + 1,
            score: 0,
            wickets: 0,
            overs: 0,
            extras: 0,
            follow_on: false,
        }
        const authToken = await AsyncStorage.getItem("AccessToken");
        const response = await axiosInstance.post(`${BASE_URL}/${game.name}/addCricketScore`, data, {
            headers: {
                'Authorization': `bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
}

export const matchBattingScoreBoard = async ({ matchPublicID, teamPublicID}) => {
    try {
        const authToken = await AsyncStorage.getItem("AccessToken")
        const battingScore = await axiosInstance.get(`${BASE_URL}/Cricket/getPlayerScoreFunc`, {
            params: { match_public_id: matchPublicID, team_public_id: teamPublicID, inning: "inning1" },
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        })
        return battingScore.data || [];
    } catch (err) {
        console.error("unable to fetch batting score: ", err)
    }
}
