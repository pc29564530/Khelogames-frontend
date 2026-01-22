import { AUTH_URL, BASE_URL } from "../constants/ApiConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addThreads, setThreads } from "../redux/actions/actions";
import axiosInstance from "../screen/axios_config";
import { handleInlineError, logSilentError } from "../utils/errorHandler";

export const getAllThreadServices = async () => {
        const authToken = await AsyncStorage.getItem("AccessToken");
        const response = await axiosInstance.get(`${BASE_URL}/GetAllThreadDetailFunc`, {
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": 'application/json',
            },
        });
        return response.data;
};

export const addNewThreadServices = async ({thread}) => {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.post(`${BASE_URL}/create_thread`, thread, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
}