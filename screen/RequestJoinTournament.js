import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, ScrollView, Pressable,
  ActivityIndicator, TextInput, Image,
} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const RequestJoinTournament = ({ route }) => {
  const { tournament } = route.params;
  const navigation = useNavigation();
  const game = useSelector(state => state.sportReducers.game);
  const authProfilePublicID = useSelector(state => state.profile.authProfilePublicID);

  const [myTeam, setMyTeam] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState({ global: '', fields: {} });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setFetchLoading(true);
        setError({ global: '', fields: {} });

        //Get team by manager or user
        const teamsRes = await axiosInstance.get(
          `${BASE_URL}/${game.name}/getMyTeam`,
        );
        setMyTeam(teamsRes.data?.data ?? null);
      } catch (err) {
        console.log('Failed to fetch teams:', err);
        setError({ global: 'Failed to load my teams.', fields: {} });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchTeams();
  }, [authProfilePublicID]);

  const handleSend = async () => {
    if (!myTeam || loading) return;
    setLoading(true);
    setError({ global: '', fields: {} });
    try {
      await axiosInstance.post(
        `${BASE_URL}/${game.name}/send-tournament-join-request`,
        {
          tournament_public_id: tournament.public_id,
          team_public_id: myTeam.public_id,
          message,
        },
      );
      navigation.goBack();
    } catch (err) {
      console.log('Failed to send join request:', err);
      setError({ global: 'Failed to send request', fields: {} });
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
            <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '600' }}>
                Request Join Tournament
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

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView contentContainerStyle={tailwind`px-5 py-5`}>

        {/* Tournament info */}
        <View style={[tailwind`rounded-2xl p-4 mb-4 flex-row items-center`,
          { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
          <MaterialIcons name="emoji-events" size={24} color="#f87171" />
          <View style={tailwind`ml-3 flex-1`}>
            <Text style={{ color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>Applying to</Text>
            <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15 }}
              numberOfLines={1}>
              {tournament.name ?? tournament.tournament_name ?? 'Tournament'}
            </Text>
          </View>
        </View>

        {/* Global error */}
        {!!error.global && (
          <View style={[tailwind`rounded-xl p-3 mb-4`,
            { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
            <Text style={{ color: '#fca5a5', fontSize: 13 }}>{error.global}</Text>
          </View>
        )}

        {/* Select Team */}
        <View style={[tailwind`rounded-2xl p-5 mb-4`,
          { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
          <Text style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: 12 }}>
            Your Team
          </Text>

          {fetchLoading ? (
            <ActivityIndicator color="#f87171" style={tailwind`py-4`} />
          ) : !myTeam ? (
            <View style={tailwind`py-4 items-center`}>
              <MaterialIcons name="group-off" size={32} color="#475569" />
              <Text style={{ color: '#475569', fontSize: 13, marginTop: 8 }}>
                You are not part of any team yet.
              </Text>
            </View>
          ) : (
              <View
                style={[tailwind`flex-row items-center p-3 rounded-xl mb-2`,
                  {
                    backgroundColor: '#f8717115',
                    borderWidth: 1,
                    borderColor: '#f87171' ,
                  }]}>
                {myTeam !== null && myTeam?.media_url ? (
                  <Image source={{ uri: myTeam?.media_url }}
                    style={tailwind`w-10 h-10 rounded-full`} />
                ) : (
                  <View style={[tailwind`w-10 h-10 rounded-full items-center justify-center`,
                    { backgroundColor: '#334155' }]}>
                    <MaterialIcons name="group" size={20} color="#64748b" />
                  </View>
                )}
                <View style={tailwind`ml-3 flex-1`}>
                  <Text style={{ color: '#f1f5f9', fontWeight: '600' }}>{myTeam?.name}</Text>
                  {!!myTeam?.player_count && (
                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                      {myTeam?.player_count} players
                    </Text>
                  )}
                </View>
              </View>
          )}
        </View>

        {/* Optional Message */}
        <View style={[tailwind`rounded-2xl p-5 mb-6`,
          { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
          <Text style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: 8 }}>
            Message <Text style={{ color: '#475569', fontWeight: '400' }}>(optional)</Text>
          </Text>
          <TextInput
            style={[tailwind`py-3 px-4 rounded-xl text-sm`,
              { backgroundColor: '#0f172a', color: '#f1f5f9',
                borderColor: '#334155', borderWidth: 1, minHeight: 80,
                textAlignVertical: 'top' }]}
            value={message}
            onChangeText={setMessage}
            placeholder="e.g. We are ready for weekend matches..."
            placeholderTextColor="#475569"
            multiline
            maxLength={200}
          />
          <Text style={{ color: '#475569', fontSize: 11, marginTop: 4, textAlign: 'right' }}>
            {message.length}/200
          </Text>
        </View>

        {/* Send Button */}
        <Pressable
          onPress={handleSend}
          disabled={!myTeam || loading}
          style={[tailwind`py-4 rounded-2xl items-center`,
            {
              backgroundColor: myTeam && !loading ? '#f87171' : '#334155',
              opacity: loading ? 0.7 : 1,
            }]}>
          {loading
            ? <ActivityIndicator color="white" />
            : <Text style={tailwind`text-white text-base font-semibold`}>
                Send Request
              </Text>}
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default RequestJoinTournament;
