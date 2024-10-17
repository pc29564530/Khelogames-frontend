import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Image, StyleSheet, Pressable, TouchableOpacity, StatusBar} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useSelector,useDispatch} from 'react-redux';
import { setFollowUser, setUnFollowUser, getFollowingUser, getProfile} from '../redux/actions/actions';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import { AUTH_URL, BASE_URL } from '../constants/ApiConstants';
import TopTabProfile from '../navigation/TopTabProfile';
import { ScrollView } from 'react-native-gesture-handler';

function Profile({route}) {
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const profile = useSelector((state) => state.profile.profile)
    const navigation = useNavigation();
    const [profileData, setProfileData] = useState([]);
    const following = useSelector((state) => state.user.following);
    const [showEditProfileButton,setShowEditProfileButton] = useState(false);
    const [currentUser, setCurrentUser] = useState('');
    const [displayText, setDisplayText] = useState('');
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const following_owner  = route.params?.username;

    const handleReduxFollow = async () => {
      try {
          const authToken = await AsyncStorage.getItem('AccessToken');
          const response = await axiosInstance.post(`${BASE_URL}/create_follow/${following_owner}`,{},{
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
          `${BASE_URL}/unFollow/${following_owner}`,
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
        const response = await axiosInstance.get(`${BASE_URL}/getFollowing`, {
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

  const fetchData = async () => {
    try {
      const owner = await AsyncStorage.getItem('User')
      if (!owner) {
        console.log("User not found in AsyncStorage.");
        return;
      }
      if(following_owner === owner){
        const response = await axios.get(`${AUTH_URL}/getProfile/${owner}`);
        if (response.data === null) {
          setProfileData([]);
        } else {
          dispatch(getProfile(response.data))
          setProfileData(response.data)

          if(!response.data.avatar_url || response.data.avatar_url === '') {

            const usernameInitial = response.data.owner ? response.data.owner.charAt(0) : '';
            setDisplayText(usernameInitial.toUpperCase());
            
          } else {
            setDisplayText('');
          }
        }
      } else {
        const response = await axios.get(`${AUTH_URL}/getProfile/${following_owner}`)
       if( response.data == null ){
          setProfileData([])
        } else {
          setProfileData(response.data);
          dispatch(getProfile(response.data))
          if(!response.data.avatar_url || response.data.avatar_url === '') {
            const usernameInitial = response.data.owner ? response.data.owner.charAt(0) : '';
            setDisplayText(usernameInitial.toUpperCase());
          } else {
            setDisplayText('');
          }
        }
      }
    } catch(e) {
      console.error("unable to fetch the profile details", e)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      fetchFollowing();
      const verifyUser = async () => {
        const authUser = await AsyncStorage.getItem("User");
        if(following_owner === authUser) {
          setShowEditProfileButton(true);
          setCurrentUser(authUser);
        } else {
          setCurrentUser(following_owner);
        }
      }
      verifyUser();
      fetchData()
    }, [])
  )

  useEffect( () => {
    const followerCount = async () => {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const currentUser = await AsyncStorage.getItem("User");
        const response = await axiosInstance.get(`${BASE_URL}/getFollower`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          }
        });

        const item = response.data;
        if(item !== null && item.length > 0) {
          setFollowerCount(item.length);
        }
    }
    const followingCount = async () => {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const currentUser = await AsyncStorage.getItem("User");
      const response = await axiosInstance.get(`${BASE_URL}/getFollowing`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      });
      const item = response.data;
      if(item !== null && item.length > 0) {
        setFollowingCount(item.length);
      }
  }
    followerCount();
    followingCount()
  }, [])

  const handleMessage = () => {
    navigation.navigate("Message", {profileData: profileData})
  }

  const handleEditProfile = () => {
    navigation.navigate('EditProfile')
  };

  navigation.setOptions({
    headerTitle:'',
    headerStyle:{
      backgroundColor: 'black'
    },
    headerTintColor: 'white'
  })
    return(
      <ScrollView contentContainerStyle={{height:900}}>
        {/* <View style={tailwind`w-full`}>
            {profileData.cover_url ? (
                <Image
                    style={tailwind`h-60 w-full bg-yellow-500`}
                    source={{uri:profileData.cover_url}}
                />
            ):(
              <Image 
                style={tailwind`h-60 w-full bg-yellow-500`}
                source={CoverImage}
              />
            )}
            
        </View>  */}
        <View style={tailwind`flex-1 p-4 bg-black`}>
          <View style={tailwind`flex-row gap-8`}>
            {profile && profile.avatar_url ? (
                  <Image style={tailwind`w-20 h-20 mb-5 rounded-full bg-gray-500`} source={{uri: profile.avatar_url}} />
              ) : (
                <View style={tailwind`w-20 h-20 rounded-12 bg-white items-center justify-evenly`}>
                  <Text style={tailwind`text-red-500 text-12x2`}>
                    {displayText}
                  </Text>
                </View>
            )}
            <View >
              <Text style={tailwind`text-3xl mb-1 mt-4 text-white`}>{profile.full_name}</Text>
              <Text style={tailwind`text-xl mb-1 text-white`}>@{profile.owner}</Text>
            </View>  
          </View>
            
          <View style={tailwind`flex-row justify-between content-center pl-2 pt-5 text-black`}>
              <Text style={tailwind`flex-row text-lg text-white `}>{followerCount}  Followers</Text>
              <Text style={tailwind`flex-row text-lg text-white`}> | </Text>
              <Text style={tailwind`flex-row text-lg text-white`}>{followingCount}  Following</Text>
          </View>
          <Text style={tailwind`text-xl mb-5 text-white`}>{profile.bio}</Text>

          <View style={tailwind`flex-1`}>
            {showEditProfileButton ? (
            <>
              <Pressable style={tailwind`items-center p-2 border rounded-md bg-red-500 `} onPress={() => handleEditProfile() }>
                  <Text style={ tailwind`text-white text-xl font-bold`}>Edit Profile</Text>
              </Pressable>
              <View style={tailwind`flex-1`}>
                <TopTabProfile profileData={profile}/>
              </View>
            </>
            ) : (
              <>
              <View style={tailwind` p-2  flex-row gap-5`}>
                <Pressable style={tailwind`bg-gray-500 text-gray-500 py-2 px-3 rounded-md w-2/5 text-center items-center z-10`} onPress={handleMessage}>
                  <Text style={tailwind`text-white text-xl font-bold`}>Message</Text>
                </Pressable>
                <TouchableOpacity style={tailwind`bg-gray-500 text-gray-500 py-3 px-3 rounded-md w-2/5 text-center items-center z-10`} onPress={handleFollowButton}>
                    <Text style={ tailwind`text-white text-xl font-bold`}>{following.some((item) => item === following_owner) ? 'Following' : 'Follow'}</Text>
                </TouchableOpacity>
              </View>
              <View style={tailwind`flex-1`}>
                <TopTabProfile profileData={profile}/>
              </View>
              </>
            )}
          </View>
        </View>
  </ScrollView>
    );
}

export default Profile;