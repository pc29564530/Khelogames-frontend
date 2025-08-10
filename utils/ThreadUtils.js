import { setLikes } from "../redux/actions/actions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";

export const handleLikes = async ({threadPublicID, dispatch, axiosInstance}) => {
    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
  
      // here when click on like icon call api createLike
      const userCount = await axiosInstance.get(`${BASE_URL}/checkLikeByUser/${threadPublicID}`, {headers});
      if(userCount.data == 0) {
        const response = await axiosInstance.post(`${BASE_URL}/createLikeThread/${threadPublicID}`,null, {headers} );
        if(response.status === 200) {
          try {
            const updatedLikeCount = await axiosInstance.get(`${BASE_URL}/countLike/${threadPublicID}`,null,{headers});
            const updateLikeData = {
              like_count: updatedLikeCount.data,
              threadPublicID: threadPublicID
            }
  
            const newLikeCount = await axiosInstance.put(`${BASE_URL}/update_like/${threadPublicID}`, {headers});
            dispatch(setLikes(threadPublicID, newLikeCount.data.like_count));
          } catch (err) {
            console.error(err);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  export const handleThreadComment = ({item, threadPublicID, navigation}) => {
    navigation.navigate('ThreadComment', {item: item, threadPublicID: threadPublicID, navigation})  
  }

 export const handleUser = async ({ profilePublicID, navigation }) => {
  if (!profilePublicID) {
    console.warn("⚠️ Missing profile public ID in handleUser");
    return;
  }

  console.log("✅ Navigating to Profile with ID:", profilePublicID);
  navigation.navigate('Profile', { profilePublicID });
};