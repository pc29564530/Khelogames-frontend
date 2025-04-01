import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import { addCricketMatchScore } from "../redux/actions/actions";

export const addCricketScoreServices = async ({sport, dispatch, matchID, teamID, authToken, axiosInstance}) => {
    try {
        const data = {
            match_id:matchID, 
            team_id: teamID,
            score: 0,
            wickets: 0,
            overs: 0,
            extras: 0,
            innings: 0
        }
        const response = await axiosInstance.post(`${BASE_URL}/${sport}/addCricketScore`,data, {
            headers: {
                'Authorization':`bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        dispatch(addCricketMatchScore(response.data || []));
    } catch (err) {
        console.log("unable to add the cricket score of home team and away team ", err);
    }
}

export const matchBattingScoreBoard = async ({ matchID, teamID}) => {
    try {
        const authToken = await AsyncStorage.getItem("AccessToken")
        const battingScore = await axiosInstance.get(`${BASE_URL}/Cricket/getPlayerScoreFunc`,{match_id: matchID, team_id: teamID}, {
            headers: {
                'Authorization':`bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        })
        return battingScore.data || [];
    } catch (err) {
        console.error("unable to fetch batting score: ", err)
    }
}