import { setLikes } from "../redux/actions/actions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import axiosInstance from "../screen/axios_config";

//handle like 
export const handleLikes = async ({ threadPublicID, setError, dispatch }) => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const headers = {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        };

        const response = await axiosInstance.post(
            `${BASE_URL}/likeThread/${threadPublicID}`,
            null,
            { headers }
        );

        if (response.status === 200 && response.data.success) {
            const { public_id, like_count } = response.data.data;
            dispatch(setLikes(public_id, like_count));
        }
    } catch (err) {
        setError({
          "global":"Unable to like thread",
          "fields": err?.response?.data?.error
        });
        console.error("Error handling like:", err);
    }
};

export const handleThreadComment = ({ item, threadPublicID, navigation }) => {
    navigation.navigate('ThreadComment', { item, threadPublicID });
};

export const handleUser = ({ profilePublicID, navigation }) => {
    if (!profilePublicID) {
        console.warn("Missing profile public ID in handleUser");
        return;
    }
    navigation.navigate('Profile', { profilePublicID });
};
