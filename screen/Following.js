import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { getFollowingUser } from '../redux/actions/actions';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../constants/ApiConstants';

// Components
import UserListItem from '../components/follow/UserListItem';
import EmptyState from '../components/follow/EmptyState';
import LoadingState from '../components/follow/LoadingState';
import ErrorState from '../components/follow/ErrorState';

function Following() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState({
    global: null,
    fields: {},
  });

  const following = useSelector((state) => state.user.following);
  const fetchFollowing = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const response = await axiosInstance.get(`${BASE_URL}/getFollowing`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const item = response.data;
      if (item?.success && item?.data != null) {
        dispatch(getFollowingUser(item.data?.data));
      }
    } catch (err) {
      setError({
        global: "Unable to get follower",
        fields: err?.response?.data?.error.fields || {},
      });
      console.error("Unable to get following user: ", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFollowing();
  }, []);

  const handleRefresh = () => {
    fetchFollowing(true);
  };

  const handleProfile = (profilePublicID) => {
    navigation.navigate('Profile', { profilePublicID });
  };

  if (loading && !refreshing) {
    return <LoadingState />;
  }

  if (error.global && !following?.length) {
    return <ErrorState message={error.global} onRetry={() => fetchFollowing()} />;
  }

  if (!loading && !following?.length) {
    return <EmptyState type="following" />;
  }

  return (
    <ScrollView
      style={tailwind`flex-1 bg-slate-900`}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#ef4444']}
          tintColor="#ef4444"
        />
      }
    >
      <View style={tailwind`bg-slate-900`}>
        {following.length > 0 && following?.map((item, index) => (
          <UserListItem
            key={item?.public_id || index}
            user={item}
            onPress={() => handleProfile(item?.public_id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

export default Following;