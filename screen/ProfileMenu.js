import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation, useRoute, useFocusEffect
 } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { getProfile, logout, setFollowUser, setUnFollowUser, setAuthProfilePublicID } from '../redux/actions/actions';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import { logoutServies } from '../services/authServies';
import { handleUser } from '../utils/ThreadUtils';

function ProfileMenu() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const profile = useSelector((state) => state.profile.profile);
  const [currentUser, setCurrentUser] = useState('');
  const [showMyCommunity, setShowMyCommunity] = useState(false);
  const [myCommunityData, setMyCommunityData] = useState([]);
  const [displayText, setDisplayText] = useState('');
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [currentRole, setCurrentRole] = useState('');
  const user = useSelector(state => state.user.user)

  useEffect(() => {
    const roleStatus = async () => {
      const checkRole = await AsyncStorage.getItem('Role');
      setCurrentRole(checkRole);
    };
    roleStatus();
  }, []);

  useFocusEffect( useCallback(() => {
    const fetchProfileData = async () => {
      try {
        const authPublicID = await AsyncStorage.getItem("UserPublicID");
        const response = await axios.get(`${AUTH_URL}/getProfile/${authPublicID}`);
        dispatch(getProfile(response.data));
        dispatch(setAuthProfilePublicID(response.data.public_id))
      } catch (err) {
        console.error('Unable to fetch the profile data: ', err);
      }
    };

    fetchProfileData();
  }, [dispatch]));

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
    logoutServies({ dispatch, navigation });
  };

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  const handleCommunityPage = (item) => {
    navigation.navigate('CommunityPage', { item: item, communityPublicID: item.public_id });
  };

  return (
    <View style={tailwind`flex-1`}>
      <View style={tailwind`mb-5 items-center bg-red-400 pt-4 pb-2`}>
        {profile?.avatar_url ? (
          <Image style={tailwind`w-28 h-28 mb-5 rounded-full`} source={{ uri: profile.avatar_url }} />
        ) : (
          <View style={tailwind`w-28 h-28 rounded-full bg-white items-center justify-center`}>
            <Text style={tailwind`text-red-500 text-4xl`}>{profile.full_name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Text style={tailwind`pt-5 text-2xl font-bold text-white`}>{profile?.full_name}</Text>
        <Text style={tailwind`text-xl text-white`}>@{profile?.username}</Text>
        <View style={tailwind`flex-row justify-center mt-5`}>
          <Text style={tailwind`text-lg text-white`}>{followerCount} Followers</Text>
          <Text style={tailwind`text-lg text-white mx-2`}>|</Text>
          <Text style={tailwind`text-lg text-white`}>{followingCount} Following</Text>
        </View>
      </View>
      <ScrollView>
        <View style={tailwind`mt-5 p-4`}>
          <Pressable onPress={() => navigation.navigate('Profile', {profilePublicID: profile.public_id})} style={tailwind`flex-row items-center py-2`}>
            <FontAwesome name="user" size={24} color="#F87171" />
            <Text style={tailwind`text-2xl text-black pl-4`}>Profile</Text>
          </Pressable>

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
                <Pressable key={index} onPress={() => handleCommunityPage(item)} style={tailwind`flex-row items-center mb-2 gap-2`}>
                  {item?.media_url ? (
                    <Image source="" style={tailwind`h-12 w-12 bg-red-400 rounded-lg`} />
                  ):(
                    <View style={tailwind`h-10 w-10 bg-red-400 rounded-full items-center justify-center`}>
                      <Text style={tailwind`text-lg text-white`}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  <Text style={tailwind`text-xl text-black`}>{item.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
        <View style={tailwind`mt-10 items-center`}>
          <TouchableOpacity onPress={() => handleLogout()} style={tailwind`bg-red-400 p-4 rounded-xl w-40 items-center`}>
            <Text style={tailwind`text-white text-lg font-medium`}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

export default ProfileMenu;
