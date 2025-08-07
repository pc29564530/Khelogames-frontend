import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from '../screen/axios_config';
import { BASE_URL } from '../constants/ApiConstants';
const axiosInstance = useAxiosInterceptor();
export const ProfileService=async(userPublicID)=>{
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(`${AUTH_URL}/getProfile/${userPublicID}`, null, {
            headers:{
                'Authorization':`Bearer ${authToken}`,
                'Content-Type':'application/json',
            },
        });
        return response.data;
    } catch(e) {
        console.error("error unable to fetch the profile: ", e);
        return null;
    }
}