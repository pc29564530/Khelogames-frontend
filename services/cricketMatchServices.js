import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import { addCricketMatchScore, setCurrentInning, setCurrentInningNumber } from "../redux/actions/actions";

export const addCricketScoreServices = async ({sport, dispatch, matchID, teamID, inning, authToken, axiosInstance}) => {
    try {
        const data = {
            match_id:matchID, 
            team_id: teamID,
            inning: inning,
            score: 0,
            wickets: 0,
            overs: 0,
            extras: 0,
            follow_on: followOn
        }
        const response = await axiosInstance.post(`${BASE_URL}/${sport}/addCricketScore`,data, {
            headers: {
                'Authorization':`bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        dispatch(setCurrentInningNumber(inning))
        dispatch(setCurrentInning(inning));
        dispatch(inningStatus("is_progress"))
        dispatch(setBatTeam(response.data.team_id))
        dispatch(addCricketMatchScore(response.data || []));
    } catch (err) {
        console.log("unable to add the cricket score of home team and away team ", err);
    }
}

export const matchBattingScoreBoard = async ({ matchID, teamID}) => {
    try {
        const authToken = await AsyncStorage.getItem("AccessToken")
        const battingScore = await axiosInstance.get(`${BASE_URL}/Cricket/getPlayerScoreFunc`,{match_id: matchID, team_id: teamID, inning: "inning1"}, {
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