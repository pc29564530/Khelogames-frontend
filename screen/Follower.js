import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import tailwind from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { getFollowerUser } from '../redux/actions/actions';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../constants/ApiConstants';

// Components
import UserListItem from '../components/follow/UserListItem';
import EmptyState from '../components/follow/EmptyState';
import LoadingState from '../components/follow/LoadingState';
import ErrorState from '../components/follow/ErrorState';

function Follower() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState({ global: null, fields: {} });

  const follower = useSelector((state) => state.user.follower);

  const fetchFollower = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const authToken = await AsyncStorage.getItem('AccessToken');

      const response = await axiosInstance.get(`${BASE_URL}/getFollower`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const item = response.data;

      if (item.success && item.data != null) {
        dispatch(getFollowerUser(item.data));
      }
    } catch (err) {
      setError({
        global: "Unable to get follower",
        fields: err?.response?.data?.error || {},
      });
      console.error("Unable to get follower: ", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFollower();
  }, []);

  const handleRefresh = () => {
    fetchFollower(true);
  };

  const handleProfile = (profilePublicID) => {
    navigation.navigate('Profile', { profilePublicID });
  };

  if (loading && !refreshing) {
    return <LoadingState />;
  }

  if (error.global && !follower?.length) {
    return <ErrorState message={error.global} onRetry={() => fetchFollower()} />;
  }

  if (!loading && !follower?.length) {
    return <EmptyState type="followers" />;
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
        {follower?.map((item, index) => (
          <UserListItem
            key={item?.profile?.public_id || index}
            user={item}
            onPress={() => handleProfile(item?.profile?.public_id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

export default Follower;