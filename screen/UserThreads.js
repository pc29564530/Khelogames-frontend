import React, { useEffect, useState } from 'react';
import {ScrollView, View, Text, ActivityIndicator, RefreshControl, Pressable} from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import axiosInstance from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import { setThreads } from '../redux/actions/actions';
import { BASE_URL, AUTH_URL } from '../constants/ApiConstants';
import tailwind from 'twrnc';
import ThreadItem from '../components/ThreadItems';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { handleLikes, handleThreadComment, handleUser } from '../utils/ThreadUtils';

const UserThreads = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const likesCount = useSelector((state) => state.Like)
    const [threadWithUserProfile, setThreadWithUserProfile] = useState([]);
    const [hasReplies, setHasReplies] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const authProfile = useSelector(state => state.profile.authProfile);
    const currentProfile = useSelector(state => state.profile.currentProfile);

    const fetchData = async () => {
      try {
        setLoading(true);
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(`${BASE_URL}/getThreadByUser/${currentProfile.public_id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        const item = response.data;
        if (item.data === null || item.data.length === 0) {
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
        })
        console.error("Failed to get thread by user: ", err)
        setHasReplies(false);
        setThreadWithUserProfile([]);
      } finally {
        setLoading(false);
      }
    }

    const onRefresh = () => {
      fetchData();
    }

    useEffect(() => {
      fetchData();
    }, [authProfile.public_id]); 

    navigation.setOptions({
        headerTitle: () => (
            <Text style={tailwind`text-xl font-bold text-white`}>Posts</Text>
        ),
        headerStyle: {
            backgroundColor: tailwind.color('red-400'),
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        },
        headerTintColor: 'white',
        headerTitleAlign: 'center',
        headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()} style={tailwind`ml-4`}>
                <AntDesign name="arrowleft" size={24} color="white" />
            </Pressable>
        ),
    });
    
    if(threadWithUserProfile.length === 0 && error.global) {
        return (
                <View style={tailwind`mx-4 mb-3 p-3 bg-gray-50 border border-gray-200 rounded-xl`}>
                    <Text style={tailwind`text-red-400 text-sm`}>
                        {error.global}
                    </Text>
                </View>
        )
    }

    return (
        <View style={tailwind`flex-1`}>
          {loading ? (
            <View style={tailwind`py-20 items-center justify-center`}>
              <ActivityIndicator size="large" color="#EF4444" />
              <Text style={tailwind`text-gray-500 mt-3`}>Loading threads...</Text>
            </View>
          ) : !hasReplies || threadWithUserProfile.length === 0 ? (
            <View style={tailwind`py-16 items-center justify-center bg-gray-50 rounded-2xl mx-4 my-4`}>
              <MaterialIcons name="forum" size={64} color="#D1D5DB" />
              <Text style={tailwind`text-gray-900 text-lg font-semibold mt-4`}>No Threads Yet</Text>
              <Text style={tailwind`text-gray-500 text-sm mt-2 text-center px-8`}>
                {authProfile.public_id ? 'This user hasn\'t posted any threads yet.' : 'Start sharing your thoughts with the community!'}
              </Text>
            </View>
          ) : (
            <ScrollView
              style={tailwind`flex-1 bg-white`}
              showsVerticalScrollIndicator={false}
            >
              <View style={tailwind`pb-4`}>
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
