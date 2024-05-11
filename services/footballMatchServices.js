import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";


export const getFootballMatch  = async () => {

}

export const getFootballMatches  = async ({axiosInstance, tournamentId, tournamentSport}) => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(`${BASE_URL}/getAllTournamentMatch`, {
            params: {
                tournament_id: tournamentId,
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