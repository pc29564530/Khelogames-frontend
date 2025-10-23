import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import { addFootballMatchScore } from "../redux/actions/actions";

export const getFootballMatchesService  = async ({axiosInstance, tournamentPublicID, game}) => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getAllTournamentMatch/${tournamentPublicID}`, {
            headers: {
                'Authorization': `bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data || [];
    } catch (err) {
        console.error("unable to get the all the match: ", err);
    }
}

export const addFootballScoreServices = async ({game, dispatch, item, authToken, axiosInstance}) => {
    try {
        const scoreData1 = {
            match_id:item.match_id,
            tournament_id: item.tournament_id,
            team_id: item.home_team_id,
            goal_score: 0
        }
        const scoreData2 = {
            match_id:item.match_id,
            tournament_id: item.tournament_id,
            team_id: item.away_team_id,
            goal_score: 0
        }
        const team1Response = await axiosInstance.post(`${BASE_URL}/${game.name}/addFootballMatchScore`,scoreData1, {
            headers: {
                'Authorization':`bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        const team2Response = await axiosInstance.post(`${BASE_URL}/${game.name}/addFootballMatchScore`,scoreData2, {
            headers: {
                'Authorization':`bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        dispatch(addFootballMatchScore(team1Response.data || []));
        dispatch(addFootballMatchScore(team2Response.data || []));
    } catch (err) {
        console.error("unable to add the football match score of team 1 and team 2 ", err);
    }
}