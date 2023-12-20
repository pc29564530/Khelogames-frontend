import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from '../screen/axios_config';
const axiosInstance = useAxiosInterceptor();
export const ProfileService=async(username)=>{
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(`http://10.0.2.2:8080/getProfile/${username}`, null, {
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