import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../screen/axios_config";
import { BASE_URL } from "../constants/ApiConstants";

export const fetchTeamPlayers = async ( teamPublicID, game) => {
        const authToken = await AsyncStorage.getItem("AccessToken");
        const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTeamsMemberFunc/${teamPublicID}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
}