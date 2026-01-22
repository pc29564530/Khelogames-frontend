import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../screen/axios_config";
import { BASE_URL } from "../constants/ApiConstants";

export const fetchCommunityJoinedByUserService = async () => {
    const authToken = await AsyncStorage.getItem('AccessToken');
    const response = await axiosInstance.get(`${BASE_URL}/getCommunityByUser`, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

export const fetchAllCommunityService = async () => {
    const authToken = await AsyncStorage.getItem('AccessToken');
    const response = await axiosInstance.get(`${BASE_URL}/getAllCommunities`, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
}

export const addUserToCommunity = async ({communityPublicID}) => {
    const authToken = await AsyncStorage.getItem('AccessToken');
    const response = await axiosInstance.post(`${BASE_URL}/addJoinCommunity/${communityPublicID}`, null, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
}

export const getCommunityMember = async ({communityPublicID}) => {
    const authToken = await AsyncStorage.getItem('AccessToken');
    const response = await axiosInstance.get(`${BASE_URL}/getCommunityMember/${communityPublicID}`, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        }
    });
    return response.data;
};

export const createNewCommunity = async ({formData}) => {
    const authToken = await AsyncStorage.getItem('AccessToken');
    const response  = await axiosInstance.post(`${BASE_URL}/createCommunity`, formData, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data
}