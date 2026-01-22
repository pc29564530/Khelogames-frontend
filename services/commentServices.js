import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL, AUTH_URL } from "../constants/ApiConstants";
import axiosInstance from "../screen/axios_config";

export const getThreadComment = async ({threadPublicID}) => {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(`${BASE_URL}/getComments/${threadPublicID}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data
}

export const addThreadComment = async ({commentText, itemPublicID}) => {
        const authToken =  await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.post(`${BASE_URL}/createComment/${itemPublicID}`, {comment_text: commentText}, {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'content-type': 'application/json'
            }
        })
        return response.data;
}