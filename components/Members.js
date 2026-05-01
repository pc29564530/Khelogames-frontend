import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Pressable, Image, Modal, ScrollView,
  TextInput, ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from '../screen/axios_config';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getTeamPlayers, setTeamPlayer } from '../redux/actions/actions';
import { useSelector, useDispatch } from 'react-redux';
import { logSilentError } from '../utils/errorHandler';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

const Members = ({ team, parentScrollY, collapsedHeader }) => {
  const dispatch    = useDispatch();
  const navigation  = useNavigation();
  const game        = useSelector(state => state.sportReducers.game);
  const players     = useSelector(state => state.players.players);
  const authProfile = useSelector(state => state.profile.authProfile);
  const authUser    = useSelector(state => state.profile.authUser);

  // available players pool (for Add Player modal)
  const [playerPool, setPlayerPool]     = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [searchText, setSearchText]     = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [permissions, setPermissions] = useState(false);
  const [loading, setLoading] = useState(false);

  // join requests
  const [requests, setRequests]     = useState([]);

  // loading / error — split by context so they don't bleed into each other
  const [membersLoading, setMembersLoading] = useState(true);
  const [modalLoading, setModalLoading]     = useState(false);
  const [error, setError]                   = useState({global: null, fields: {}});
  const [modalError, setModalError]         = useState({global: null, fields: {}});

  const { height: sHeight } = useWindowDimensions();
  const currentScrollY = useSharedValue(0);

  const handlerScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (parentScrollY.value === collapsedHeader) {
        parentScrollY.value = currentScrollY.value;
      } else {
        parentScrollY.value = event.contentOffset.y;
      }
    },
  });

  const isOwner = authUser?.id === team.user_id;

  // Fetch squad members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setMembersLoading(true);
        setError({global: null, fields: {}});
        const response = await axiosInstance.get(
          `${BASE_URL}/${game.name}/getTeamsMemberFunc/${team.public_id}`,
        );
        dispatch(getTeamPlayers(response.data?.data ?? []));
      } catch (err) {
        logSilentError(err);
        setError({ global: 'Unable to load squad. Pull down to refresh.', fields: {} });
      } finally {
        setMembersLoading(false);
      }
    };
    fetchMembers();
  }, [team.public_id, game.name]);

  // Fetch player pool for the Add modal
  useEffect(() => {
    const fetchPool = async () => {
      try {
        const response = await axiosInstance.get(
          `${BASE_URL}/get-available-players-by-sport/${game.id}`,
        );
        const data = response.data?.data ?? [];
        setPlayerPool(data);
        setFiltered(data);
      } catch (err) {
        logSilentError(err);
      }
    };
    fetchPool();
  }, [game.id]);

    // Check for user permission
    useEffect(() => {
      const checkPermission = async () => {
        setLoading(true);
        try {
          const checkPer = await axiosInstance.get(
            `${BASE_URL}/check-user-permission`,
            {
              params: {
                resource_type: "team",
                resource_public_id: team.public_id,
              },
            }
          );
          const res = checkPer.data.data;
          setPermissions(res);
        } catch (err) {
          console.log("Unable to check permission:", err);
        } finally {
          setLoading(false);
        }
      };
      checkPermission();
    }, []);

  // Fetch pending join requests (owner only)
  const fetchRequests = useCallback(async () => {
    try {
      const res = await axiosInstance.get(
        `${BASE_URL}/${game.name}/get-team-join-requests/${team.public_id}`,
      );
      setRequests(res.data?.data ?? []);
    } catch (err) {
      logSilentError(err);
    }
  }, [team.public_id, game.name]);

  useEffect(() => {
    if (isOwner) fetchRequests();
  }, [isOwner]);

  const handleAddPlayer = async (selectedItem) => {
    try {
      setModalLoading(true);
      const response = await axiosInstance.post(
        `${BASE_URL}/${game.name}/addTeamMember`,
        {
          team_public_id: team.public_id,
          player_public_id: selectedItem.public_id,
          join_date: new Date(),
        },
      );
      if (response.data?.data) {
        dispatch(setTeamPlayer(response.data.data));
        setPlayerPool(prev => prev.filter(p => p.public_id !== selectedItem.public_id));
        setFiltered(prev => prev.filter(p => p.public_id !== selectedItem.public_id));
      }
      setSearchText('');
    } catch (err) {
      const errorCode = err?.response?.data?.error?.code;
      const errorMessage = err?.response?.data?.error?.message;
      const backendFields = err?.response?.data?.error?.fields;

      if (backendFields && Object.keys(backendFields).length > 0) {
          setModalError({ global: errorMessage || "Invalid input", fields: backendFields });
      } else if (errorCode && errorCode !== "INTERNAL_ERROR") {
          setModalError({ global: errorMessage, fields: {} });
      } else {
          setModalError({ global: "Unable to add player", fields: {} });
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleRemovePlayer = async (item) => {
    try {
      const response = await axiosInstance.put(
        `${BASE_URL}/${game.name}/removePlayerFromTeam`,
        {
          team_public_id: team.public_id,
          player_public_id: item.public_id,
          leave_date: new Date(),
        },
      );
      const updated = players.filter(p => p.public_id !== item.public_id);
      dispatch(getTeamPlayers(updated));
    } catch (err) {
      const errorCode = err?.response?.data?.error?.code;
      const errorMessage = err?.response?.data?.error?.message;
      const backendFields = err?.response?.data?.error?.fields;

      if (backendFields && Object.keys(backendFields).length > 0) {
          setError({ global: errorMessage || "Invalid input", fields: backendFields });
      } else if (errorCode && errorCode !== "INTERNAL_ERROR") {
          setError({ global: errorMessage, fields: {} });
      } else {
          setError({ global: "Unable to remove player", fields: {} });
      }
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (!Array.isArray(playerPool)) return;
    const lower = text.toLowerCase();
    setFiltered(
      playerPool.filter(p =>
        p.name?.toLowerCase().includes(lower) && p.game_id === game.id,
      ),
    );
  };

  const closeModal = () => {
    setShowAddModal(false);
    setSearchText('');
    setModalError({global: null, fields: {}})
    setFiltered(playerPool);
  };

  // Render
  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <Animated.ScrollView
        style={{ flex: 1, backgroundColor: '#0f172a' }}
        onScroll={handlerScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 100, minHeight: sHeight + 100 }}
      >

        {/* Error banner */}
        {!!error?.global && (
          <View style={[tailwind`mx-4 mb-4 rounded-xl p-3 flex-row items-center`,
            { backgroundColor: '#2d0a0a', borderWidth: 1, borderColor: '#7f1d1d' }]}>
            <MaterialIcons name="error-outline" size={16} color="#f87171" />
            <Text style={{ color: '#fca5a5', fontSize: 13, marginLeft: 8, flex: 1 }}>
              {error.global}
            </Text>
          </View>
        )}

        {permissions?.can_edit && (
          <View style={[tailwind`px-4 py-4 flex-row gap-3 mb-2`, { backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
              {/* Pending Requests */}
              <Pressable
                onPress={() => navigation.navigate('TeamJoinRequests', { team })}
                style={[
                  tailwind`flex-1 mr-2 rounded-xl px-4 py-3 flex-row items-center justify-center`,
                  { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }
                ]}
              >
                <MaterialIcons name="notifications-active" size={18} color="#f87171" />

                <Text style={{ color:'#f1f5f9', fontWeight:'700', marginLeft:8, fontSize:13 }}>
                  Requests
                </Text>

                {requests.length > 0 && (
                  <View style={{
                    marginLeft:8,
                    backgroundColor:'#f87171',
                    minWidth:20,
                    height:20,
                    borderRadius:10,
                    alignItems:'center',
                    justifyContent:'center',
                    paddingHorizontal:5
                  }}>
                    <Text style={{
                      color:'white',
                      fontSize:11,
                      fontWeight:'700'
                    }}>
                      {requests.length}
                    </Text>
                  </View>
                )}
              </Pressable>

              {/* Add Player */}
              <Pressable
                onPress={() => setShowAddModal(true)}
                style={[
                  tailwind`flex-1 ml-2 rounded-xl px-4 py-3 flex-row items-center justify-center`,
                  { backgroundColor: '#f87171' }
                ]}
              >
                <MaterialIcons name="person-add" size={18} color="white" />
                <Text style={{
                  color:'white',
                  fontWeight:'700',
                  marginLeft:8,
                  fontSize:13
                }}>
                  Add Player
                </Text>
              </Pressable>

          </View>
          )}

        {/* Squad list */}
        {membersLoading ? (
          <View style={tailwind`items-center py-16`}>
            <ActivityIndicator size="large" color="#f87171" />
            <Text style={{ color: '#475569', fontSize: 13, marginTop: 10 }}>Loading squad...</Text>
          </View>
        ) : players?.length > 0 ? (
          <View style={tailwind`px-4`}>
            {players.map((item, index) => (
              <Pressable
                key={item.public_id ?? index}
                onPress={() => navigation.navigate('PlayerProfile', {
                  publicID: item.public_id, from: 'team',
                })}
                style={[tailwind`flex-row items-center mb-2 rounded-2xl px-4 py-3`,
                  { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>

                {/* Avatar */}
                {item.media_url ? (
                  <Image source={{ uri: item.media_url }}
                    style={{ width: 48, height: 48, borderRadius: 12 }} />
                ) : (
                  <View style={{ width: 48, height: 48, borderRadius: 12,
                    backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#f87171', fontSize: 18, fontWeight: '700' }}>
                      {item?.name?.charAt(0)?.toUpperCase()}
                    </Text>
                  </View>
                )}

                {/* Info */}
                <View style={tailwind`flex-1 ml-3`}>
                  <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 14 }} numberOfLines={1}>
                    {item?.name}
                  </Text>
                  <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                    {[item.positions, item.country].filter(Boolean).join(' · ')}
                  </Text>
                </View>

                {/* Remove — owner only */}
                {permissions?.can_edit && (
                  <Pressable
                    hitSlop={8}
                    onPress={(e) => { e.stopPropagation(); handleRemovePlayer(item); }}
                    style={{ padding: 6 }}>
                    <MaterialIcons name="remove-circle-outline" size={20} color="#475569" />
                  </Pressable>
                )}
              </Pressable>
            ))}
          </View>
        ) : (
          /* Empty squad */
          <View style={tailwind`items-center py-16`}>
            <MaterialIcons name="people-outline" size={52} color="#1e293b" />
            <Text style={{ color: '#475569', fontSize: 15, marginTop: 12 }}>No players yet</Text>
            <Text style={{ color: '#334155', fontSize: 13, marginTop: 4 }}>
              Build your squad by adding players
            </Text>
            {permissions?.can_edit && (
              <Pressable
                onPress={() => setShowAddModal(true)}
                style={[tailwind`mt-5 flex-row items-center px-5 py-3 rounded-xl`,
                  { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
                <MaterialIcons name="person-add" size={17} color="#f87171" />
                <Text style={{ color: '#f87171', fontWeight: '600', marginLeft: 6 }}>Add Player</Text>
              </Pressable>
            )}
          </View>
        )}
      </Animated.ScrollView>

      {/* Add Player Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={showAddModal}
        onRequestClose={closeModal}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' }}>

          {/* Dismiss backdrop */}
          <Pressable style={{ flex: 1 }} onPress={closeModal} />

          <View style={{ backgroundColor: '#1e293b', borderTopLeftRadius: 24,
            borderTopRightRadius: 24, borderTopWidth: 1, borderColor: '#334155',
            minHeight: sHeight * 0.6 }}>

            {/* Modal header */}
            <View style={[tailwind`flex-row items-center justify-between px-5 py-4`,
              { borderBottomWidth: 1, borderColor: '#334155' }]}>
              <Text style={{ color: '#f1f5f9', fontSize: 17, fontWeight: '700' }}>Add Player</Text>
              <Pressable hitSlop={8} onPress={closeModal}>
                <MaterialIcons name="close" size={22} color="#64748b" />
              </Pressable>
            </View>

            {/* Modal error */}
            {!!modalError?.global && (
              <View style={[tailwind`mx-4 mt-3 rounded-xl p-3`,
                { backgroundColor: '#2d0a0a', borderWidth: 1, borderColor: '#7f1d1d' }]}>
                <Text style={{ color: '#fca5a5', fontSize: 13 }}>{modalError.global}</Text>
              </View>
            )}

            {/* Search */}
            <View style={[tailwind`mx-4 mt-4 mb-2 flex-row items-center rounded-xl px-3 py-2`,
              { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }]}>
              <MaterialIcons name="search" size={18} color="#475569" />
              <TextInput
                value={searchText}
                onChangeText={handleSearch}
                placeholder="Search by name..."
                placeholderTextColor="#475569"
                style={{ flex: 1, marginLeft: 8, color: '#f1f5f9', fontSize: 14, paddingVertical: 6 }}
              />
              {searchText.length > 0 && (
                <Pressable hitSlop={8}
                  onPress={() => { setSearchText(''); setFiltered(playerPool); }}>
                  <MaterialIcons name="cancel" size={16} color="#475569" />
                </Pressable>
              )}
            </View>

            {/* Player list */}
            <ScrollView style={{ flex: 1 }}
              contentContainerStyle={tailwind`px-4 pb-8`}
              showsVerticalScrollIndicator={false}>
              {modalLoading ? (
                <View style={tailwind`items-center py-10`}>
                  <ActivityIndicator size="large" color="#f87171" />
                </View>
              ) : filtered?.length > 0 ? (
                filtered.map((item, index) => (
                  <Pressable
                    key={item.public_id ?? index}
                    onPress={() => handleAddPlayer(item)}
                    style={[tailwind`flex-row items-center py-3`,
                      { borderBottomWidth: 1, borderColor: '#0f172a' }]}>
                    {item.media_url ? (
                      <Image source={{ uri: item.media_url }}
                        style={{ width: 44, height: 44, borderRadius: 10 }} />
                    ) : (
                      <View style={{ width: 44, height: 44, borderRadius: 10,
                        backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#f87171', fontSize: 16, fontWeight: '700' }}>
                          {item?.name?.charAt(0)?.toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={tailwind`flex-1 ml-3`}>
                      <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 14 }}>
                        {item.name}
                      </Text>
                      <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                        {item.positions}
                      </Text>
                    </View>
                    <MaterialIcons name="add-circle-outline" size={22} color="#f87171" />
                  </Pressable>
                ))
              ) : (
                <View style={tailwind`items-center py-12`}>
                  <MaterialIcons name="person-search" size={52} color="#1e293b" />
                  <Text style={{ color: '#475569', fontSize: 14, marginTop: 12 }}>
                    {searchText ? 'No players found' : 'No available players'}
                  </Text>
                  <Text style={{ color: '#334155', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                    {searchText ? 'Try a different name' : 'Create player profiles first'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Members;
