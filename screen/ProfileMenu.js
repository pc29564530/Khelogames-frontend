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
  const [error, setError] = useState({
    global: null,
    fields: {},
  });
  const user = useSelector(state => state.user.user)

  useEffect(() => {
    const roleStatus = async () => {
      const checkRole = await AsyncStorage.getItem('Role');
      setCurrentRole(checkRole);
    };
    roleStatus();
  }, []);

  const fetchProfileData = useCallback(async () => {
    try {
      const authPublicID = await AsyncStorage.getItem("UserPublicID");
      const response = await axios.get(`${AUTH_URL}/getProfile/${authPublicID}`);
      dispatch(getProfile(response.data.data));
      dispatch(setAuthProfilePublicID(response.data.data.public_id))
      setError({ global: null, fields: {} });
    } catch (err) {
      const backendErrors = err?.response?.data?.error?.fields || {};
      setError({
        global: err?.response?.data?.error?.message || "Unable to load profile.",
        fields: backendErrors,
      })
      console.error('Unable to fetch the profile data: ', err);
    }
  }, [dispatch]);

  useFocusEffect( useCallback(() => {
    fetchProfileData();
  }, [fetchProfileData]));

  useEffect(() => {
    const fetchCounts = async () => {
      const fetchFollowerCount = async () => {
        const response = await axiosInstance.get(`${BASE_URL}/getFollower`);
        const item = response.data;
        setFollowerCount(item.data.length);
      };

      const fetchFollowingCount = async () => {
        const response = await axiosInstance.get(`${BASE_URL}/getFollowing`);
        const item = response.data;
        setFollowingCount(item.data.length);
      };

      fetchFollowerCount();
      fetchFollowingCount();
    };

    fetchCounts();
  }, [axiosInstance]);

  const toggleMyCommunity = async () => {
    if (showMyCommunity) {
      setShowMyCommunity(false);
      return;
    }

    try {
      const response = await axiosInstance.get(`${BASE_URL}/getCommunityByUser`);
      setMyCommunityData(response.data || []);
      setShowMyCommunity(true);
      // Clear any previous errors
      setError({ global: null, fields: {} });
    } catch (err) {
      const backendErrors = err?.response?.data?.error?.fields || {};
      setError({
        global: err?.response?.data?.error?.message || "Unable to load communities. Please try again.",
        fields: backendErrors,
      })
      console.error("Unable to get community: ", err);
      setShowMyCommunity(false);
    }
  };

  const handleLogout = () => {
    logoutServies({ dispatch });
  };

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  const handleCommunityPage = (item) => {
    navigation.navigate('CommunityPage', { item: item, communityPublicID: item.public_id });
  };

  return (
    <View style={tailwind`flex-1 bg-white`}>
      {/* Error Banner */}
      {/* {error?.global && (
        <View style={tailwind`bg-red-50 border-b border-red-200 px-4 py-3`}>
          <View style={tailwind`flex-row items-center justify-between`}>
            <View style={tailwind`flex-1 flex-row items-center`}>
              <MaterialIcons name="error-outline" size={18} color="#DC2626" />
              <Text style={tailwind`text-red-700 text-sm ml-2 flex-1`}>{error.global}</Text>
            </View>
            <Pressable onPress={fetchProfileData} style={tailwind`ml-2 bg-red-500 px-3 py-1.5 rounded-lg`}>
              <Text style={tailwind`text-white text-xs font-semibold`}>Retry</Text>
            </Pressable>
          </View>
        </View>
      )} */}

      {/* Profile Header */}
      <View style={tailwind`items-center bg-red-400 pt-14 pb-8 rounded-b-3xl`}>
        {profile?.avatar_url ? (
          <Image style={tailwind`w-20 h-20 rounded-full border-3 border-white/30`} source={{ uri: profile.avatar_url }} />
        ) : (
          <View style={tailwind`w-20 h-20 rounded-full bg-white/20 items-center justify-center`}>
            <Text style={tailwind`text-white text-2xl font-bold`}>{profile?.full_name?.charAt(0)?.toUpperCase()}</Text>
          </View>
        )}
        <Text style={tailwind`mt-3 text-lg font-bold text-white`}>{profile?.full_name || 'Loading...'}</Text>
        <Text style={tailwind`text-white/100 text-sm mt-0.5`}>@{profile?.username || '...'}</Text>
        <View style={tailwind`flex-row mt-5 bg-white/15 rounded-2xl px-6 py-3`}>
          <Pressable style={tailwind`items-center px-4`}>
            <Text style={tailwind`text-white text-lg font-bold`}>{followerCount}</Text>
            <Text style={tailwind`text-white/100 text-sm mt-0.5`}>Followers</Text>
          </Pressable>
          <View style={tailwind`w-px bg-white/60 mx-2`} />
          <Pressable style={tailwind`items-center px-4`}>
            <Text style={tailwind`text-white text-lg font-bold`}>{followingCount}</Text>
            <Text style={tailwind`text-white/100 text-sm mt-0.5`}>Following</Text>
          </Pressable>
        </View>
      </View>

      {/* Menu */}
      <ScrollView style={tailwind`flex-1 bg-gray-50`}>
        <View style={tailwind`bg-white mx-4 mt-4 rounded-2xl overflow-hidden`} >
          {/* Menu Items */}
          <Pressable onPress={() => navigation.navigate('Profile', {profilePublicID: profile.public_id})} style={tailwind`flex-row items-center py-4 px-4 border-b border-gray-50`}>
            <MaterialIcons name="person-outline" size={22} color="#374151" />
            <Text style={tailwind`text-sm text-gray-900 ml-3 font-medium flex-1`}>Profile</Text>
            <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
          </Pressable>

          <Pressable onPress={() => handleNavigation('Club')} style={tailwind`flex-row items-center py-4 px-4 border-b border-gray-50`}>
            <MaterialIcons name="groups" size={22} color="#374151" />
            <Text style={tailwind`text-sm text-gray-900 ml-3 font-medium flex-1`}>Team</Text>
            <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
          </Pressable>

          <Pressable onPress={() => handleNavigation('Follow')} style={tailwind`flex-row items-center py-4 px-4`}>
            <MaterialIcons name="people-outline" size={22} color="#374151" />
            <Text style={tailwind`text-sm text-gray-900 ml-3 font-medium flex-1`}>Connections</Text>
            <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
          </Pressable>
        </View>

        {/* My Community Section */}
        <View style={tailwind`bg-white mx-4 mt-3 rounded-2xl overflow-hidden`}>
          <Pressable onPress={toggleMyCommunity} style={tailwind`flex-row items-center justify-between py-4 px-4`}>
            <View style={tailwind`flex-row items-center`}>
              <MaterialIcons name="forum" size={22} color="#374151" />
              <Text style={tailwind`text-sm font-medium text-gray-900 ml-3`}>My Communities</Text>
            </View>
            <MaterialIcons name={showMyCommunity ? 'expand-less' : 'expand-more'} size={22} color="#9CA3AF" />
          </Pressable>

          {showMyCommunity && (
            <View style={tailwind`border-t border-gray-50`}>
              {myCommunityData.length > 0 ? (
                myCommunityData.map((item, index) => (
                  <Pressable key={index} onPress={() => handleCommunityPage(item)} style={tailwind`flex-row items-center py-3 px-4 border-b border-gray-50`}>
                    {item?.media_url ? (
                      <Image source={{ uri: item.media_url }} style={tailwind`h-9 w-9 rounded-full bg-gray-100`} />
                    ) : (
                      <View style={tailwind`h-9 w-9 rounded-full bg-red-400 items-center justify-center`}>
                        <Text style={tailwind`text-xs text-white font-bold`}>{item.name.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <Text style={tailwind`text-sm text-gray-800 ml-3 font-medium flex-1`}>{item.name}</Text>
                    <MaterialIcons name="chevron-right" size={18} color="#D1D5DB" />
                  </Pressable>
                ))
              ) : (
                <View style={tailwind`items-center py-8 px-4`}>
                  <Text style={tailwind`text-gray-400 text-center text-xs`}>
                    No communities yet.{'\n'}Join or create one to get started!
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Logout */}
        <View style={tailwind`mx-4 mt-3 mb-8`}>
          <Pressable onPress={handleLogout} style={tailwind`flex-row items-center justify-center py-3.5 bg-white rounded-2xl`}>
            <MaterialIcons name="logout" size={18} color="#f87171" />
            <Text style={tailwind`text-red-400 text-sm font-semibold ml-2`}>Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

export default ProfileMenu;
