import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { getProfile, logout, setFollowUser, setUnFollowUser } from '../redux/actions/actions';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import { logoutServies } from '../services/authServies';
import { handleUser } from '../utils/ThreadUtils';

function ProfileMenu() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const axiosInstance = useAxiosInterceptor();
  const route = useRoute();
  const following_owner = route.params?.username;

  const following = useSelector((state) => state.user.following);
  const profile = useSelector((state) => state.profile.profile);

  const [isFollowing, setIsFollowing] = useState(following.some((item) => item === following_owner));
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
      const checkRole = await AsyncStorage.getItem('Role');
      setCurrentRole(checkRole);
    };
    roleStatus();
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const authUser = await AsyncStorage.getItem("User");
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

    fetchProfileData();
  }, [dispatch]);

  useFocusEffect(
    React.useCallback(() => {
      setIsFollowing(following.some((item) => item === following_owner));
      const verifyUser = async () => {
        const authUser = await AsyncStorage.getItem('User');
        if (!following_owner) {
          setShowLogoutButton(true);
          setCurrentUser(authUser);
        } else {
          setCurrentUser(following_owner);
        }
      };
      verifyUser();
    }, [following_owner, following])
  );

  useEffect(() => {
    const fetchCounts = async () => {
      const authToken = await AsyncStorage.getItem('AccessToken');

      const fetchFollowerCount = async () => {
        const response = await axiosInstance.get(`${BASE_URL}/getFollower`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        setFollowerCount(response.data.length);
      };

      const fetchFollowingCount = async () => {
        const response = await axiosInstance.get(`${BASE_URL}/getFollowing`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        setFollowingCount(response.data.length);
      };

      fetchFollowerCount();
      fetchFollowingCount();
    };

    fetchCounts();
  }, [axiosInstance]);

  const toggleMyCommunity = async () => {
    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const response = await axiosInstance.get(`${BASE_URL}/getCommunityByUser`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      setMyCommunityData(response.data || []);
      setShowMyCommunity((prev) => !prev);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logoutServies({ dispatch });
  };

  const handleFollowButton = async () => {
    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      if (isFollowing) {
        await axiosInstance.delete(`${BASE_URL}/unFollow/${following_owner}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        dispatch(setUnFollowUser(following_owner));
      } else {
        const response = await axiosInstance.post(
          `${BASE_URL}/create_follow/${following_owner}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        dispatch(setFollowUser(response.data));
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  const handleCommunityPage = (item) => {
    navigation.navigate('CommunityPage', { communityData: item });
  };

  return (
    <View style={tailwind`flex-1`}>
      <View style={tailwind`mb-5 items-center bg-red-400 pt-4 pb-2`}>
        {profileData.avatar_url ? (
          <Image style={tailwind`w-32 h-32 mb-5 rounded-full`} source={{ uri: profileData.avatar_url }} />
        ) : (
          <View style={tailwind`w-32 h-32 rounded-full bg-white items-center justify-center`}>
            <Text style={tailwind`text-red-500 text-4xl`}>{displayText}</Text>
          </View>
        )}
        <Text style={tailwind`pt-5 text-2xl font-bold text-white`}>{profileData.full_name}</Text>
        <Text style={tailwind`text-xl text-white`}>@{currentUser}</Text>
        <View style={tailwind`flex-row justify-center mt-5`}>
          <Text style={tailwind`text-lg text-white`}>{followerCount} Followers</Text>
          <Text style={tailwind`text-lg text-white mx-2`}>|</Text>
          <Text style={tailwind`text-lg text-white`}>{followingCount} Following</Text>
        </View>
      </View>
      <ScrollView>
        <View style={tailwind`mt-5 p-4`}>
          <Pressable onPress={() => handleUser({username: profileData.owner, navigation})} style={tailwind`flex-row items-center py-2`}>
            <FontAwesome name="user" size={24} color="#F87171" />
            <Text style={tailwind`text-2xl text-black pl-4`}>Profile</Text>
          </Pressable>

          {/* {currentRole === 'admin' && ( */}
            {/* <Pressable onPress={() => handleNavigation('CreatePlayerProfile')} style={tailwind`flex-row items-center py-2`}>
              <FontAwesome name="user" size={24} color="white" />
              <Text style={tailwind`text-2xl text-white pl-4`}>Player Profile</Text>
            </Pressable> */}
          {/* )} */}

          <Pressable onPress={() => handleNavigation('Club')} style={tailwind`flex-row items-center py-2`}>
            <AntDesign name="team" size={24} color="#F87171" />
            <Text style={tailwind`text-2xl text-black pl-4`}>Team</Text>
          </Pressable>

          <Pressable onPress={() => handleNavigation('Follow')} style={tailwind`flex-row items-center py-2`}>
            <MaterialIcons name="connect-without-contact" size={25} color="#F87171"/>
            <Text style={tailwind`text-2xl text-black pl-4`}>Follow</Text>
          </Pressable>
        </View>

        <View style={tailwind`mt-5 p-4`}>
          <Pressable onPress={toggleMyCommunity} style={tailwind`flex-row items-center justify-between`}>
            <Text style={tailwind`text-2xl font-bold text-black`}>My Community</Text>
            <FontAwesome name={showMyCommunity ? 'angle-up' : 'angle-down'} size={24} color="#F87171" />
          </Pressable>

          {showMyCommunity && (
            <ScrollView style={tailwind`mt-5`}>
              {myCommunityData.map((item, index) => (
                <Pressable key={index} onPress={() => handleCommunityPage(item)} style={tailwind`flex-row items-center mb-2`}>
                  <Image source="" style={tailwind`h-12 w-12 bg-red-500 rounded-md mr-4`} />
                  <Text style={tailwind`text-2xl text-black`}>{item.community_name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {showLogoutButton && (
          <View style={tailwind`mt-10 items-center`}>
            <TouchableOpacity onPress={handleLogout} style={tailwind`bg-red-400 p-4 rounded-xl w-40 items-center`}>
              <Text style={tailwind`text-white text-lg font-medium`}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default ProfileMenu;
