import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Modal, StyleSheet, TouchableOpacity, Image, Button} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import useAxiosInterceptor from './axios_config';
import {useSelector,useDispatch} from 'react-redux';
import {logout,setAuthenticated, setFollowUser, setUnFollowUser, getFollowingUser} from '../redux/actions/actions';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import tailwind from 'twrnc';

function ProfileMenu(){
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const axiosInstance = useAxiosInterceptor();
    const route = useRoute();
    const following_owner  = route.params?.username

    const following = useSelector((state) => state.user.following);
    const [isFollowing, setIsFollowing] = useState(following.some((item) => item === following_owner));
    const [showLogoutButton, setShowLogoutButton] = useState(false)
    const [currentUser, setCurrentUser] = useState('');
    const [showMyCommunity, setShowMyCommunity] = useState(false);
    const [myCommunityData, setMyCommunityData] = useState([]);
    const [profileData, setProfileData] = useState([]);
    const [displayText, setDisplayText] = useState('');
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    const handleProfilePage = () => {
      navigation.navigate('Profile');
    }

    const toggleMyCommunity = async () => {
        try {
          const user = await AsyncStorage.getItem('User')
          const authToken = await AsyncStorage.getItem('AccessToken')
          const response = await axiosInstance.get(`http://192.168.0.101:8080/getCommunityByUser`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          })

          console.log(response.data);
          if(response.data){
            setMyCommunityData(response.data);
            
          } else {
            setMyCommunityData([]);
          }
          setShowMyCommunity(!showMyCommunity)
        } catch(err) {

        }
    }

    const handleLogout =  async () => {
        try {
            const username = await AsyncStorage.getItem('User')

            await axios.delete(`http://192.168.0.101:8080/removeSession/${username}`)
            dispatch(logout());
            await AsyncStorage.removeItem('AccessToken');
            await AsyncStorage.removeItem('RefreshToken');
            await AsyncStorage.removeItem('User');
        } catch (err) {
            console.log('Failed to logout', err);
        }
    }

    const handleReduxFollow = async () => {
      try {
          const authToken = await AsyncStorage.getItem('AccessToken');
          const response = await axiosInstance.post(
            `http://192.168.0.101:8080/create_follow/${following_owner}`,
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
          `http://192.168.0.101:8080/unFollow/${following_owner}`,
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
        const response = await axiosInstance.get('http://192.168.0.101:8080/getFollowing', {
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
    const fetchProfileData = async () => {
      try {
        const authUser = await AsyncStorage.getItem("User");
        console.log(authUser)
        const response = await axios.get(`http://192.168.0.101:8080/getProfile/${authUser}`);
        console.log("response data: ", response.data)
        console.log("Avatar Url: ", response.data.avatar_url)
        if (!response.data.avatar_url || response.data.avatar_url === '') {
          const usernameInitial = response.data.owner ? response.data.owner.charAt(0) : '';
          setDisplayText(usernameInitial.toUpperCase());
        } else {
          setDisplayText(''); // Reset displayText if the avatar is present
        }
       
        setProfileData(response.data)
      } catch (err) {
        console.error("unable to fetch the profile data: ", err);
      }
    }
    const handleClose = () => {
      navigation.navigate('Main')
    }
    useEffect(() =>{
        fetchFollowing(); 
        setIsFollowing(following.some((item) => item === following_owner))
        const verifyUser = async () => {
        const authUser = await AsyncStorage.getItem("User");
        console.log("Current User:", authUser)
        if(following_owner===undefined || following_owner === null) {
          setShowLogoutButton(true);
          setCurrentUser(authUser);
        } else {
          setCurrentUser(following_owner);
        }
      }
      fetchProfileData()
      verifyUser();
    }, [])

    useEffect( () => {
      const followerCount = async () => {
          const authToken = await AsyncStorage.getItem('AccessToken');
          const currentUser = await AsyncStorage.getItem("User");
          const response = await axiosInstance.get(`http://192.168.0.101:8080/getFollower`, {
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
        const response = await axiosInstance.get(`http://192.168.0.101:8080/getFollowing`, {
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

    return (
        <View style={tailwind`flex-1 bg-black`}>
                <View style={tailwind`h-20 flex-row items-end p-2 justify-between`}>
                  <Text style={tailwind`pl-30 font-bold text-lg text-white`}>Profile Menu</Text>
                  <Pressable onPress={handleClose} style={tailwind`pl-4`}>
                      <FontAwesome name="close" color="white" size={24} />
                  </Pressable>
              </View> 
              <View style={tailwind`mb-5 pl-5 items-left mt-5`}>
                {profileData.avatar_url ? (
                  <Image style={tailwind`w-20 h-20 mb-5 rounded-full bg-white`} source={{uri: profileData.avatar_url}} />
                ) : (
                  <View style={tailwind`w-20 h-20 aspect-w-1 aspect-h-1 rounded-12 bg-gray-500 items-center justify-cente`}>
                    <Text style={tailwind`text-red-500 text-12x2`}>
                      {displayText}
                    </Text>
                  </View>
                )}
                <Text style={tailwind`pt-5 pl-2 text-2xl font-bold text-left text-white`}>{profileData.full_name}</Text>
                <Text style={tailwind`pl-2 text-2xl text-white`}>@{currentUser}</Text>
                <View style={tailwind`flex-row justify-between content-center pl-2 pt-5 text-white`}>
                  <Text style={tailwind`flex-row font-bold text-lg text-white`}>{followerCount} Followers</Text>
                  <Text style={tailwind`flex-row font-bold text-lg text-white`}> | </Text>
                  <Text style={tailwind`flex-row font-bold text-lg text-white`}>{followingCount}  Following</Text>
                </View>
                <View style={tailwind`border-b border-white mt-2`}></View>
              </View>
              <View style={tailwind`mb-5 pl-5 items-left mt-5`}>
                <Pressable onPress={handleProfilePage} style={tailwind`pt-5 pl-2 font-bold text-left pb-2 `}>
                  <Text style={tailwind`text-2xl text-white`}>Profile</Text>
                </Pressable>
                <View style={tailwind`border-b border-white`}></View>
              </View>
              
              {/* creating new my community for having my own community  */}
              <View >
                {showLogoutButton && 
                <View style={tailwind` pl-6 items-left mt-5`}>
                      <Pressable style={tailwind`flex-row items-center`} onPress={toggleMyCommunity}>
                          <Text style={tailwind`text-2xl font-bold mr-10 text-white`}>My Community</Text>
                          <FontAwesome name={showMyCommunity?'angle-up':'angle-down'} size={20} color="white"/>
                      </Pressable>
                      {showMyCommunity && (
                        <View style={tailwind`mt-5`} > 
                          {myCommunityData.map((item,index)=> (
                            <Text style={tailwind`text-2xl my-0 text-white`}>{item.community_name}</Text>
                          ))}
                        </View>
                      )}
                </View>
                  }
                </View>
                <View style={tailwind`pl-5 mt-20`} >
                    <TouchableOpacity onPress={() => handleLogout()} style={tailwind`pl-20 bg-gray-500 p-4 rounded-2xl w-80 items-center`}>
                      <Text style={tailwind`text-white text-lg font-medium `}>Logout</Text>
                    </TouchableOpacity>
              </View>
        </View>
    );
} 

export default ProfileMenu;