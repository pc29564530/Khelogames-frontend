import { setLikes } from "../redux/actions/actions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";

export const handleLikes = async ({threadPublicID, threadId, dispatch, axiosInstance, setIsLiked}) => {
    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }

      // Check if user has already liked this thread
      const userLikeCheck = await axiosInstance.get(`${BASE_URL}/checkLikeByUser/${threadPublicID}`, {headers});
      console.log("User Like Check: ", userLikeCheck.data)

      if(userLikeCheck.data == 0) {
        // User hasn't liked - create new like
        const response = await axiosInstance.post(`${BASE_URL}/createLikeThread/${threadPublicID}`, null, {headers});

        if(response.status === 200) {
          // Get updated like count
          const updatedLikeCount = await axiosInstance.get(`${BASE_URL}/countLike/${threadPublicID}`, {headers});

          // Update thread's like count in database
          await axiosInstance.put(`${BASE_URL}/update_like/${threadPublicID}`, {
            like_count: updatedLikeCount.data
          }, {headers});

          // Update Redux store with new like count
          dispatch(setLikes(threadId, updatedLikeCount.data));

          // Update UI state
          if (setIsLiked) {
            setIsLiked(true);
          }

          console.log("Like added successfully. New count:", updatedLikeCount.data);
        }
      } else {
        // User has already liked - remove like (unlike)
        const response = await axiosInstance.delete(`${BASE_URL}/deleteLikeThread/${threadPublicID}`, {headers});

        if(response.status === 200) {
          // Get updated like count
          const updatedLikeCount = await axiosInstance.get(`${BASE_URL}/countLike/${threadPublicID}`, {headers});

          // Update thread's like count in database
          await axiosInstance.put(`${BASE_URL}/update_like/${threadPublicID}`, {
            like_count: updatedLikeCount.data
          }, {headers});

          // Update Redux store with new like count
          dispatch(setLikes(threadId, updatedLikeCount.data));

          // Update UI state
          if (setIsLiked) {
            setIsLiked(false);
          }

          console.log("Like removed successfully. New count:", updatedLikeCount.data);
        }
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  }

  export const handleThreadComment = ({item, threadPublicID, navigation}) => {
    navigation.navigate('ThreadComment', {item: item, threadPublicID: threadPublicID, navigation})  
  }

 export const handleUser = async ({ profilePublicID, navigation }) => {
  if (!profilePublicID) {
    console.warn("Missing profile public ID in handleUser");
    return;
  }

  console.log("Navigating to Profile with ID:", profilePublicID);
  navigation.navigate('Profile', { profilePublicID });
};