import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import {
  View, Text, ScrollView, Pressable,
  ActivityIndicator, Image, RefreshControl,
} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

// Team captain sees all pending player join requests — can Accept or Reject
const TeamJoinRequests = ({ route }) => {
  const { team } = route.params;
  const navigation = useNavigation();
  const game = useSelector(state => state.sportReducers.game);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingID, setUpdatingID] = useState(null);
  const [error, setError] = useState({global: null, fields: {}});

  const fetchRequests = useCallback(async () => {
    try {
      setError({global: null, fields: {}});
      const res = await axiosInstance.get(
        `${BASE_URL}/${game.name}/get-team-join-requests/${team.public_id}`,
      );
      setRequests(res.data?.data ?? []);
    } catch (err) {
      console.log('Failed to fetch team join requests:', err);
      setError({global: 'Unable to get join requests', fields: {}});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [team.public_id, game.name]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleUpdate = async (requestPublicID, status) => {
    setUpdatingID(requestPublicID);
    try {
      await axiosInstance.put(
        `${BASE_URL}/${game.name}/update-team-join-request`,
        { public_id: requestPublicID, status },
      );
      setRequests(prev => prev.filter(r => r.public_id !== requestPublicID));
    } catch (err) {
      console.log(`Failed to ${status} request:`, err);
      setError({global: 'Unable to update status requests', fields: {}});
    } finally {
      setUpdatingID(null);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '600' }}>
          Join Team Requests
        </Text>
      ),
      headerStyle: {
        backgroundColor: '#1e293b',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: '#e2e8f0',
      headerTitleAlign: 'center',
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()} style={tailwind`ml-4`}>
          <AntDesign name="arrowleft" size={24} color="#e2e8f0" />
        </Pressable>
      ),
    });
  }, [navigation]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#f87171" size="large" />
      </View>
    );
  }

  const handlePlayerProfile = (item) => {
    navigation.navigate("PlayerProfile", {publicID: item?.public_id, from: "team"})
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      contentContainerStyle={tailwind`px-4 py-5`}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
          tintColor="#f87171" colors={['#f87171']} />
      }>

      {/* Section header — "PENDING REQUESTS N" + "See All" */}
      <View style={tailwind`flex-row items-center justify-between mb-4`}>
        <Text style={{ color: '#f1f5f9', fontSize: 13, fontWeight: '700', letterSpacing: 0.8 }}>
          PENDING REQUESTS {requests.length}
        </Text>
      </View>

      {/* Error banner */}
      {error.global && (
        <View style={[tailwind`rounded-xl p-3 mb-4`,
          { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
          <Text style={{ color: '#fca5a5', fontSize: 13 }}>{error}</Text>
        </View>
      )}

      {/* Empty state */}
      {requests.length === 0 && !error && (
        <View style={tailwind`items-center py-16`}>
          <MaterialIcons name="inbox" size={52} color="#1e293b" />
          <Text style={{ color: '#475569', fontSize: 15, marginTop: 12 }}>
            No join requests yet
          </Text>
          <Text style={{ color: '#334155', fontSize: 13, marginTop: 4 }}>
            Players requesting to join will appear here
          </Text>
        </View>
      )}

      {/* Request cards */}
      {requests.map((req) => {
        const isUpdating = updatingID === req.public_id;
        const player = req.player;

        const subtitle = [
          player?.positions
            ? (Array.isArray(player.positions)
                ? player.positions.join(', ')
                : player.positions)
            : null,
          player?.country,
        ].filter(Boolean).join(' · ');

        return (
          <Pressable
            key={player.public_id}
            onPress = {() => {handlePlayerProfile(player)}}
            style={[
              tailwind`mb-3 rounded-2xl px-4 py-3 flex-row items-center`,
              { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
            ]}>

            {/* Rounded-square avatar */}
            {player?.media_url ? (
              <Image
                source={{ uri: player.media_url }}
                style={{ width: 52, height: 52, borderRadius: 12 }}
              />
            ) : (
              <View style={{
                width: 52, height: 52, borderRadius: 12,
                backgroundColor: '#0f172a',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ color: '#f87171', fontSize: 20, fontWeight: '700' }}>
                  {player?.name?.charAt(0)?.toUpperCase() ?? '?'}
                </Text>
              </View>
            )}

            {/* Player info */}
            <View style={tailwind`ml-3 flex-1`}>
              <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15 }} numberOfLines={1}>
                {player?.name ?? 'Unknown Player'}
              </Text>
              <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                Join team request
              </Text>
              {!!subtitle && (
                <Text style={{ color: '#475569', fontSize: 11, marginTop: 1 }} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
              {!!req.message && (
                <Text
                  style={{ color: '#475569', fontSize: 11, marginTop: 3, fontStyle: 'italic' }}
                  numberOfLines={2}>
                  "{req.message}"
                </Text>
              )}
            </View>

            {/* Accept / Reject icon buttons */}
            {isUpdating ? (
              <ActivityIndicator color="#f87171" size="small" style={tailwind`ml-3`} />
            ) : (
              <View style={tailwind`flex-row ml-3`}>
                {/* Accept — green checkmark */}
                <Pressable
                  onPress={() => handleUpdate(req.public_id, 'accepted')}
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    backgroundColor: '#052e16',
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 8,
                  }}>
                  <MaterialIcons name="check" size={20} color="#4ade80" />
                </Pressable>

                {/* Reject — red X */}
                <Pressable
                  onPress={() => handleUpdate(req.public_id, 'rejected')}
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    backgroundColor: '#2d0a0a',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                  <MaterialIcons name="close" size={20} color="#f87171" />
                </Pressable>
              </View>
            )}
          </Pressable>
        );
      })}

    </ScrollView>
  );
};

export default TeamJoinRequests;
