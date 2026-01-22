import { BASE_URL } from "../constants/ApiConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../screen/axios_config";

export const sportsServices = async () => {
    const authToken = await AsyncStorage.getItem('AcessToken');
    const response = await axiosInstance.get(`${BASE_URL}/getAllGames`, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data
};