import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Image,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { getTournamentEntities } from '../redux/actions/actions';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

// Icons
const AddIcon = () => <Text style={tailwind`text-white text-lg font-bold`}>+</Text>;
const SearchIcon = () => <Text style={tailwind`text-gray-400`}>🔍</Text>;
const CloseIcon = () => <Text style={tailwind`text-gray-500 font-bold text-lg`}>✕</Text>;
const TeamIcon = () => <Text style={tailwind`text-white text-xl`}>👥</Text>;
const PlayerIcon = () => <Text style={tailwind`text-white text-xl`}>👤</Text>;

const TournamentParticipants = ({ tournament, currentRole, parentScrollY, headerHeight, collapsedHeader }) => {
  const currentScrollY = useSharedValue(0);

  const handlerScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      if(collapsedHeader === parentScrollY){
        parentScrollY.value = currentScrollY.value
      } else {
        parentScrollY.value = event.contentOffset.y;
      }
    },
  });

  // State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState('team');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [entities, setEntities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [groupID, setGroupID] = useState(null);
  const [seedNumber, setSeedNumber] = useState(null);
  const [authUser, setAuthUser] = useState();

  const {height: sHeight, width: sWidth} = Dimensions.get("window");

  useEffect(() => {
    let isMounted = true;
    (async () => {
       try {
      const currentAuthUser = await AsyncStorage.getItem("User");
      const userData = JSON.parse(currentAuthUser);

      if (isMounted) {
        setAuthUser(userData);
      }
    } catch (e) {
      console.error("Failed to load auth user", e);
    }
    })();
  }, [])

  // Animation
  const fadeAnim = useSharedValue(0);

  // Redux
  const dispatch = useDispatch();
  const game = useSelector((state) => state.sportReducers.game);

  // Memoized filtered entities
  const filteredEntities = useMemo(() => {
    if (!searchQuery.trim()) return entities;
    return entities.filter((entity) =>
      entity.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [entities, searchQuery]);

  // Fetch participants
  const fetchParticipants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const authToken = await AsyncStorage.getItem('AccessToken');
      const response = await axiosInstance.get(
        `${BASE_URL}/${game.name}/getTournamentParticipants/${tournament.public_id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data) {
        dispatch(getTournamentEntities(response.data || []));
      }
      setParticipants(response.data || []);
    } catch (err) {
      console.error('Failed to fetch participants:', err);
      setError('Failed to load participants');
      Alert.alert('Error', 'Failed to load tournament participants');
    } finally {
      setLoading(false);
    }
  }, [game.name, tournament.public_id, dispatch]);

  // Fetch entities
  const fetchEntities = useCallback(async () => {
    if (!selectedEntityType) return;

    try {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const endpoint =
        selectedEntityType === 'team'
          ? `${BASE_URL}/${game.name}/getTeamsBySport/${game.id}`
          : `${BASE_URL}/getPlayersBySport/${game.id}`;

      const response = await axiosInstance.get(endpoint, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      setEntities(response.data || []);
    } catch (err) {
      console.error('Failed to fetch entities:', err);
      Alert.alert('Error', `Failed to load ${selectedEntityType}s`);
    }
  }, [game.id, selectedEntityType]);

  // Add entity
  const handleAddEntity = useCallback(
    async (entityId) => {
      try {
        const data = {
          tournament_public_id: tournament.public_id,
          group_id: groupID,
          entity_public_id: entityId,
          entity_type: selectedEntityType,
          seed_number: seedNumber,
          status: 'Active',
        };

        const authToken = await AsyncStorage.getItem('AccessToken');
        await axiosInstance.post(
          `${BASE_URL}/${game.name}/addTournamentParticipants`,
          data,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        await fetchParticipants();
        setIsModalVisible(false);
        setSearchQuery('');

        Alert.alert('Success', `${selectedEntityType} added successfully!`);
      } catch (err) {
        console.error('Failed to add entity:', err);
        Alert.alert('Error', `Failed to add ${selectedEntityType}`);
      }
    },
    [tournament.public_id, selectedEntityType, fetchParticipants]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchParticipants();
    setRefreshing(false);
  }, [fetchParticipants]);

  const openModal = useCallback((entityType) => {
    setSelectedEntityType(entityType);
    setIsModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setSearchQuery('');
  }, []);

  const renderParticipantCard = useCallback(
    ({ item }) => (
      <Animated.View
        key={item.public_id}
        style={[tailwind`bg-white rounded-xl shadow-sm mb-3 overflow-hidden`]}
      >
        <View style={tailwind`p-4 flex-row items-center`}>
          <View style={tailwind`mr-4`}>
            {item.entity_type === 'team' ? <TeamIcon /> : <PlayerIcon />}
          </View>
          <View style={tailwind`flex-1`}>
            <Text style={tailwind`text-lg font-semibold text-gray-900 mb-1`}>
              {item.entity.name}
            </Text>
            <View style={tailwind`flex-row items-center`}>
              <View
                style={tailwind`px-2 py-1 rounded-full ${
                  item.status === 'Active' ? 'bg-green-100' : 'bg-gray-100'
                }`}
              >
                <Text
                  style={tailwind`text-xs font-medium ${
                    item.status === 'Active'
                      ? 'text-green-800'
                      : 'text-gray-600'
                  }`}
                >
                  {item.status}
                </Text>
              </View>
              <Text style={tailwind`text-sm text-gray-500 ml-2 capitalize`}>
                {item.entity_type}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    ),
    []
  );

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  useEffect(() => {
    if (isModalVisible) {
      fetchEntities();
    }
  }, [isModalVisible, fetchEntities]);

  return (
    <Animated.ScrollView
      onScroll={handlerScroll}
      scrollEventThrottle={16}
      style={tailwind`flex-1`}
      contentContainerStyle={{paddintTop: 20, paddingBottom:100, minHeight: sHeight+100}}
      showsVerticalScrollIndicator={false}
    >
      {tournament.user_id === authUser?.id && (
        <View style={tailwind` px-4 py-4 flex-row gap-3 shadow-lg bg-white`}>
          <Pressable
            onPress={() => openModal('team')}
            style={tailwind`flex-1 bg-red-400 rounded-xl py-3 flex-row items-center justify-center`}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <TeamIcon />
            <Text style={tailwind`text-white font-semibold ml-2`}>
              Add Teams
            </Text>
          </Pressable>

          <Pressable
            onPress={() => openModal('player')}
            style={tailwind`flex-1 bg-red-400 rounded-xl py-3 flex-row items-center justify-center`}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <PlayerIcon />
            <Text style={tailwind`text-white font-semibold ml-2`}>
              Add Players
            </Text>
          </Pressable>
        </View>
      )}

      {loading && participants.length === 0 ? (
        <View style={tailwind`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={tailwind`text-gray-500 mt-4`}>
            Loading participants...
          </Text>
        </View>
      ) : error ? (
        <View style={tailwind`flex-1 items-center justify-center px-6`}>
          <Text style={tailwind`text-red-400 text-center mb-4`}>{error}</Text>
          <Pressable
            onPress={fetchParticipants}
            style={tailwind`bg-red-400 px-6 py-3 rounded-xl`}
          >
            <Text style={tailwind`text-white font-semibold`}>Retry</Text>
          </Pressable>
        </View>
      ) : participants.length === 0 ? (
        <View style={tailwind`flex-1 items-center justify-center px-6 py-6`}>
          <Text style={tailwind`text-6xl mb-4`}>🏆</Text>
          <Text style={tailwind`text-xl font-semibold text-gray-900 mb-2`}>
            No Participants Yet
          </Text>
          <Text style={tailwind`text-gray-500 text-center`}>
            Add teams or players to get started with your tournament
          </Text>
        </View>
      ) : (
        <View style={tailwind`mt-10`}>
          {participants.map((item, index) =>
            renderParticipantCard({ item, index })
          )}
        </View>
      )}

      <AddParticipantModal
        visible={isModalVisible}
        selectedEntityType={selectedEntityType}
        entities={filteredEntities}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onClose={closeModal}
        onAddEntity={handleAddEntity}
        parentScrollY={parentScrollY}
      />
    </Animated.ScrollView>
  );
};

