import { BASE_URL } from "../constants/ApiConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addThreads, setThreads } from "../redux/actions/actions";

export const getAllThreadServices = async ({ dispatch, axiosInstance }) => {
    try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(`${BASE_URL}/all_threads`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });
        const item = response.data;
        if (item === null) {
            dispatch(setThreads([]));
        } else {
            const threadUser = item.map(async (item, index) => {
                const profileResponse = await axiosInstance.get(`${BASE_URL}/getProfile/${item.username}`);
                let displayText = '';
                if (!profileResponse.data.avatar_url || profileResponse.data.avatar_url === '') {
                    const usernameInitial = profileResponse.data.owner ? profileResponse.data.owner.charAt(0) : '';
                    displayText = usernameInitial.toUpperCase();
                }
                const timestamp = item.created_at;
                const timeDate = new Date(timestamp)
                const options = { month: 'long', day: '2-digit' }
                const formattedTime = timeDate.toLocaleString('en-US', options)
                item.created_at = formattedTime;
                return { ...item, profile: profileResponse.data, displayText };
            });
            const threadsWithUserData = await Promise.all(threadUser);
            dispatch(setThreads(threadsWithUserData));
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


// export const getThreadByCommunity = async () => {
//     try {

//     } catch (err) {
//         console.error("unable to get the thread by community: ", err);
//     }
// }
