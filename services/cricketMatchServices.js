import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import { addCricketMatchScore, setCurrentInning, setCurrentInningNumber } from "../redux/actions/actions";

export const addCricketScoreServices = async ({sport, dispatch, matchPublicID, teamPublicID, inning, authToken, axiosInstance}) => {
    try {
        const data = {
            match_public_id:matchPublicID, 
            team_public_id: teamPublicID,
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
        dispatch(setCurrentInningNumber(response.data.inning.inning_number))
        dispatch(setCurrentInning(response.data.inning.inning_number));
        dispatch(inningStatus("is_progress"))
        dispatch(setBatTeam(response.data.team.public_id))
        dispatch(addCricketMatchScore(response.data.inning || []));
    } catch (err) {
        console.log("unable to add the cricket score of home team and away team ", err);
    }
}

export const matchBattingScoreBoard = async ({ matchPublicID, teamPublicID}) => {
    try {
        const authToken = await AsyncStorage.getItem("AccessToken")
        const battingScore = await axiosInstance.get(`${BASE_URL}/Cricket/getPlayerScoreFunc`,{match_public_id: matchPublicID, team_public_id: teamPublicID, inning: "inning1"}, {
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