// Enhanced Modal Component
const AddParticipantModal = ({
  visible,
  selectedEntityType,
  entities,
  searchQuery,
  setSearchQuery,
  onClose,
  onAddEntity,
  parentScrollY,
}) => {
  const screenHeight = Dimensions.get('window').height;
  const renderEntityCard = ({ item, index }) => (
    <Pressable
      key={index}
      onPress={() => onAddEntity(item.public_id)}
      style={tailwind`bg-gray-50 rounded-xl p-4 mb-3 flex-row items-center`}
      android_ripple={{ color: 'rgba(59,130,246,0.1)' }}
    >
      <View
        style={tailwind`w-12 h-12 rounded-full bg-white items-center justify-center mr-4 shadow-sm`}
      >
        {selectedEntityType === 'team' ? <TeamIcon /> : <PlayerIcon />}
      </View>
      <View style={tailwind`flex-1`}>
        <Text style={tailwind`text-lg font-semibold text-gray-900 mb-1`}>
          {item.name}
        </Text>
      </View>
      <View
        style={tailwind`w-8 h-8 rounded-full bg-blue-600 items-center justify-center`}
      >
        <AddIcon />
      </View>
    </Pressable>
  );

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[tailwind`flex-1 bg-white/50`]}>
        <Pressable style={tailwind`flex-1`} onPress={onClose} />

        <View
          style={[
            tailwind`bg-white rounded-t-3xl`,
            { maxHeight: screenHeight * 0.85 }
          ]}
        >
          {/* Header */}
          <View
            style={tailwind`flex-row justify-between items-center p-6 border-b border-gray-100`}
          >
            <View>
              <Text style={tailwind`text-2xl font-bold text-gray-900`}>
                Add {selectedEntityType === 'team' ? 'Teams' : 'Players'}
              </Text>
              <Text style={tailwind`text-gray-500 mt-1`}>
                Select {selectedEntityType}s to add to the tournament
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={tailwind`w-10 h-10 rounded-full bg-gray-100 items-center justify-center`}
              android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
            >
              <CloseIcon />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={tailwind`px-6 py-4`}>
            <View
              style={tailwind`flex-row items-center bg-gray-100 rounded-xl px-4 py-3`}
            >
              <SearchIcon />
              <TextInput
                style={tailwind`flex-1 ml-3 text-gray-900`}
                placeholder={`Search ${selectedEntityType}s...`}
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Entities List */}
          <ScrollView
            style={tailwind`px-2`}
            contentContainerStyle={tailwind`pb-6`}
            showsVerticalScrollIndicator={false}
          >
            {entities.length === 0 ? (
              <View style={tailwind`items-center justify-center py-12`}>
                <Text style={tailwind`text-4xl mb-4`}>
                  {selectedEntityType === 'team' ? '👥' : '👤'}
                </Text>
                <Text style={tailwind`text-lg font-semibold text-gray-900 mb-2`}>
                  No {selectedEntityType}s found
                </Text>
                <Text style={tailwind`text-gray-500 text-center`}>
                  {searchQuery
                    ? `No ${selectedEntityType}s match your search`
                    : `No ${selectedEntityType}s available to add`}
                </Text>
              </View>
            ) : (
              entities.map((item, index) => renderEntityCard({ item, index }))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default TournamentParticipants;
