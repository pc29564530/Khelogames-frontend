import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL, AUTH_URL } from "../constants/ApiConstants";
import { addComments, setComments, setCommentText } from "../redux/actions/actions";

export const getThreadComment = async ({dispatch, axiosInstance, threadId}) => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getComment/${threadId}`, {
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
                    const profileResponse = await axiosInstance.get(`${AUTH_URL}/getProfile/${item.owner}`);
                        if (!profileResponse.data.avatar_url || profileResponse.data.avatar_url === '') {
                            const usernameInitial = profileResponse.data.owner ? profileResponse.data.owner.charAt(0) : '';
                            return {...item, profile: profileResponse.data, displayText: usernameInitial.toUpperCase()}
                        } else {
                            return {...item, profile: profileResponse.data}
                        }
                    })
                const commentData = await Promise.all(itemComment);
                dispatch(setComments(commentData));
            }
    } catch (err) {
        console.error("unable to get the error: ", err);
    }

}

export const addThreadComment = async ({commentText, dispatch, itemId, axiosInstance}) => {
    try {
        const authToken =  await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.post(`${BASE_URL}/createComment/${itemId}`, {comment_text: commentText}, {
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