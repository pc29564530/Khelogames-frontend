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

// A player sends a join request to a team
const RequestJoinTeam = ({ route }) => {
    const { team } = route.params;
    const game = useSelector(state => state.sportReducers.game);
    const navigation = useNavigation();
    const authProfilePublicID = useSelector(state => state.profile.authProfilePublicID);

    const [player, setPlayer] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState({ global: '', fields: {} });

    // Fetch player profile — confirms user has one before they can send a request
    useEffect(() => {
        const fetchPlayer = async () => {
        setFetchLoading(true);
        setError({ global: '', fields: {} });
        try {
            if (!authProfilePublicID) {
            setError({ global: 'Please create a player profile first', fields: {} });
            return;
            }
            const res = await axiosInstance.get(
            `${BASE_URL}/getPlayerByProfile/${authProfilePublicID}`,
            );
            const data = res.data?.data;
            if (!data) {
                setError({ global: 'Player profile not found. Create one first.', fields: {} });
            return;
            }
            setPlayer(data);
        } catch (err) {
            console.log('Failed to get player profile:', err);
            setError({ global: 'Unable to load player profile', fields: {} });
        } finally {
            setFetchLoading(false);
        }
        };
        fetchPlayer();
    }, [authProfilePublicID]);

    const handleSend = async () => {
        if (!player || loading) return;
        setLoading(true);
        setError({ global: null, fields: {} });
        try {
        await axiosInstance.post(
            `${BASE_URL}/${game.name}/send-team-join-request`,
            {
            team_public_id: team.public_id,
            message,
            },
        );
        navigation.goBack();
        } catch (err) {
        console.log('Failed to send join request:', err);
        setError({ global: 'Unable to send requests', fields: {} });
        } finally {
            setLoading(false);
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
            <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '600' }}>
                Request Join Team
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
        {/* Team info — who they are joining */}
        <View style={[tailwind`rounded-2xl p-4 mb-4 flex-row items-center`,
          { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
          {team.media_url ? (
            <Image source={{ uri: team.media_url }}
              style={tailwind`w-12 h-12 rounded-full`} />
          ) : (
            <View style={[tailwind`w-12 h-12 rounded-full items-center justify-center`,
              { backgroundColor: '#334155' }]}>
              <MaterialIcons name="group" size={24} color="#64748b" />
            </View>
          )}
          <View style={tailwind`ml-3 flex-1`}>
            <Text style={{ color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>Requesting to join</Text>
            <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15 }}
              numberOfLines={1}>
              {team.name}
            </Text>
            {!!team.player_count && (
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                {team.player_count} players
              </Text>
            )}
          </View>
        </View>

        {/* Global error */}
        {!!error.global && (
          <View style={[tailwind`rounded-xl p-3 mb-4`,
            { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
            <Text style={{ color: '#fca5a5', fontSize: 13 }}>{error.global}</Text>
          </View>
        )}

        {/* Requesting as — player profile card */}
        <View style={[tailwind`rounded-2xl p-5 mb-4`,
          { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
          <Text style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: 12 }}>
            Requesting as
          </Text>

          {fetchLoading ? (
            <ActivityIndicator color="#f87171" style={tailwind`py-4`} />
          ) : player ? (
            <View style={tailwind`flex-row items-center`}>
              {player.media_url ? (
                <Image source={{ uri: player.media_url }}
                  style={tailwind`w-12 h-12 rounded-full`} />
              ) : (
                <View style={[tailwind`w-12 h-12 rounded-full items-center justify-center`,
                  { backgroundColor: '#334155' }]}>
                  <MaterialIcons name="person" size={24} color="#64748b" />
                </View>
              )}
              <View style={tailwind`ml-3 flex-1`}>
                <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 15 }}>
                  {player.name}
                </Text>
                {!!player.positions && player.positions.length > 0 && (
                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                    {Array.isArray(player.positions)
                      ? player.positions.join(', ')
                      : player.positions}
                  </Text>
                )}
                {!!player.country && (
                  <Text style={{ color: '#64748b', fontSize: 12 }}>{player.country}</Text>
                )}
              </View>
            </View>
          ) : (
            <View style={tailwind`py-3 items-center`}>
              <Text style={{ color: '#475569', fontSize: 13 }}>
                No player profile found.
              </Text>
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
            placeholder="Tell the team why you want to join..."
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
          disabled={!player || loading}
          style={[tailwind`py-4 rounded-2xl items-center`,
            {
              backgroundColor: player && !loading ? '#f87171' : '#334155',
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

export default RequestJoinTeam;
