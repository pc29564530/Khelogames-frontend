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

// Following Screen
// Displays list of users that the authenticated user follows

function Following() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // State
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Redux
  const following = useSelector((state) => state.user.following);

  // Fetch following users from API
  const fetchFollowing = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const response = await axiosInstance.get(`${BASE_URL}/getFollowing`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      });

      const item = response.data;
      if (item.success) {
        dispatch(getFollowingUser(item.data || []));
      }
    } catch (err) {
      setError({
        global: "Unable to get follower",
        fields: err?.response.data?.error || {}
      });
      console.error("Unable to get following user: ", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchFollowing();
  }, []);

  // Handle pull to refresh
  const handleRefresh = () => {
    fetchFollowing(true);
  };

  // Navigate to user profile
  const handleProfile = (profilePublicID) => {
    navigation.navigate('Profile', { profilePublicID });
  };

  // Render loading state
  if (loading && !refreshing) {
    return <LoadingState />;
  }

  // Render error state
  if (error && !following?.length) {
    return <ErrorState message={error} onRetry={() => fetchFollowing()} />;
  }

  // Render empty state
  if (!loading && !following?.length) {
    return <EmptyState type="following" />;
  }

  // Render list
  return (
    <ScrollView
      style={tailwind`flex-1 bg-gray-50`}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#f87171']}
          tintColor="#f87171"
        />
      }
    >
      <View style={tailwind`bg-white`}>
        {following?.map((item, index) => (
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

export default Following;