import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import { addCricketMatchScore } from "../redux/actions/actions";

export const addCricketScoreServices = async ({sport, dispatch, item, authToken, axiosInstance}) => {
    try {
        const homeScoreData = {
            match_id:item.match_id,
            tournament_id: item.tournament_id,
            team_id: item.team1_id,
            score: 0,
            wickets: 0,
            overs: 0,
            extras: 0,
            innings: 0
        }
        const awayScoreData = {
            match_id:item.match_id,
            tournament_id: item.tournament_id,  
            team_id: item.team2_id,
            score: 0,
            wickets: 0,
            overs: 0,
            extras: 0,
            innings: 0
        }
        const homeScoreResponse = await axiosInstance.post(`${BASE_URL}/${sport}/addCricketMatchScore`,homeScoreData, {
            headers: {
                'Authorization':`bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        const awayScoreResponse = await axiosInstance.post(`${BASE_URL}/${sport}/addCricketMatchScore`,awayScoreData, {
            headers: {
                'Authorization':`bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        dispatch(addCricketMatchScore(homeScoreResponse.data || []));
        dispatch(addCricketMatchScore(awayScoreResponse.data || []));
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