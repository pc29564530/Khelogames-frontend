import React, { useEffect, useState, useLayoutEffect } from 'react';
import { ScrollView, View, Text, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { setThreads } from '../redux/actions/actions';
import { BASE_URL } from '../constants/ApiConstants';
import tailwind from 'twrnc';
import ThreadItem from '../components/ThreadItems';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { handleLikes, handleThreadComment, handleUser } from '../utils/ThreadUtils';

const UserThreads = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [threadWithUserProfile, setThreadWithUserProfile] = useState([]);
  const [hasReplies, setHasReplies] = useState(true);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState({
    global: null,
    fields: {},
  });

  const authProfile = useSelector(state => state.profile.authProfile);
  const currentProfile = useSelector(state => state.profile.currentProfile);

  // Header setup
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={tailwind`text-lg font-semibold text-slate-100`}>
          Posts
        </Text>
      ),
      headerStyle: {
        backgroundColor: '#0f172a',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: '#f1f5f9',
      headerTitleAlign: 'center',
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()} style={tailwind`ml-4`}>
          <AntDesign name="arrowleft" size={22} color="#f1f5f9" />
        </Pressable>
      ),
    });
  }, [navigation]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const authToken = await AsyncStorage.getItem('AccessToken');

      const response = await axiosInstance.get(
        `${BASE_URL}/getThreadByUser/${currentProfile.public_id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const item = response.data;

      if (!item.data || item.data.length === 0) {
        setHasReplies(false);
        setThreadWithUserProfile([]);
      } else {
        setThreadWithUserProfile(item.data);
        setHasReplies(true);
      }

    } catch (err) {
      setError({
        global: 'Failed to load threads. Please try again later.',
        fields: err?.response?.data?.error || {},
      });

      console.error("Failed to get thread by user:", err);

      setHasReplies(false);
      setThreadWithUserProfile([]);

    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [authProfile.public_id]);

  if (threadWithUserProfile.length === 0 && error.global) {
    return (
      <View style={tailwind`mx-4 mt-6 p-4 bg-slate-800 border border-slate-700 rounded-xl`}>
        <Text style={tailwind`text-red-400 text-sm`}>
          {error.global}
        </Text>
      </View>
    );
  }

  return (
    <View style={tailwind`flex-1 bg-slate-900`}>

      {loading ? (
        <View style={tailwind`py-20 items-center justify-center`}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={tailwind`text-slate-400 mt-3`}>
            Loading threads...
          </Text>
        </View>
      ) : !hasReplies || threadWithUserProfile.length === 0 ? (

        <View style={tailwind`py-16 items-center justify-center bg-slate-800 rounded-2xl mx-4 my-6`}>
          <MaterialIcons name="forum" size={60} color="#64748b" />

          <Text style={tailwind`text-slate-100 text-lg font-semibold mt-4`}>
            No Threads Yet
          </Text>

          <Text style={tailwind`text-slate-400 text-sm mt-2 text-center px-8`}>
            {authProfile.public_id
              ? "This user hasn't posted any threads yet."
              : "Start sharing your thoughts with the community!"}
          </Text>
        </View>

      ) : (

        <ScrollView
          style={tailwind`flex-1 bg-slate-900`}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              colors={['#ef4444']}
              tintColor="#ef4444"
            />
          }
        >
          <View style={tailwind`pb-6`}>
            {threadWithUserProfile.map((item, i) => (
              <ThreadItem
                key={item.public_id || i}
                item={item}
                handleLikes={handleLikes}
                handleThreadComment={handleThreadComment}
                handleUser={handleUser}
              />
            ))}
          </View>
        </ScrollView>

      )}

    </View>
  );
};

export default UserThreads;