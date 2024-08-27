import { AUTH_URL, BASE_URL } from "../constants/ApiConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addThreads, setThreads } from "../redux/actions/actions";

export const getAllThreadServices = async ({ dispatch, axiosInstance }) => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(`${BASE_URL}/GetAllThreadDetailFunc`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });
        const item = response.data;
        if (item === null) {
            dispatch(setThreads([]));
        } else {
            dispatch(setThreads(response.data));
        }
    } catch (err) {
        console.error(err);
    }
};

export const addNewThreadServices = async ({dispatch, axiosInstance, thread, navigation: navigation}) => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.post(`${BASE_URL}/create_thread`, thread, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });
        const item = response.data || [];
        dispatch(addThreads(item));
        navigation.navigate('Home');
    } catch (err) {
        console.error("unable to add the new thread: ", err);
    }
}