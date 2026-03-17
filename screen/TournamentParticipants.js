import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { getTournamentEntities } from '../redux/actions/actions';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { validateTournamentParticipantForm } from '../utils/validation/tournamentValidation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const SearchIcon = () => <MaterialIcons name="search" size={24} color="#94a3b8"/>;
const CloseIcon = () => <Text style={[tailwind`font-bold text-lg`, { color: '#94a3b8' }]}>✕</Text>;
const TeamIcon = () => <Text style={tailwind`text-white text-xl`}>👥</Text>;
const PlayerIcon = () => <Text style={tailwind`text-white text-xl`}>👤</Text>;

const AddParticipantModal = ({
  visible,
  allEntities,       // full unfiltered list
  loading,
  error,
  submitting,
  onClose,
  onAdd,
  entityType,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Reset search whenever modal opens or entity type changes
  useEffect(() => {
    if (visible) setSearchQuery('');
  }, [visible, entityType]);

  const filteredEntities = useMemo(() => {
    if (!searchQuery.trim()) return allEntities;
    const query = searchQuery.toLowerCase();
    return allEntities.filter((e) => {
      const name = (e.name || e.short_name || '').toLowerCase();
      return name.includes(query);
    });
  }, [allEntities, searchQuery]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={tailwind`flex-1`}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={tailwind`flex-1 bg-black/50 justify-end`}>
          <Pressable style={tailwind`flex-1`} onPress={onClose} />

          <View style={[tailwind`rounded-t-3xl p-6`, { backgroundColor: '#1e293b', maxHeight: Dimensions.get('window').height * 0.75 }]}>
            {/* Header */}
            <View style={tailwind`flex-row items-center justify-between mb-4`}>
              <Text style={[tailwind`text-xl font-bold`, { color: '#f1f5f9' }]}>
                Add {entityType === 'team' ? 'Teams' : 'Players'}
              </Text>
              <Pressable onPress={onClose} style={tailwind`w-8 h-8 items-center justify-center`}>
                <CloseIcon />
              </Pressable>
            </View>

            {/* Search Bar */}
            <View style={[tailwind`rounded-xl px-4 py-3 mb-4 flex-row items-center`, { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' }]}>
              <SearchIcon />
              <TextInput
                placeholder={`Search ${entityType === 'team' ? 'teams' : 'players'}...`}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[tailwind`flex-1 ml-2 text-base`, { color: '#f1f5f9' }]}
                placeholderTextColor="#64748b"
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} style={tailwind`ml-2 p-1`}>
                  <Text style={[tailwind`text-sm`, { color: '#475569' }]}>✕</Text>
                </Pressable>
              )}
            </View>

            {/* Error Message */}
            {error?.global && (
              <View style={[tailwind`rounded-lg p-3 mb-3`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                <Text style={[tailwind`text-sm`, { color: '#fca5a5' }]}>{error.global}</Text>
              </View>
            )}

            {/* Content */}
            {loading ? (
              <View style={tailwind`py-10 items-center`}>
                <ActivityIndicator size="large" color="#f87171" />
                <Text style={[tailwind`mt-3`, { color: '#64748b' }]}>Loading...</Text>
              </View>
            ) : filteredEntities.length === 0 ? (
              <View style={tailwind`py-10 items-center`}>
                <MaterialIcons name="search" size={24} color="#475569" />
                <Text style={[tailwind`text-base font-medium`, { color: '#64748b' }]}>
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : `No ${entityType}s available`}
                </Text>
                {searchQuery ? (
                  <Pressable onPress={() => setSearchQuery('')} style={tailwind`mt-3`}>
                    <Text style={[tailwind`text-sm font-medium`, { color: '#f87171' }]}>Clear search</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <ScrollView
                style={{ maxHeight: 400 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {filteredEntities.map((e) => (
                  <Pressable
                    key={e.public_id}
                    onPress={() => onAdd(e.public_id)}
                    disabled={submitting}
                    style={({ pressed }) => [
                      tailwind`p-4 rounded-xl mb-2 flex-row items-center`,
                      { backgroundColor: '#0f172a' },
                      pressed && { backgroundColor: '#334155' },
                      submitting && tailwind`opacity-50`,
                    ]}
                  >
                    <View style={[tailwind`w-10 h-10 rounded-full items-center justify-center mr-3`, { backgroundColor: '#334155' }]}>
                      {e.media_url || e.avatar_url ? (
                        <Image
                          source={{ uri: e.media_url || e.avatar_url }}
                          style={tailwind`w-10 h-10 rounded-full`}
                        />
                      ) : (
                        <Text style={[tailwind`font-bold text-base`, { color: '#f87171' }]}>
                          {(e.name || '?').charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View style={tailwind`flex-1`}>
                      <Text style={[tailwind`font-semibold`, { color: '#f1f5f9' }]}>{e.name}</Text>
                      {(e.short_name || e.shortname) && (
                        <Text style={[tailwind`text-sm mt-0.5`, { color: '#64748b' }]}>
                          {e.short_name || e.shortname}
                        </Text>
                      )}
                    </View>
                    {submitting ? (
                      <ActivityIndicator size="small" color="#f87171" />
                    ) : (
                      <Text style={[tailwind`font-bold text-lg`, { color: '#f87171' }]}>+</Text>
                    )}
                  </Pressable>
                ))}
                <View style={{ height: 20 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const TournamentParticipants = ({
  tournament,
  parentScrollY,
  collapsedHeader,
}) => {
  const dispatch = useDispatch();
  const game = useSelector((state) => state.sportReducers.game);

  const currentScrollY = useSharedValue(0);
  const screenHeight = Dimensions.get('window').height;

  const handlerScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      parentScrollY.value =
        collapsedHeader === parentScrollY
          ? currentScrollY.value
          : event.contentOffset.y;
    },
  });

  const [authUser, setAuthUser] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

  const [participantsError, setParticipantsError] = useState({
    global: null,
    fields: {},
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState('team');
  const [entities, setEntities] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [modalError, setModalError] = useState({
    global: null,
    fields: {},
  });

  useEffect(() => {
    (async () => {
      try {
        const user = await AsyncStorage.getItem('User');
        if (user) setAuthUser(JSON.parse(user));
      } catch {}
    })();
  }, []);

  const fetchParticipants = useCallback(async () => {
    try {
      setLoading(true);
      setParticipantsError({ global: null, fields: {} });

      const token = await AsyncStorage.getItem('AccessToken');
      const res = await axiosInstance.get(
        `${BASE_URL}/${game.name}/getTournamentParticipants/${tournament.public_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setParticipants(res.data?.data || []);
      dispatch(getTournamentEntities(res.data?.data || []));
    } catch (err) {
      setParticipantsError({
        global: 'Unable to load tournament participants',
        fields: err?.response?.data?.error?.fields || {},
      });
    } finally {
      setLoading(false);
    }
  }, [dispatch, game.name, tournament.public_id]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const fetchEntities = useCallback(async () => {
    try {
      setModalLoading(true);
      setModalError({ global: null, fields: {} });
      setEntities([]);

      const token = await AsyncStorage.getItem('AccessToken');
      const endpoint =
        selectedEntityType === 'team'
          ? `${BASE_URL}/${game.name}/getTeamsBySport/${game.id}`
          : `${BASE_URL}/getPlayersBySport/${game.id}`;

      const res = await axiosInstance.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEntities(res?.data?.data || []);
    } catch (err) {
      setModalError({
        global: 'Unable to load entities',
        fields: err?.response?.data?.error?.fields || {},
      });
    } finally {
      setModalLoading(false);
    }
  }, [game.id, game.name, selectedEntityType]);

  useEffect(() => {
    if (isModalVisible) fetchEntities();
  }, [isModalVisible, fetchEntities]);

  const handleAddEntity = async (entityPublicId) => {
    try {
      setSubmitting(true);
      setModalError({ global: null, fields: {} });

      const payload = {
        tournament_public_id: tournament.public_id,
        entity_public_id: entityPublicId,
        entity_type: selectedEntityType,
      };

      const validation = validateTournamentParticipantForm(payload);
      if (!validation.isValid) {
        setModalError({
          global: Object.values(validation.errors)[0],
          fields: validation.errors,
        });
        return;
      }

      const token = await AsyncStorage.getItem('AccessToken');
      await axiosInstance.post(
        `${BASE_URL}/${game.name}/addTournamentParticipants`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchParticipants();
      setIsModalVisible(false);
    } catch (err) {
      if(err?.response?.data?.error?.code === "FORBIDDEN"){
          setModalError({
              global: err?.response?.data?.error?.message,
              fields: {},
          })
      } else {
        setModalError({
          global: 'Unable to add participant',
          fields: err?.response?.data?.error?.fields || {},
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Animated.ScrollView
      onScroll={handlerScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120, minHeight: screenHeight,  backgroundColor: '#0f172a' }}
    >
      {/* Action Buttons */}
        <View style={[tailwind`px-4 py-4 flex-row gap-3`, { backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
            <Pressable
              key={'team'}
              onPress={() => {
                setSelectedEntityType('team');
                setIsModalVisible(true);
              }}
              style={[tailwind`flex-1 rounded-xl py-3.5 flex-row items-center justify-center shadow-sm`, { backgroundColor: '#f87171' }]}
            >
              {<TeamIcon />}
              <Text style={tailwind`text-white ml-2 font-semibold text-base`}>
                Add Teams
              </Text>
            </Pressable>
        </View>

      {/* Participants List */}
      {loading ? (
        <View style={tailwind`py-20 items-center`}>
          <ActivityIndicator size="large" color="#f87171" />
          <Text style={[tailwind`mt-3`, { color: '#64748b' }]}>Loading participants...</Text>
        </View>
      ) : participantsError.global ? (
        <View style={tailwind`px-4 py-20 items-center`}>
          <Text style={tailwind`text-6xl mb-4`}>⚠️</Text>
          <Text style={[tailwind`text-center text-lg font-semibold mb-2`, { color: '#f87171' }]}>
            Error Loading Participants
          </Text>
          <Text style={[tailwind`text-center`, { color: '#64748b' }]}>
            {participantsError.global}
          </Text>
          <Pressable
            onPress={fetchParticipants}
            style={[tailwind`mt-4 px-6 py-3 rounded-lg`, { backgroundColor: '#f87171' }]}
          >
            <Text style={tailwind`text-white font-semibold`}>Try Again</Text>
          </Pressable>
        </View>
      ) : participants.length === 0 ? (
        <View style={tailwind`px-4 py-20 items-center`}>
          <Text style={tailwind`text-6xl mb-4`}>
            {tournament.user_id === authUser?.id ? '👥' : '🔍'}
          </Text>
          <Text style={[tailwind`text-xl font-semibold mb-2`, { color: '#cbd5e1' }]}>
            No Participants Yet
          </Text>
          <Text style={[tailwind`text-center`, { color: '#64748b' }]}>
            {tournament.user_id === authUser?.id
              ? 'Add teams or players to get started'
              : 'No participants have been added to this tournament'}
          </Text>
        </View>
      ) : (
        <View style={tailwind`px-4 mt-6`}>
          {participants.map((item) => (
            <View
              key={item.public_id}
              style={[tailwind`rounded-xl p-4 mb-3 flex-row items-center`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}
            >
              <View style={[tailwind`w-12 h-12 rounded-full items-center justify-center mr-3`, { backgroundColor: '#334155' }]}>
                {item.entity?.media_url || item.entity?.avatar_url ? (
                  <Image
                    source={{ uri: item.entity.media_url || item.entity.avatar_url }}
                    style={tailwind`w-12 h-12 rounded-full`}
                  />
                ) : (
                  <Text style={[tailwind`text-lg font-bold`, { color: '#94a3b8' }]}>
                    {(item.entity?.name).charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={tailwind`flex-1`}>
                <Text style={[tailwind`text-lg font-semibold`, { color: '#f1f5f9' }]}>
                  {item.entity?.name}
                </Text>
                {item.entity?.type && (
                  <Text style={[tailwind`text-sm capitalize mt-1`, { color: '#64748b' }]}>
                    {item.entity.type}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Modal */}
      <AddParticipantModal
        visible={isModalVisible}
        allEntities={entities}
        loading={modalLoading}
        error={modalError}
        submitting={submitting}
        onClose={() => setIsModalVisible(false)}
        onAdd={handleAddEntity}
        entityType={selectedEntityType}
      />
    </Animated.ScrollView>
  );
};

export default TournamentParticipants;
