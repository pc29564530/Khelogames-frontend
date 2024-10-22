import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, TextInput, Image, StyleSheet, Pressable, TouchableOpacity, StatusBar, ScrollView, Alert} from 'react-native';
import { CurrentRenderContext, useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useSelector,useDispatch} from 'react-redux';
import { setFollowUser, setUnFollowUser, getFollowingUser, getProfile, checkIsFollowing} from '../redux/actions/actions';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import { AUTH_URL, BASE_URL } from '../constants/ApiConstants';
import TopTabProfile from '../navigation/TopTabProfile';

function Profile({route}) {
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const isFollowing = useSelector((state) => state.user.isFollowing)
    const profile = useSelector((state) => state.profile.profile)
    const navigation = useNavigation();
    const [profileData, setProfileData] = useState([]);
    const following = useSelector((state) => state.user.following);
    const [showEditProfileButton,setShowEditProfileButton] = useState(false);
    const [currentUser, setCurrentUser] = useState('');
    const [displayText, setDisplayText] = useState('');
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const otherOwner  = route.params?.username;

    useFocusEffect(
      React.useCallback(() => {
        fetchFollowing();
        verifyUser();
        fetchData()
      }, [])
    )

    useEffect(() => {
      checkIsFollowingFunc()
    }, [dispatch]); 

    const checkIsFollowingFunc = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/isFollowing`, {
              params: {
                following_owner: otherOwner
              },
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            dispatch(checkIsFollowing(response.data));
        } catch (err) {
            console.error("Unable to check is_following: ", err);
        }
    };

    const handleReduxFollow = async () => {
      try {
          const authToken = await AsyncStorage.getItem('AccessToken');
          const response = await axiosInstance.post(`${BASE_URL}/create_follow/${otherOwner}`,{},{
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          if(!response.data ||  response.data === null ){
            dispatch(setFollowUser([]));
          } else {
            dispatch(setFollowUser(response.data));
            checkIsFollowingFunc()
          }
      } catch (err) {
          console.error(err);
      }
     
    };
    const handleReduxUnFollow = async () => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.delete(
          `${BASE_URL}/unFollow/${otherOwner}`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if(!response.data ||  response.data === null ){
          dispatch(setUnFollowUser([]));
        } else {
          dispatch(setUnFollowUser(response.data));
          checkIsFollowingFunc()
        }
    } catch(e){
      console.error('Unable to unfollow agian', e);
    }
  };

  const handleFollowButton = async () => {
    if(isFollowing.is_following) {
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
      if(otherOwner === owner){
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
        const response = await axios.get(`${AUTH_URL}/getProfile/${otherOwner}`)
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

  

  const verifyUser = async () => {
    const authUser = await AsyncStorage.getItem("User");
    if(otherOwner === authUser) {
      setShowEditProfileButton(true);
      setCurrentUser(authUser);
    } else {
      setCurrentUser(otherOwner);
    }
  }

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

  // handle message used to open the message box
  const handleMessage = async () => {
    try {
          const authToken = await AsyncStorage.getItem("AccessToken");
          const currentUser = await AsyncStorage.getItem("User");
          const data = {
            following_owner:currentUser,
            follower_owner:otherOwner
          }
          const connectionEstablished  = await axiosInstance.get(`${BASE_URL}/checkConnection`, {
            params: {
              following_owner:currentUser,
              follower_owner:otherOwner
            },
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            }
          })
          console.log("check; ", connectionEstablished.data)
          if (connectionEstablished.data){
            navigation.navigate("Message", {profileData: profileData})
          } else {
            Alert.alert(
              "Connection Error",
              `You are not followed by ${otherOwner}. You cannot send a message.`,
              [{ text: "OK" }]
            )
          }
    } catch (err) {
        console.error("Failed to connect the user: ", err)
    }
    
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

  const isFollowingConditionCheck = () => {
  if(isFollowing.is_following) {
    return 'Following'
  } else {
    return 'Follow'
  }
}

useEffect(() => {
  console.log("isFollowing state changed: ", isFollowing);
}, [isFollowing]);

    return(
      <ScrollView contentContainerStyle={{height:900}}>
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
                <Pressable style={tailwind`bg-gray-500 text-gray-500 py-2 px-3 rounded-md w-2/5 text-center items-center z-10`} onPress={() => handleMessage()}>
                  <Text style={tailwind`text-white text-xl font-bold`}>Message</Text>
                </Pressable>
                <TouchableOpacity style={tailwind`bg-gray-500 text-gray-500 py-3 px-3 rounded-md w-2/5 text-center items-center z-10`} onPress={() => handleFollowButton()}>
                <Text style={ tailwind`text-white text-xl font-bold`}>{isFollowingConditionCheck()}</Text>
                    
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