// TournamentParticipants.js (FIXED & PRODUCTION READY)

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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { getTournamentEntities } from '../redux/actions/actions';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { validateTournamentParticipantForm } from '../utils/validation/tournamentValidation';

/* ---------------- Icons ---------------- */
const AddIcon = () => <Text style={tailwind`text-white text-lg font-bold`}>+</Text>;
const SearchIcon = () => <Text style={tailwind`text-gray-400`}>🔍</Text>;
const CloseIcon = () => <Text style={tailwind`text-gray-500 font-bold text-lg`}>✕</Text>;
const TeamIcon = () => <Text style={tailwind`text-white text-xl`}>👥</Text>;
const PlayerIcon = () => <Text style={tailwind`text-white text-xl`}>👤</Text>;

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

  const [searchQuery, setSearchQuery] = useState('');

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

      const token = await AsyncStorage.getItem('AccessToken');
      const endpoint =
        selectedEntityType === 'team'
          ? `${BASE_URL}/${game.name}/getTeamsBySport/${game.id}`
          : `${BASE_URL}/getPlayersBySport/${game.id}`;

      const res = await axiosInstance.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEntities(res.data?.data || []);
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
      setSearchQuery('');
    } catch (err) {
      setModalError({
        global: 'Unable to add participant',
        fields: err?.response?.data?.error?.fields || {},
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEntities = useMemo(() => {
    if (!searchQuery.trim()) return entities;
    return entities.filter((e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [entities, searchQuery]);

  return (
    <Animated.ScrollView
      onScroll={handlerScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120, minHeight: screenHeight }}
    >
      {/* Action Buttons */}
      {tournament.user_id === authUser?.id && (
        <View style={tailwind`px-4 py-4 flex-row gap-3 bg-white`}>
          {['team', 'player'].map((type) => (
            <Pressable
              key={type}
              onPress={() => {
                setSelectedEntityType(type);
                setIsModalVisible(true);
              }}
              style={tailwind`flex-1 bg-red-500 rounded-xl py-3 flex-row justify-center`}
            >
              {type === 'team' ? <TeamIcon /> : <PlayerIcon />}
              <Text style={tailwind`text-white ml-2 font-semibold`}>
                Add {type === 'team' ? 'Teams' : 'Players'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Content */}
      {loading ? (
        <ActivityIndicator style={tailwind`mt-20`} size="large" />
      ) : participantsError.global ? (
        <Text style={tailwind`text-red-600 text-center mt-20`}>
          {participantsError.global}
        </Text>
      ) : participants.length === 0 ? (
        <Text style={tailwind`text-center text-gray-500 mt-20`}>
          No participants added yet
        </Text>
      ) : (
        <View style={tailwind`px-4 mt-6`}>
          {participants.map((item) => (
            <View
              key={item.public_id}
              style={tailwind`bg-white rounded-xl p-4 mb-3`}
            >
              <Text style={tailwind`text-lg font-semibold`}>
                {item.entity.name}
              </Text>
              <Text style={tailwind`text-gray-500 capitalize`}>
                {item.entity_type}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Modal */}
      <AddParticipantModal
        visible={isModalVisible}
        entities={filteredEntities}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
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

const AddParticipantModal = ({
  visible,
  entities,
  searchQuery,
  setSearchQuery,
  loading,
  error,
  submitting,
  onClose,
  onAdd,
  entityType,
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={tailwind`flex-1 bg-black/50`}>
      <Pressable style={tailwind`flex-1`} onPress={onClose} />

      <View style={tailwind`bg-white rounded-t-3xl p-6`}>
        <Text style={tailwind`text-xl font-bold mb-3`}>
          Add {entityType === 'team' ? 'Teams' : 'Players'}
        </Text>

        <TextInput
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={tailwind`bg-gray-100 rounded-xl px-4 py-3 mb-3`}
        />

        {error?.global && (
          <Text style={tailwind`text-red-600 mb-2`}>{error.global}</Text>
        )}

        {loading ? (
          <ActivityIndicator />
        ) : (
          <ScrollView>
            {entities.map((e) => (
              <Pressable
                key={e.public_id}
                onPress={() => onAdd(e.public_id)}
                disabled={submitting}
                style={tailwind`p-4 bg-gray-50 rounded-xl mb-2`}
              >
                <Text style={tailwind`font-semibold`}>{e.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  </Modal>
);

export default TournamentParticipants;
