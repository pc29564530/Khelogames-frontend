import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Image, StyleSheet, Pressable, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import {useSelector,useDispatch} from 'react-redux';
import {logout,setAuthenticated, setFollowUser, setUnFollowUser, getFollowingUser} from '../redux/actions/actions';
import useAxiosInterceptor from './axios_config';

function ProfilePage() {
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch()
    const route = useRoute();
    const navigation = useNavigation();
    const [profileData, setProfileData] = useState([]);
    const following = useSelector((state) => state.user.following);
    const [isFollowing, setIsFollowing] = useState(following.some((item) => item === following_owner));
    const [showEditProfileButton,setShowEditProfileButton] = useState(false);
    const following_owner  = route.params?.username
    const handleEditProfile = () => {
      navigation.navigate('EditProfile') // Set the state to indicate that editing mode is active
    };

    const handleReduxFollow = async () => {
      try {
          const authToken = await AsyncStorage.getItem('AccessToken');
          const response = await axiosInstance.post(
            `http://192.168.0.102:8080/create_follow/${following_owner}`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          if(response.statusCode === 200 ) {
            dispatch(setFollowUser(response.data));
          }
      } catch (err) {
          console.error(err);
      }
     
    }
    const handleReduxUnFollow = async () => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.delete(
          `http://192.168.0.102:8080/unFollow/${following_owner}`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if(response.statusCode === 200 ) {
          dispatch(setUnFollowUser(response.data));
        } 
    } catch(e){
      console.error('Unable to unfollow agian', e);
    }
  }

    const handleFollowButton = async () => {
     if(isFollowing) {
        handleReduxUnFollow();
     } else {
        handleReduxFollow();
     }
     
    }
    const fetchFollowing = async () => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get('http://192.168.0.102:8080/getFollowing', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            }
        })
        const item = response.data;
        if(item === null) {
           dispatch(getFollowingUser([]));
        } else {
            dispatch(getFollowingUser(item));
        }
    } catch (e) {
        console.error(e);
    }
    }


  useEffect(() => {
    fetchFollowing();
    setIsFollowing(following.some((item) => item === following_owner))
    const verifyUser = async () => {
      const authUser = await AsyncStorage.getItem("User");
      if(following_owner===undefined || following_owner === null) {
        setShowEditProfileButton(true);
        setCurrentUser(authUser);
      } else {
        setCurrentUser(following_owner);
      }
    }

    const fetchData = async () => {
        try {
          const owner = await AsyncStorage.getItem('User')
          if (!owner) {
            console.log("User not found in AsyncStorage.");
            return;
        }
        if(following_owner === null || following_owner === undefined){
           const response = await axios.get(`http://192.168.0.102:8080/getProfile/${owner}`)
           if( response.data == null ){
            setProfileData([])
          } else {
            console.log(response.data)
            setProfileData(response.data);
          }
        } else {
          const response = await axios.get(`http://192.168.0.102:8080/getProfile/${following_owner}`)
           if( response.data == null ){
            setProfileData([])
          } else {
            console.log(response.data)
            setProfileData(response.data);
          }
        }
          if( response.data == null ){
            setProfileData([])
          } else {
            console.log(response.data)
            setProfileData(response.data);
          }
          
        } catch(e) {
          console.error("unable to fetch the profile details", e)
        }
    }
    verifyUser();
    fetchData();
    
  }, [])

    return(
        <View style={styles.Container}>
            <View style={styles.SubContainer}>
                <View style={styles.UserDetailsLeft}>
                  <View>
                        <Image style={styles.UserAvatar}  source={profileData.avatar_url}/> 
                  </View>
                        <Text>{profileData.full_name}</Text>
                        <Text>{profileData.owner}</Text>
                        <Text>{profileData.bio}</Text>
                </View>
                {showEditProfileButton ? (
                <View style={styles.UserDetailsRight}>
                     <Pressable onPress={handleEditProfile}>
                         <Text style={styles.EditButton}>Edit Profile</Text>
                     </Pressable>
                 </View>
                ) : 
                 null
                }
            </View>
            {!showEditProfileButton && (
                     <TouchableOpacity style={styles.FollowButton} onPress={handleFollowButton} >
                        <Text>{isFollowing ? 'Following' : 'Follow'}</Text>
                     </TouchableOpacity>
                 )}
            
        </View>
    );
}
const styles = StyleSheet.create({
  Container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
},
SubContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
},
UserDetailsLeft: {
    flex: 1,
    alignItems: 'flex-start',
},
UserDetailsRight: {
    flex: 1,
    alignItems: 'flex-end',
},
UserAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 8,
    backgroundColor: 'orange'
},
Title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
},
Text: {
    fontSize: 20,
    marginBottom: 5,
},
EditButton: {
    fontSize: 18,
    color: 'blue',
},
UpdateAvatar: {
    flexDirection: 'row',
    alignItems: 'center',
},
AddAvatar: {
  margin: 5,
  position: "absolute",
  top: 0,
  left: 0,
  width: 25,
  height: 25,
  color: "grey",
  borderRadius:50,
  borderWidth:1,
  padding:5,
  backgroundColor: 'whitesmoke'
},
FollowButton: {
  backgroundColor: '#007AFF',
  color: 'white',
  padding: 12,
  borderRadius: 20,
  width: '34%',
  alignItems: 'center',
},
});

export default ProfilePage