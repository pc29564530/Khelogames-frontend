import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {
  getAllCommunities,
  getJoinedCommunity,
  addJoinedCommunity
} from '../redux/actions/actions';

import { handleInlineError } from '../utils/errorHandler';

import {
  fetchCommunityJoinedByUserService,
  fetchAllCommunityService,
  addUserToCommunity
} from '../services/communityServices';

function Community() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [error, setError] = useState({ global: null, fields: {} });
  const [loading, setLoading] = useState(false);

  const joinedCommunity = useSelector((state) => state.joinedCommunity.joinedCommunity || []);
  const community = useSelector((state) => state.community.community || []);

  useEffect(() => {
    fetchCommunityJoinedByUser();
    fetchData();
  }, []);

  const fetchCommunityJoinedByUser = async () => {
    try {
      setLoading(true);
      const response = await fetchCommunityJoinedByUserService();
      dispatch(getJoinedCommunity(response.data || []));
    } catch (err) {
      setError({ global: 'Unable to load joined communities', fields: {} });
      console.error('Unable to get the joined communities', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetchAllCommunityService();
      dispatch(getAllCommunities(response.data || []));
    } catch (err) {
      setError({ global: 'Unable to load communities', fields: {} });
      console.error('Unable to get all communities', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async (communityPublicID) => {
    try {
      const res = await addUserToCommunity({ communityPublicID });
      if(res.success && res.data) {
        dispatch(addJoinedCommunity(res.data));
      }
    } catch (err) {
      const errorMessage = handleInlineError(err);
      setError({ global: errorMessage || 'Unable to join community', fields: {} });
      console.error('Unable to add user to community', err);
    }
  };

  const handleCommunityPage = (item) => {
    navigation.navigate('CommunityPage', {
      item,
      communityPublicID: item.public_id
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={tailwind`pb-10`}
    >

      {/* Create Community Banner */}
      <View
        style={[
          tailwind`mx-4 mt-4 mb-4 rounded-2xl p-5`,
          { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }
        ]}
      >
        <View style={tailwind`flex-row items-center mb-3`}>
          <View
            style={[
              tailwind`w-10 h-10 rounded-full items-center justify-center mr-3`,
              { backgroundColor: '#334155' }
            ]}
          >
            <MaterialIcons name="group-add" size={22} color="#f87171" />
          </View>

          <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '700' }}>
            Create a Community
          </Text>
        </View>

        <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
          Connect with people who share your passion for sports.
        </Text>

        <Pressable
          onPress={() => navigation.navigate('CreateCommunity')}
          style={[tailwind`py-3 rounded-xl items-center`, { backgroundColor: '#ef4444' }]}
        >
          <Text style={tailwind`text-white font-semibold text-sm`}>
            Get Started
          </Text>
        </Pressable>
      </View>

      {/* Section Header */}
      <View style={tailwind`flex-row items-center justify-between px-4 mb-3`}>
        <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15 }}>
          Communities For You
        </Text>

        {loading && <ActivityIndicator size="small" color="#ef4444" />}
      </View>

      {/* Error */}
      {error.global && (
        <View
          style={[
            tailwind`mx-4 mb-3 p-3 rounded-xl flex-row items-center`,
            { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#ef4444' }
          ]}
        >
          <MaterialIcons name="error-outline" size={16} color="#f87171" />
          <Text style={{ color: '#f87171', marginLeft: 8, flex: 1 }}>
            {error.global}
          </Text>
        </View>
      )}

      {/* Empty State */}
      {!loading && community.length === 0 && !error.global && (
        <View style={tailwind`mx-4 mt-6 items-center`}>
          <View
            style={[
              tailwind`w-16 h-16 rounded-full items-center justify-center mb-3`,
              { backgroundColor: '#1e293b' }
            ]}
          >
            <MaterialIcons name="people-outline" size={32} color="#94a3b8" />
          </View>

          <Text style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: 4 }}>
            No Communities Yet
          </Text>

          <Text style={{ color: '#94a3b8', fontSize: 13 }}>
            Be the first to create a community!
          </Text>
        </View>
      )}

      {/* Community List */}
      <View style={tailwind`px-4 gap-3`}>
        {community.map((item, i) => {

          const isJoined = joinedCommunity?.some(
            c => c.public_id === item.public_id
          );

          return (
            <View
              key={i}
              style={[
                tailwind`rounded-2xl p-4 flex-row items-center`,
                { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }
              ]}
            >

              {/* Avatar */}
              <View
                style={[
                  tailwind`w-12 h-12 rounded-full items-center justify-center mr-3`,
                  { backgroundColor: '#334155' }
                ]}
              >
                <Text style={{ color: '#f87171', fontSize: 18, fontWeight: '700' }}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              {/* Name */}
              <Pressable
                style={tailwind`flex-1`}
                onPress={() => handleCommunityPage(item)}
              >
                <Text
                  style={{ color: '#f1f5f9', fontWeight: '600' }}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                {item.description && (
                  <Text
                    style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}
                    numberOfLines={1}
                  >
                    {item.description}
                  </Text>
                )}
              </Pressable>

              {/* Join Button */}
              <Pressable
                onPress={() => !isJoined && handleJoinCommunity(item.public_id)}
                style={[
                  tailwind`px-4 py-2 rounded-xl ml-2`,
                  isJoined
                    ? { backgroundColor: '#334155' }
                    : tailwind`bg-red-400`
                ]}
              >
                <Text
                  style={[
                    tailwind`text-xs font-semibold`,
                    { color: isJoined ? '#cbd5e1' : '#ffffff' }
                  ]}
                >
                  {isJoined ? 'Joined' : 'Join'}
                </Text>
              </Pressable>

            </View>
          );

        })}
      </View>

    </ScrollView>
  );
}

export default Community;