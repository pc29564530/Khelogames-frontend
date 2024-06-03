import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import { addFootballMatchScore } from "../redux/actions/actions";

export const getFootballMatches  = async ({axiosInstance, tournamentId, tournamentSport}) => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const data = {
            tournament_id: tournamentId,
            sports: tournamentSport
        }
        const response = await axiosInstance.get(`${BASE_URL}/${tournamentSport}/getAllTournamentMatch`, {
            params: {
                tournament_id: tournamentId.toString(),
                sports: tournamentSport
            },
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

export const addFootballScoreServices = async ({sports, dispatch, item, authToken, axiosInstance}) => {
    try {
        const scoreData1 = {
            match_id:item.match_id,
            tournament_id: item.tournament_id,
            team_id: item.team1_id,
            goal_score: 0
        }
        const scoreData2 = {
            match_id:item.match_id,
            tournament_id: item.tournament_id,
            team_id: item.team2_id,
            goal_score: 0
        }
        const team1Response = await axiosInstance.post(`${BASE_URL}/${sports}/addFootballMatchScore`,scoreData1, {
            headers: {
                'Authorization':`bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        const team2Response = await axiosInstance.post(`${BASE_URL}/${sports}/addFootballMatchScore`,scoreData2, {
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