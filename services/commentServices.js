import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL, AUTH_URL } from "../constants/ApiConstants";
import { addComments, setComments, setCommentText } from "../redux/actions/actions";

export const getThreadComment = async ({dispatch, axiosInstance, threadPublicID}) => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getComment/${threadPublicID}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const item = response.data || [];
            if(!item || item === null ){
                dispatch(setComments([]));
            } else {
                const itemComment = item.map(async (item,index) => {
                        if (!item.profile.avatar_url || item.profile.avatar_url === '') {
                            const usernameInitial = item.profile.full_name ? item.profile.full_name.charAt(0) : '';
                            return {...item, profile: item.profile, displayText: usernameInitial.toUpperCase()}
                        } else {
                            return {...item, profile: item.profile}
                        }
                    })
                const commentData = await Promise.all(itemComment);
                dispatch(setComments(commentData));
            }
    } catch (err) {
        console.error("unable to get the error: ", err);
    }

}

export const addThreadComment = async ({commentText, dispatch, itemPublicID, axiosInstance}) => {
    try {
        const authToken =  await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.post(`${BASE_URL}/createComment/${itemPublicID}`, {comment_text: commentText}, {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'content-type': 'application/json'
            }
        })
        dispatch(addComments(response.data));
        dispatch(setCommentText(''));
    } catch (err) {
        console.error(err);
    }
}