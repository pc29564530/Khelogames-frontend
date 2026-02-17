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

  // State
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState({global: null, fields: {}});

  // Redux
  const follower = useSelector((state) => state.user.follower);

  const fetchFollower = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const response = await axiosInstance.get(`${BASE_URL}/getFollower`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      });

      const item = response.data;
      if (item.success) {
        dispatch(getFollowerUser(item.data || []));
      }
    } catch (err) {
      setError({
        global: "Unable to get follower",
        fields: err?.response.data?.error || {}
      })
      console.error("Unable to get follower: ", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchFollower();
  }, []);

  //Handle pull to refresh
  const handleRefresh = () => {
    fetchFollower(true);
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
  if (error && !follower?.length) {
    return <ErrorState message={error} onRetry={() => fetchFollower()} />;
  }

  // Render empty state
  if (!loading && !follower?.length) {
    return <EmptyState type="followers" />;
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
