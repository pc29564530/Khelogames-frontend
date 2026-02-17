import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { View, Text, ScrollView, Pressable, TouchableOpacity, Image, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { getProfile, logout, setFollowUser, setUnFollowUser, setAuthProfilePublicID, setCurrentProfile, setAuthUserPublicID, setAuthProfile, checkIsFollowing } from '../redux/actions/actions';
import axiosInstance, { authAxiosInstance } from './axios_config';
import tailwind from 'twrnc';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import { logoutServies } from '../services/authServies';
import { handleUser } from '../utils/ThreadUtils';
import { current } from '@reduxjs/toolkit';
import ToastManager from '../utils/ToastManager';

function Profile({route}) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { profilePublicID } = route?.params || {};
  const authUserPublicID = useSelector(state => state.profile.authUserPublicID);
  const profilePublicIDFromStore = useSelector(state => state.profile.authProfilePublicID);
  const currentProfile = useSelector(state => state.profile.currentProfile);
  const authProfile = useSelector(state => state.profile.authProfile);
  const isFollowing = useSelector((state) => state.user.isFollowing)
  const profile = useSelector((state) => state.profile.profile);
  const [currentUser, setCurrentUser] = useState('');
  const [showMyCommunity, setShowMyCommunity] = useState(false);
  const [myCommunityData, setMyCommunityData] = useState([]);
  const [displayText, setDisplayText] = useState('');
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [currentRole, setCurrentRole] = useState('');
  const [moreTabVisible, setMoreTabVisible] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    global: null,
    fields: {},
  });
  const user = useSelector(state => state.user.user)

  useEffect(() => {
    setIsOwner(profilePublicID === profilePublicIDFromStore);
  }, [profilePublicID, profile]);

  useEffect(() => {
    const roleStatus = async () => {
      const checkRole = await AsyncStorage.getItem('Role');
      setCurrentRole(checkRole);
    };
    roleStatus();
  }, []);

  const checkIsFollowingFunc = async () => {
    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const response = await axiosInstance.get(`${BASE_URL}/isFollowing/${currentProfile.public_id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      dispatch(checkIsFollowing(response.data.data));
    } catch (err) {
      ToastManager.show('Failed to update. Please try again.', 'error');
      console.error("Unable to check is_following: ", err);
    }
  };

  // Fetch follower and following counts by current profile
  const fetchFollowerCount = async (targetPublicID) => {
    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const response = await axiosInstance.get(`${BASE_URL}/getFollowerCount/${targetPublicID}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      setFollowerCount(response.data?.data || 0);
    } catch (err) {
      console.error("Unable to fetch follower count: ", err);
    }
  };

  const fetchFollowingCount = async (targetPublicID) => {
    try {
      setLoading(true);
      const authToken = await AsyncStorage.getItem('AccessToken');
      const response = await axiosInstance.get(`${BASE_URL}/getFollowingCount/${targetPublicID}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      setFollowingCount(response.data?.data || 0);
    } catch (err) {
      console.error("Unable to fetch following count: ", err);
    } finally {
      setLoading(false);
    }
  };

const handleReduxFollow = async () => {
  setLoading(true);
  try {
    const authToken = await AsyncStorage.getItem('AccessToken');

    const response = await axiosInstance.post(
      `${BASE_URL}/create_follow/${profilePublicID}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Update Redux state
    if (response?.data) {
      dispatch(setFollowUser(response.data.data));
    } else {
      dispatch(setFollowUser([]));
    }

    // Update follower count & isFollowing status
    try { await checkIsFollowingFunc(); } catch {}
    try { await fetchFollowerCount(profilePublicID || currentProfile.public_id); } catch {}
    ToastManager.show('User followed successfully!', 'success');
  } catch (err) {
    console.error('Follow user failed:', err);
    ToastManager.show('Failed to follow user. Please try again.', 'error');
  } finally {
    setLoading(false);
  }
};

const handleReduxUnFollow = async () => {
  setLoading(true);
  try {
    const authToken = await AsyncStorage.getItem('AccessToken');

    const response = await axiosInstance.delete(
      `${BASE_URL}/unFollow/${profilePublicID}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Update Redux state
    if (response?.data) {
      dispatch(setUnFollowUser(response.data.data));
    } else {
      dispatch(setUnFollowUser([]));
    }

    // Update follower count & isFollowing status
    try { await checkIsFollowingFunc(); } catch {}
    try { await fetchFollowerCount(profilePublicID || currentProfile.public_id); } catch {}

    ToastManager.show('User unfollowed successfully!', 'info');
  } catch (err) {
    console.error('Unfollow user failed:', err);
    ToastManager.show('Failed to unfollow user. Please try again.');
  } finally {
    setLoading(false);
  }
};


  const handleFollowButton = async () => {
    if(isFollowing?.is_following) {
       handleReduxUnFollow();
    } else {
       handleReduxFollow();
    } 
  }

  const fetchProfileData = async () => {
    try {
      const targetPublicID = profilePublicID || profilePublicIDFromStore
      const response = await axiosInstance.get(`${AUTH_URL}/getProfileByPublicID/${targetPublicID}`);
      dispatch(setCurrentProfile(response.data.data));
      setError({ global: null, fields: {} });
    } catch (err) {
      const backendErrors = err?.response?.data?.error?.fields || {};
      setError({
        global: err?.response?.data?.error?.message || "Unable to load profile.",
        fields: backendErrors,
      })
      console.error('Unable to fetch the profile data: ', err);
    }
  };

  useFocusEffect( useCallback(() => {
    fetchProfileData();
  }, [profilePublicID, profilePublicIDFromStore, dispatch]));

  useFocusEffect(
    React.useCallback(() => {
      fetchFollowerCount(currentProfile.public_id);
      fetchFollowingCount(currentProfile.public_id);
      if(currentProfile?.public_id !== authProfile?.public_id) {
        checkIsFollowingFunc();
      }
    }, [currentProfile?.public_id, authProfile?.public_id])
  );

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

  const handleMessage = () => {
    navigation.navigate('Messages', { recipientProfile: currentProfile });
  };

  return (
    <View style={tailwind`flex-1 bg-white`}>
      {/* Custom Header - With Conditional Follow Button */}
      <View style={tailwind`bg-red-400 flex-row items-center justify-between px-4 py-3`}>
        {/* Back Button */}
        <Pressable onPress={() => navigation.goBack()} style={tailwind`items-center justify-center w-10 h-10`}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </Pressable>

        {authProfile.public_id !== currentProfile.public_id && (
          <Pressable onPress={handleFollowButton} style={tailwind`items-center justify-center px-4 py-2 rounded-full ${isFollowing?.is_following ? 'bg-white/20' : 'bg-white'}`}>
            <Text style={tailwind`text-sm font-medium ${isFollowing?.is_following ? 'text-white' : 'text-red-400'}`}>
              {isFollowing?.is_following ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
        )}

        {/* Right Side: Follow Button OR More Menu */}
        {authProfile.public_id === currentProfile.public_id && (
          <View style={tailwind`flex-row items-center gap-2`}>
            <Pressable onPress={() => setMoreTabVisible(true)} style={tailwind`items-center justify-center w-10 h-10`}>
              <MaterialIcons name="more-vert" size={24} color="white"/>
            </Pressable>
          </View>
        )}
      </View>

      {/* Profile Header */}
      <View style={tailwind`items-center bg-red-400 pt-4 pb-8 rounded-b-3xl`}>
        {currentProfile?.avatar_url ? (
          <Image style={tailwind`w-20 h-20 rounded-full border-3 border-white/30`} source={{ uri: currentProfile.avatar_url }} />
        ) : (
          <View style={tailwind`w-20 h-20 rounded-full bg-white/20 items-center justify-center`}>
            <Text style={tailwind`text-white text-2xl font-bold`}>{currentProfile?.full_name?.charAt(0)?.toUpperCase()}</Text>
          </View>
        )}
        <Text style={tailwind`mt-3 text-lg font-bold text-white`}>{currentProfile?.full_name || 'Loading...'}</Text>
        <Text style={tailwind`text-white/100 text-sm mt-0.5`}>@{currentProfile?.username || '...'}</Text>
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

          <Pressable onPress={() => navigation.navigate("PlayerProfile", {publicID: currentProfile?.public_id, from: "profile_menu"})}style={tailwind`flex-row items-center py-4 px-4`}>
              <FontAwesome name="soccer-ball-o" size={22} color="#374151" />
              <Text style={tailwind`text-sm text-gray-900 ml-3 font-medium flex-1`}>Player Stats</Text>
              <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
          </Pressable>
          {authProfile.public_id === currentProfile.public_id && (
            <Pressable onPress={() => handleNavigation('Follow')} style={tailwind`flex-row items-center py-4 px-4`}>
              <MaterialIcons name="people-outline" size={22} color="#374151" />
              <Text style={tailwind`text-sm text-gray-900 ml-3 font-medium flex-1`}>Connections</Text>
              <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
            </Pressable>
          )}

          <Pressable onPress={() => navigation.navigate("UserThreads", {from: "profile" })} style={tailwind`flex-row items-center py-4 px-4 border-t border-gray-50`}>
              <AntDesign name="profile" size={22} color="#374151" />
              <Text style={tailwind`text-sm text-gray-900 ml-3 font-medium flex-1`}>Posts</Text>
              <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
          </Pressable>
        </View>

        {/* {isPlayer && ( */}
          <View style={tailwind`bg-white mx-4 mt-3 rounded-2xl overflow-hidden`}>
            
          </View>
        {/* )} */}

        {/* My Community Section */}
        <View style={tailwind`bg-white mx-4 mt-3 rounded-2xl overflow-hidden`}>
          <Pressable onPress={toggleMyCommunity} style={tailwind`flex-row items-center justify-between py-4 px-4`}>
            <View style={tailwind`flex-row items-center`}>
              <MaterialIcons name="forum" size={22} color="#374151" />
              <Text style={tailwind`text-sm font-medium text-gray-900 ml-3`}>Communities</Text>
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
        {authProfile.public_id === currentProfile.public_id && (
            <View style={tailwind`mx-4 mt-3 mb-8`}>
              <Pressable onPress={handleLogout} style={tailwind`flex-row items-center justify-center py-3.5 bg-white rounded-2xl`}>
                <MaterialIcons name="logout" size={18} color="#f87171" />
                <Text style={tailwind`text-red-400 text-sm font-semibold ml-2`}>Log Out</Text>
              </Pressable>
            </View>
        )}
      </ScrollView>
      {moreTabVisible && (
        <Modal
          transparent
          visible={moreTabVisible}
          animationType="fade"
          onRequestClose={() => setMoreTabVisible(false)}
        >
          <Pressable
            style={tailwind`flex-1 bg-black bg-opacity-50`}
            onPress={() => setMoreTabVisible(false)}
          >
            <View
              style={tailwind`absolute right-4 top-16 w-56 bg-white rounded-2xl shadow-2xl overflow-hidden`}
              onStartShouldSetResponder={() => true}
            >
              {/* Own Profile Menu */}
              {authProfile.public_id === currentProfile.public_id ? (
                <>
                  <TouchableOpacity
                    style={tailwind`flex-row items-center py-4 px-4 border-b border-gray-100`}
                    onPress={() => {
                      setMoreTabVisible(false);
                      navigation.navigate('EditProfile', {from: "profile_menu"});
                    }}
                  >
                    <MaterialIcons name="edit" size={20} color="#374151" />
                    <Text style={tailwind`text-gray-900 text-base ml-3 font-medium`}>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tailwind`flex-row items-center py-4 px-4 border-b border-gray-100`}
                    onPress={() => {
                      setMoreTabVisible(false);
                      navigation.navigate('Settings');
                    }}
                  >
                    <MaterialIcons name="settings" size={20} color="#374151" />
                    <Text style={tailwind`text-gray-900 text-base ml-3 font-medium`}>Settings</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tailwind`flex-row items-center py-4 px-4`}
                    onPress={() => {
                      setMoreTabVisible(false);
                      // Add share functionality
                    }}
                  >
                    <MaterialIcons name="share" size={20} color="#374151" />
                    <Text style={tailwind`text-gray-900 text-base ml-3 font-medium`}>Share Profile</Text>
                  </TouchableOpacity>
                </>
              ) : (
                /* Other Profile Menu */
                <>
                  <TouchableOpacity
                    style={tailwind`flex-row items-center py-4 px-4 border-b border-gray-100`}
                    onPress={() => {
                      setMoreTabVisible(false);
                      handleFollowButton();
                    }}
                  >
                    <MaterialIcons
                      name={isFollowing?.is_following ? "person-remove" : "person-add"}
                      size={20}
                      color="#374151"
                    />
                    <Text style={tailwind`text-gray-900 text-base ml-3 font-medium`}>
                      {isFollowing?.is_following ? 'Unfollow' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tailwind`flex-row items-center py-4 px-4 border-b border-gray-100`}
                    onPress={() => {
                      setMoreTabVisible(false);
                      handleMessage();
                    }}
                  >
                    <MaterialIcons name="message" size={20} color="#374151" />
                    <Text style={tailwind`text-gray-900 text-base ml-3 font-medium`}>Send Message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tailwind`flex-row items-center py-4 px-4 border-b border-gray-100`}
                    onPress={() => {
                      setMoreTabVisible(false);
                      // Add share functionality
                    }}
                  >
                    <MaterialIcons name="share" size={20} color="#374151" />
                    <Text style={tailwind`text-gray-900 text-base ml-3 font-medium`}>Share Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tailwind`flex-row items-center py-4 px-4`}
                    onPress={() => {
                      setMoreTabVisible(false);
                    }}
                  >
                    <MaterialIcons name="report" size={20} color="#DC2626" />
                    <Text style={tailwind`text-red-600 text-base ml-3 font-medium`}>Report User</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </Pressable>
      </Modal>
      )}
    </View>
  );
}

export default Profile;

