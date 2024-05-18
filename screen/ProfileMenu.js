import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { getProfile, logout, setFollowUser, setUnFollowUser } from '../redux/actions/actions';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import AddPlayerToClub from '../components/AddPlayerToClub';
const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');
import { logoutServies } from '../services/authServies';

function ProfileMenu() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const axiosInstance = useAxiosInterceptor();
  
  const route = useRoute();
  const following_owner = route.params?.username;

  const following = useSelector((state) => state.user.following);

  const [isFollowing, setIsFollowing] = useState(following.some((item) => item === following_owner));
  const profile = useSelector((state) => state.profile.profile)
  const [showLogoutButton, setShowLogoutButton] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [showMyCommunity, setShowMyCommunity] = useState(false);
  const [myCommunityData, setMyCommunityData] = useState([]);
  const [profileData, setProfileData] = useState([]);
  const [displayText, setDisplayText] = useState('');
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [currentRole, setCurrentRole] = useState('');

  useEffect(() => {
    const roleStatus = async () => {
        const checkRole = await AsyncStorage.getItem('Role')
        setCurrentRole(checkRole);
    }
    roleStatus();
  }, [])

  const handleProfilePage = () => {
    navigation.navigate('Profile', {username: currentUser});
  };

  const toggleMyCommunity = async () => {
    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const response = await axiosInstance.get(`${BASE_URL}/getCommunityByUser`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data) {
        setMyCommunityData(response.data);
      } else {
        setMyCommunityData([]);
      }
      setShowMyCommunity(!showMyCommunity);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout =  () => {
    logoutServies({dispatch: dispatch});
  };

  const handleReduxFollow = async () => {
    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const response = await axiosInstance.post(
        `${BASE_URL}/create_follow/${following_owner}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.statusCode === 200) {
        dispatch(setFollowUser(response.data));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReduxUnFollow = async () => {
    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const response = await axiosInstance.delete(
        `${BASE_URL}/unFollow/${following_owner}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.statusCode === 200) {
        dispatch(setUnFollowUser(response.data));
      }
    } catch (e) {
      console.error('Unable to unfollow again', e);
    }
  };

  const handleFollowButton = async () => {
    if (isFollowing) {
      handleReduxUnFollow();
    } else {
      handleReduxFollow();
    }
  };

  const fetchProfileData = async () => {
    try {
      const authUser = await AsyncStorage.getItem('User');
      console.log(authUser);
      const response = await axios.get(`${AUTH_URL}/getProfile/${authUser}`);
      if (!response.data.avatar_url || response.data.avatar_url === '') {
        const usernameInitial = response.data.owner ? response.data.owner.charAt(0) : '';
        setDisplayText(usernameInitial.toUpperCase());
      } else {
        setDisplayText('');
      }
      dispatch(getProfile(response.data));
      setProfileData(response.data);
    } catch (err) {
      console.error('Unable to fetch the profile data: ', err);
    }
  };

  const handleMyCommunityList = (item) => {
    navigation.navigate('CommunityPage', {communityData: item})
  }

  useFocusEffect(
    React.useCallback(()=>{
      setIsFollowing(following.some((item) => item === following_owner));
      const verifyUser = async () => {
        const authUser = await AsyncStorage.getItem('User');
        if (following_owner === undefined || following_owner === null) {
          setShowLogoutButton(true);
          setCurrentUser(authUser);
        } else {
          setCurrentUser(following_owner);
        }
      };
      fetchProfileData();
      verifyUser();
    }, [])
  );

  useEffect(() => {
    const followerCount = async () => {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const response = await axiosInstance.get(`${BASE_URL}/getFollower`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const item = response.data;
      if (item !== null && item.length > 0) {
        setFollowerCount(item.length);
      }
    };
    const followingCount = async () => {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const response = await axiosInstance.get(`${BASE_URL}/getFollowing`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const item = response.data;
      if (item !== null && item.length > 0) {
        setFollowingCount(item.length);
      }
    };
    followerCount();
    followingCount();
  }, []);

  const handleClubPage = () => {
    navigation.navigate('Club')
  }

  const handleTournamentPage = () => {
    navigation.navigate("Tournament");
  }

  const addPlayerProfile = () => {
    navigation.navigate("AddPlayerToClub");
  }

  return (
    <View style={tailwind`flex-1 bg-black p-4`}>

      <View style={tailwind`mb-5 items-left mt-5`}>
        {profileData && profileData.avatar_url ? (
          <Image style={tailwind`w-30 h-30 mb-5 rounded-full bg-red-500`} source={{uri: profileData.avatar_url}} />
        ) : (
          <View style={tailwind`w-20 h-20 aspect-w-1 aspect-h-1 rounded-12 bg-white items-center justify-cente`}>
            <Text style={tailwind`text-red-500 text-12x2`}>{displayText}</Text>
          </View>
        )}
        <Text style={tailwind`pt-5 pl-2 text-2xl font-bold text-left text-white`}>{profileData.full_name}</Text>
        <Text style={tailwind`pl-2 text-2xl text-white`}>@{currentUser}</Text>
        <View style={tailwind`flex-row justify-between content-center pl-2 pr-2 pt-5 text-white`}>
          <Text style={tailwind` text-lg text-white`}>{followerCount} Followers</Text>
          <Text style={tailwind` text-lg text-white`}> | </Text>
          <Text style={tailwind` text-lg text-white`}>{followingCount} Following</Text>
        </View>
        <View style={tailwind`border-b border-white mt-2`}></View>
      </View>
      <ScrollView style={tailwind}>
          {/* // profile and other content list */}
          <View style={tailwind`mb-1 items-left mt-1`}>
            <Pressable onPress={handleProfilePage} style={tailwind`pt-1 pl-2 font-bold text-left pb-1 flex-row`}>
              <FontAwesome name='user' size={24} color="white" style={tailwind`mt-1`} />
              <Text style={tailwind`text-2xl text-white pl-4`}>Profile</Text>
            </Pressable>
            {currentRole === "admin" && (
                <Pressable onPress={addPlayerProfile} style={tailwind`pt-1 pl-2 font-bold text-left pb-1 flex-row`}>
                  <FontAwesome name='user' size={24} color="white" style={tailwind`mt-1`} />
                  <Text style={tailwind`text-2xl text-white pl-4`}>Player Profile</Text>
                </Pressable>
            )}
            <Pressable onPress={handleClubPage} style={tailwind`pt-1 pl-2 font-bold text-left pb-1 flex-row`}>
              <AntDesign name='team' size={24} color="white" style={tailwind`mt-1`} />
              <Text style={tailwind`text-2xl text-white pl-4`}>Club/Team</Text>
            </Pressable>
            <Pressable onPress={handleTournamentPage} style={tailwind`pt-1 pl-2 font-bold text-left pb-1 flex-row`}>
              <MaterialCommunityIcons name='tournament' size={24} color="white" style={tailwind`mt-1`} />
              <Text style={tailwind`text-2xl text-white pl-4`}>Tournament</Text>
            </Pressable>
            <View style={tailwind`border-b border-white`}></View>
          </View>
          {/* //My Community List */}
          <View style={tailwind`pl-6 items-left mt-5`}>
            <Pressable style={tailwind`flex-row items-center`} onPress={toggleMyCommunity}>
              <Text style={tailwind`text-2xl font-bold mr-10 text-white`}>My Community</Text>
              <FontAwesome name={showMyCommunity ? 'angle-up' : 'angle-down'} size={20} color="white" />
            </Pressable>
            {showMyCommunity && (
              <ScrollView style={tailwind`mt-5`}>
                {myCommunityData.map((item, index) => (
                  <Pressable key={index} style={tailwind`flex-row `} onPress={() => handleMyCommunityList(item)}>
                    <Image source={logoPath} style={tailwind`h-10 w-10 bg-red-500 rounded-md`}/>
                    <Text key={index} style={tailwind`text-2xl my-0 text-white`}>
                      {item.community_name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
          <View style={tailwind`pl-5 mt-10`}>
            <TouchableOpacity onPress={() => handleLogout()} style={tailwind`pl-30 bg-gray-500 p-4 rounded-2xl w-40 items-center`}>
              <Text style={tailwind`text-white text-lg font-medium`}>Logout</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

export default ProfileMenu;