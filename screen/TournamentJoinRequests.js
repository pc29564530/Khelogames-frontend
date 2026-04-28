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

// Organizer sees all pending join requests — can Accept or Reject
const TournamentJoinRequests = ({ route }) => {
  const navigation = useNavigation();
  const { tournament } = route.params;
  const game = useSelector(state => state.sportReducers.game);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingID, setUpdatingID] = useState(null); // which request is being updated
  const [error, setError] = useState({
    global: null,
    fields: {},
  });

  const fetchRequests = useCallback(async () => {
    try {
      setError(null);
      const res = await axiosInstance.get(
        `${BASE_URL}/${game.name}/get-tournament-join-requests/${tournament.public_id}`,
      );
      setRequests(res.data?.data ?? []);
    } catch (err) {
      console.log('Failed to fetch tournament join requests:', err);
      setError({
        global: "Unable to get tournament join requests",
        fields: {}
      })
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tournament.public_id, game.name]);

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
        `${BASE_URL}/${game.name}/update-tournament-join-request`,
        { public_id: requestPublicID, status: status },
      );
      // Remove from list after accept/reject
      setRequests(prev => prev.filter(r => r.public_id !== requestPublicID));
    } catch (err) {
      console.log(`Failed to ${status} request:`, err);
      setError({
        global: "Unable to update tournament join requests",
        fields: {}
      })
    } finally {
      setUpdatingID(null);
    }
  };

    useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '600' }}>
          Join Requests
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

  const handleClub = (item) => {
      navigation.navigate('ClubPage', { teamData: item, game: game });
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      contentContainerStyle={tailwind`px-4 py-4`}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
          tintColor="#f87171" colors={['#f87171']} />
      }>

      {/* Header */}
      <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
        {requests.length} pending {requests.length === 1 ? 'request' : 'requests'}
      </Text>

      {/* Error banner */}
      {!!error && (
        <View style={[tailwind`rounded-xl p-3 mb-4`,
          { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
          <Text style={{ color: '#fca5a5', fontSize: 13 }}>{error}</Text>
        </View>
      )}

      {/* Empty state */}
      {requests.length === 0 && !error && (
        <View style={tailwind`items-center py-16`}>
          <MaterialIcons name="inbox" size={48} color="#334155" />
          <Text style={{ color: '#475569', fontSize: 15, marginTop: 12 }}>
            No join requests yet
          </Text>
        </View>
      )}

      {/* Request cards */}
      {requests.map((req) => {
        const isUpdating = updatingID === req.public_id;
        return (
          <View key={req.public_id}
            style={[tailwind`mb-3 rounded-2xl p-4`,
              { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>

            {/* Team info */}
            <Pressable onPress={() => handleClub(req)} style={tailwind`flex-row items-center mb-3`}>
              {req.team?.media_url ? (
                <Image source={{ uri: req.team.media_url }}
                  style={tailwind`w-12 h-12 rounded-full`} />
              ) : (
                <View style={[tailwind`w-12 h-12 rounded-full items-center justify-center`,
                  { backgroundColor: '#334155' }]}>
                  <MaterialIcons name="group" size={24} color="#64748b" />
                </View>
              )}
              <View style={tailwind`ml-3 flex-1`}>
                <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15 }}>
                  {req.team?.name ?? 'Unknown Team'}
                </Text>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                  {req.team?.player_count ? `${req.team.player_count} players` : ''}
                  {req.team?.country ? ` · ${req.team.country}` : ''}
                </Text>
              </View>
            </Pressable>

            {/* Optional message from team */}
            {!!req.message && (
              <Text style={[tailwind`mb-3 text-sm px-1`,
                { color: '#64748b', fontStyle: 'italic' }]}>
                "{req.message}"
              </Text>
            )}

            {/* Accept / Reject */}
            <View style={tailwind`flex-row`}>
              <Pressable
                onPress={() => handleUpdate(req.public_id, 'accepted')}
                disabled={isUpdating}
                style={[tailwind`flex-1 mr-2 py-2.5 rounded-xl items-center`,
                  { backgroundColor: '#f87171', opacity: isUpdating ? 0.5 : 1 }]}>
                {isUpdating
                  ? <ActivityIndicator color="white" size="small" />
                  : <Text style={{ color: 'white', fontWeight: '700' }}>Accept</Text>}
              </Pressable>
              <Pressable
                onPress={() => handleUpdate(req.public_id, 'rejected')}
                disabled={isUpdating}
                style={[tailwind`flex-1 py-2.5 rounded-xl items-center`,
                  { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
                    opacity: isUpdating ? 0.5 : 1 }]}>
                <Text style={{ color: '#94a3b8', fontWeight: '600' }}>Reject</Text>
              </Pressable>
            </View>
          </View>
        );
      })}

    </ScrollView>
  );
};

export default TournamentJoinRequests;
