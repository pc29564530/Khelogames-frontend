import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Image, StyleSheet, Pressable, TouchableOpacity, StatusBar} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import {useSelector,useDispatch} from 'react-redux';
import {logout,setAuthenticated, setFollowUser, setUnFollowUser, getFollowingUser} from '../redux/actions/actions';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';

const CoverImage = require('/Users/pawan/project/Khelogames-frontend/assets/images/cover.jpg');

function ProfilePage() {
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch()
    const route = useRoute();
    const navigation = useNavigation();
    const [profileData, setProfileData] = useState([]);
    const following = useSelector((state) => state.user.following);
    const [isFollowing, setIsFollowing] = useState(following.some((item) => item === following_owner));
    const [showEditProfileButton,setShowEditProfileButton] = useState(false);
    const [currentUser, setCurrentUser] = useState('');
    const [displayText, setDisplayText] = useState('');
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const following_owner  = route.params?.username
    
    const handleEditProfile = () => {
      navigation.navigate('EditProfile') // Set the state to indicate that editing mode is active
    };

    const handleReduxFollow = async () => {
      try {
          setIsFollowing(true)
          const authToken = await AsyncStorage.getItem('AccessToken');
          const response = await axiosInstance.post(
            `http://10.0.2.2:8080/create_follow/${following_owner}`,
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
        setIsFollowing(false)
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.delete(
          `http://10.0.2.2:8080/unFollow/${following_owner}`,
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
        const response = await axiosInstance.get('http://10.0.2.2:8080/getFollowing', {
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
        console.log("Profile Username: ", owner)
        if(following_owner === null || following_owner === undefined){
           const response = await axios.get(`http://10.0.2.2:8080/getProfile/${owner}`)
           console.log("AvatarUrl: ", response.data.avatar_url)
           console.log("CoverUrl: ", response.data.cover_url)
           if( response.data == null ){
            setProfileData([])
          } else {
            console.log("FullOutput: ",response.data)
            setProfileData(response.data);
            if(response.data.avatar_url || response.avatar_url === '') {
              const usernameInitial = response.data.owner ? response.data.owner.charAt(0) : '';
              console.log("display Text: ", usernameInitial.toUpperCase())
              setDisplayText(usernameInitial.toUpperCase());
            } else {
              setDisplayText('')
            }
          }
        } else {
          const response = await axios.get(`http://10.0.2.2:8080/getProfile/${following_owner}`)
           if( response.data == null ){
            setProfileData([])
          } else {
            console.log(response.data)
            setProfileData(response.data);
          }
        }
          
        } catch(e) {
          console.error("unable to fetch the profile details", e)
        }
    }
    verifyUser();
    fetchData();
    
  }, [])

  useEffect( () => {
    const followerCount = async () => {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const currentUser = await AsyncStorage.getItem("User");
        const response = await axiosInstance.get(`http://10.0.2.2:8080/getFollower`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          }
        });

        const item = response.data;
        if(item.length > 0) {
          setFollowerCount(item.length);
        }
    }
    const followingCount = async () => {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const currentUser = await AsyncStorage.getItem("User");
      const response = await axiosInstance.get(`http://10.0.2.2:8080/getFollowing`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      });
      const item = response.data;
      if(item.length > 0) {
        setFollowingCount(item.length);
      }
  }
    followerCount();
    followingCount()
  }, [])

    return(
      <View style={tailwind`flex-1 bg-black`}>
        <View style={tailwind`p-4 gap-30 items-left flex-row`}>
            <Pressable>
                <FontAwesome
                    name="close"
                    color="white"
                    size={24}
                    style={{ marginLeft: 10 }}
                    onPress={() => navigation.goBack()}
                />
            </Pressable>
            <Text style={tailwind`text-white font-bold text-lg`}>Profile</Text>
        </View>
        <View style={tailwind`w-full`}>
            {profileData.cover_url ? (
                <Image
                    style={tailwind`h-60 w-full bg-yellow-500`}
                    source={{uri: profileData.cover_url}}
                />
            ):(
              <Image 
                style={tailwind`h-60 w-full bg-yellow-500`}
                source={CoverImage}
              />
            )}
            
        </View> 
        <View style={tailwind`flex-1 p-4`}>
            {profileData.avatar_url ? (
                <Image style={tailwind`w-20 h-20 mb-5 rounded-full bg-white -mt-12`} source={{uri: profileData.avatar_url}} />
            ) : (
              <View style={tailwind`w-24 h-24 rounded-12 bg-white items-center justify-cente -mt-12`}>
                <Text style={tailwind`text-red-500 text-12x2`}>
                  {displayText}
                </Text>
              </View>
            )}
              <Text style={tailwind`text-3xl mb-1 mt-4 text-white`}>{profileData.full_name}</Text>
              <Text style={tailwind`text-xl mb-1 text-white`}>@{profileData.owner}</Text>
              <View style={tailwind`flex-row justify-between content-center pl-2 pt-5 text-black`}>
                  <Text style={tailwind`flex-row text-lg text-white `}>{followerCount}  Followers</Text>
                  <Text style={tailwind`flex-row text-lg text-white`}> | </Text>
                  <Text style={tailwind`flex-row text-lg text-white`}>{followingCount}  Following</Text>
                </View>
              <Text style={tailwind`text-xl mb-5 text-white`}>{profileData.bio}</Text>

              <View style={tailwind`flex-row mt-20 `}>
                {showEditProfileButton ? (
                <Pressable style={tailwind`items-center p-2 `} onPress={handleEditProfile}>
                    <Text style={ tailwind`text-blue-500 text-xl font-bold`}>Edit Profile</Text>
                </Pressable>
                ) : (
                  <TouchableOpacity style={tailwind`bg-blue-500 text-gray-500 py-3 px-5 rounded-md w-2/3 text-center items-center z-10`} onPress={handleFollowButton}>
                      <Text style={ tailwind`text-white text-xl font-bold`}>{isFollowing ? 'Following' : 'Follow'}</Text>
                  </TouchableOpacity>
                )}
              </View>
        </View>
  </View>
    );
}

export default ProfilePage