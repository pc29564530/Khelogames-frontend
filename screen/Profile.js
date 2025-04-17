import React, {useState, useEffect, useCallback, useRef} from 'react';
import {View, Text, Pressable, TouchableOpacity, Alert, Dimensions, Modal} from 'react-native';
import { CurrentRenderContext, useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import {useSelector,useDispatch} from 'react-redux';
import { setFollowUser, setUnFollowUser, getFollowingUser, getProfile, checkIsFollowing} from '../redux/actions/actions';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import { AUTH_URL, BASE_URL } from '../constants/ApiConstants';
import TopTabProfile from '../navigation/TopTabProfile';
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

function Profile({route}) {
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const isFollowing = useSelector((state) => state.user.isFollowing)
    const profile = useSelector((state) => state.profile.profile)
    const navigation = useNavigation();
    const [profileData, setProfileData] = useState([]);
    const following = useSelector((state) => state.user.following);
    const [showEditProfileButton,setShowEditProfileButton] = useState(false);
    const [moreTabVisible, setMoreTabVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState('');
    const [displayText, setDisplayText] = useState('');
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const otherOwner  = route.params?.username;
    console.log("Profile: ", profile.full_name)

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
              following_owner:otherOwner
            },
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            }
          })
          if (connectionEstablished.data){
            navigation.navigate("Message", {profileData: profileData})
          } else {
            Alert.alert(
              "No Mutual Connection Found",
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

const addPlayerProfile = () => {
  navigation.navigate("CreatePlayerProfile");
}

  // navigation.setOptions({
  //   headerTitle:'',
  //   headerStyle:{
  //     backgroundColor: 'black'
  //   },
  //   headerTintColor: 'white',
  //   headerRight: ()=> (
  //     <Pressable onPress={() => addPlayerProfile()} style={tailwind`items-center p-2 border rounded-md bg-red-500 mr-4`}>
  //       <Text style={tailwind`text-white`}>Create Player</Text>
  //     </Pressable>
  //   )
  // })

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

    const { height: sHeight, width: sWidth } = Dimensions.get('screen');

    const scrollY = useSharedValue(0);

    const handleScroll = useAnimatedScrollHandler((e) => {
        scrollY.value = e.contentOffset.y;
      })
    
      const bgColor = 'white'
      const bgColor2 =  'rgb(248, 113, 113)'
      const headerInitialHeight = 100;
      const headerNextHeight = 50;
      const offsetValue = 100;
      const animatedHeader = useAnimatedStyle(() => {
        const height = interpolate(
          scrollY.value,
          [0, offsetValue],
          [headerInitialHeight, headerNextHeight],
          Extrapolation.CLAMP,
        )
    
        const backgroundColor = interpolateColor(
          scrollY.value,
          [0, offsetValue],
          [bgColor, bgColor2]
        )
        return {
          backgroundColor, height
        }
      })

      const nameAnimatedStyles = useAnimatedStyle(() => {
        const opacity = interpolate(
          scrollY.value,
          [0, 100, offsetValue],
          [0, 1, 1],
          Extrapolation.CLAMP,
        )
        const translateX = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0, 40],
          Extrapolation.CLAMP,
        )
        const translateY = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0, -5],
          Extrapolation.CLAMP,
        )
        return { opacity, transform: [{ translateX }, { translateY }] }
      })
      const animImage = useAnimatedStyle(() => {
        const yValue = 75;
        const translateY = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0, -80],
          Extrapolation.CLAMP,
        )
    
        const xValue = sWidth / 2 - (2 * 16) - 20;
        const translateX = interpolate(
          scrollY.value,
          [0, offsetValue],
          [0, -xValue],
          Extrapolation.CLAMP,
        )
    
        const scale = interpolate(
          scrollY.value,
          [0, offsetValue],
          [1, 0.3],
          Extrapolation.CLAMP,
        )
        return {
          transform: [{ translateY }, { translateX }, { scale }]
        }
      })

    return(
      <View style={tailwind`flex-1`}>
            <Animated.View style={[tailwind`flex-row`, animatedHeader]}>
              <TouchableOpacity onPress={() =>navigation.goBack()} style={tailwind`items-start top-2 px-2 `}>
                  <MaterialIcons name="arrow-back" size={22} color="black" />
              </TouchableOpacity>
              <Animated.View style={[tailwind`flex-1 justify-center`, nameAnimatedStyles]}>
                  <Text style={[tailwind`text-xl text-white`]}>{profile?.full_name}</Text>
              </Animated.View>
              <TouchableOpacity onPress={() => setMoreTabVisible(true)} style={tailwind`absolute right-0 top-2`}>
                  <MaterialIcons name="more-vert" size={22} color="black" />
              </TouchableOpacity>
            </Animated.View>
            <Animated.Image source={profile?.avatar_url || ''} style={[tailwind`w-32 h-32 rounded-full absolute z-20 self-center bg-red-200 top-10`, animImage]}/>
            <Animated.ScrollView
                onScroll={handleScroll}
                contentContainerStyle={{height:880}}
                scrollEnabled={true}
            >
                <View style={tailwind`flex-1 bg-white`}>
                  <View style={tailwind`items-center`}>
                    <View style={tailwind`mt-18`}>
                      <Text style={tailwind`text-2xl font-semibold text-black`}>{profile?.full_name}</Text>
                      <Text style={tailwind`text-gray-400 text-base`}>@{profile.owner}</Text>
                    </View>
                  </View>
                  <View style={tailwind`mt-2 items-center`}>
                    <View style={tailwind`flex-row items-center mb-4`}>
                      <Text style={tailwind`text-lg font-medium text-black`}>
                        {followerCount} Followers
                      </Text>
                      <Text style={tailwind`text-lg mx-2 text-gray-400`}>|</Text>
                      <Text style={tailwind`text-lg font-medium text-black`}>
                        {followingCount} Following
                      </Text>
                    </View>
                  </View>
                  <View style={tailwind` pl-2 pr-2`}>
                      <Pressable style={tailwind`bg-white text-white py-2 px-3 rounded-md w-full  text-center justify-center items-center shadow-lg`} onPress={() => handleMessage()}>
                        <Text style={tailwind`text-black text-xl font-bold`}>Message</Text>
                      </Pressable>
                  </View>
                  <View style={tailwind`flex-1 mt-6 bg-white rounded-t-2xl shadow-lg`}>
                    <TopTabProfile profileData={profile} />
                  </View>
                </View>
            </Animated.ScrollView>
            {moreTabVisible && (
              <Modal
                transparent
                visible={moreTabVisible}
                animationType="fade"
                onRequestClose={() => setMoreTabVisible(false)}
              >
                <Pressable
                  style={tailwind`flex-1 bg-black bg-opacity-30`}
                  onPress={() => setMoreTabVisible(false)}
                />
                <View
                  style={tailwind`absolute right-2 top-12 w-48 bg-white rounded-md shadow-lg p-4`}
                >
                  <TouchableOpacity
                    style={tailwind`py-2 border-b border-gray-200`}
                    onPress={() => {handleEditProfile()}}
                  >
                    <Text style={tailwind`text-black text-lg`}>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tailwind`py-2 border-b border-gray-200`}
                    onPress={() => {}}
                  >
                    <Text style={tailwind`text-black text-lg`}>Follow</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tailwind`py-2`}
                    onPress={() => {}}
                  >
                    <Text style={tailwind`text-black text-lg`}>Share Profile..</Text>
                  </TouchableOpacity>
                </View>
            </Modal>
            )}
        </View>
    );
}

export default Profile;