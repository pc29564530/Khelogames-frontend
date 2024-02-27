import { setLikes } from "../redux/actions/actions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";

export const handleLikes = async ({id, dispatch, axiosInstance}) => {
    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
  
      // here when click on like icon call api createLike
      const userCount = await axiosInstance.get(`${BASE_URL}/checkLikeByUser/${id}`, {headers});
      if(userCount.data == 0) {
        const response = await axiosInstance.post(`${BASE_URL}/createLikeThread/${id}`,null, {headers} );
        if(response.status === 200) {
          try {
            const updatedLikeCount = await axiosInstance.get(`${BASE_URL}/countLike/${id}`,null,{headers});
            const updateLikeData = {
              like_count: updatedLikeCount.data,
              id: id
            }
  
            const newLikeCount = await axiosInstance.put(`${BASE_URL}/update_like`, updateLikeData, {headers});
            dispatch(setLikes(id, newLikeCount.data.like_count));
          } catch (err) {
            console.error(err);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  export const handleThreadComment = ({item, id, navigation}) => {
    navigation.navigate('ThreadComment', {item: item, itemId: id})
  }

  export const handleUser = async ({username, navigation}) => {
    navigation.navigate('Profile', {username: username})
  }