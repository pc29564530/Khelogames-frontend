import { BASE_URL } from "../constants/ApiConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const sportsServices = async ({axiosInstance}) => {
    try {
            const authToken = await AsyncStorage.getItem('AcessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getAllGames`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data || [];
    } catch (err) {
        console.error("unable to fetch the sports: ", err);
    }
};

