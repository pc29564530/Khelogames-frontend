import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from '../screen/axios_config';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getTeamPlayers, setTeamPlayer } from '../redux/actions/actions';
import { useSelector, useDispatch } from 'react-redux';
import { logSilentError } from '../utils/errorHandler';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';

//Add the functionality to send the request to join to team

const Members = ({ teamData, parentScrollY, headerHeight, collapsedHeader }) => {
  const [member, setMember] = useState([]);
  const [searchPlayer, setSearchPlayer] = useState('');
  const [playerProfile, setPlayerProfile] = useState([]);
  const [isSelectPlayerModal, setIsSelectPlayerModal] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const dispatch = useDispatch();
  const game = useSelector((state) => state.sportReducers.game);
  const navigation = useNavigation();
  const players = useSelector((state) => state.players.players);
  const [isPlayerModalVisible, setIsPlayerModalVisible] = useState(false);
  const [isSubstituted, setIsSubstituted] = useState([]);
  const [selectedSquad, setSelectedSquad] = useState([]);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    global: null,
    fields: {},
  });

  const { height: sHeight, width: sWidth } = Dimensions.get("window");
  console.log("Height: ", sHeight)

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

  useEffect(() => {
        const fetchAuthUser = async () => {
        try {
            const currentAuthUserStr = await AsyncStorage.getItem("User");
            if (currentAuthUserStr) {
            setAuthUser(JSON.parse(currentAuthUserStr));
            }
        } catch (err) {
            console.error("Failed to load auth user:", err);
        }
        };
        fetchAuthUser();
    }, []);

  useEffect(() => {
    const fetchPlayerProfile = async () => {
      try {
        setLoading(true);
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(
          `${BASE_URL}/getPlayersBySport/${game.id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const item = response.data || [];
        console.log('Player profile response: ', item);
        setPlayerProfile(item.data);
        setFiltered(item.data);
      } catch (err) {
        logSilentError(err);
        console.error('unable to get the player profile: ', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayerProfile();
  }, [game.id]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError({ global: null, fields: {} });

        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(
          `${BASE_URL}/${game.name}/getTeamsMemberFunc/${teamData.public_id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Members response: ', response.data);
        const item = response.data || [];
        if (!item || !item.data) {
          setMember([]);
          dispatch(getTeamPlayers([]));
        } else {
          dispatch(getTeamPlayers(item.data));
          setMember(item.data);
        }
      } catch (err) {
        logSilentError(err);
        setError({
          global: 'Unable to load team members. Please try again.',
          fields: {},
        });
        console.error('unable to fetch all member of team/club ', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleProfile = (item) => {
    navigation.navigate('PlayerProfile', {
      publicID: item.public_id,
      from: 'team',
    });
  };

  const handleAddPlayer = useCallback(
    async (selectedItem) => {
      try {
        setLoading(true);
        const data = {
          team_public_id: teamData.public_id,
          player_public_id: selectedItem.public_id,
          join_date: new Date(),
        };
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.post(
          `${BASE_URL}/${game.name}/addTeamsMemberFunc`,
          data,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const item = response.data;
        if (item) {
          dispatch(setTeamPlayer(item));
          setMember([...member, item]);
        }
        setIsSelectPlayerModal(false);
        setSearchPlayer('');
      } catch (err) {
        logSilentError(err);
        setError({
          global: 'Unable to add player. Please try again.',
          fields: err.response?.data?.error?.fields || {},
        });
        console.error('unable to add the player data: ', err);
      } finally {
        setLoading(false);
      }
    },
    [players, member, axiosInstance, dispatch, teamData, game]
  );

  const handleSearchPlayer = (text) => {
    if (Array.isArray(playerProfile)) {
      const filterData = playerProfile.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      const filterBySport = filterData.filter((item) =>
        item.game_id === game.id ? item : []
      );
      setFiltered(filterBySport);
    }
  };

  const handleRemovePlayer = useCallback(
    async (item) => {
      try {
        setLoading(true);
        const authToken = await AsyncStorage.getItem('AccessToken');
        const data = {
          team_public_id: teamData.public_id,
          player_public_id: item.public_id,
          leave_date: new Date(),
        };
        const response = await axiosInstance.put(
          `${BASE_URL}/${game.name}/removePlayerFromTeam`,
          data,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const itemRes = response.data;
        const updatedPlayers = players.filter((p) => p.id !== itemRes.id);
        setMember(updatedPlayers);
        dispatch(getTeamPlayers(updatedPlayers));
      } catch (err) {
        logSilentError(err);
        setError({
          global: 'Unable to remove player. Please try again.',
          fields: {},
        });
        console.error('Unable to remove the player from team: ', err);
      } finally {
        setLoading(false);
      }
    },
    [players, axiosInstance, teamData.public_id, dispatch, game.name]
  );

  const togglePlayerSelection = (itm) => {
    setSelectedSquad((prevSquad) => [...prevSquad, itm]);
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={tailwind`flex-1 items-center justify-center py-20`}>
          <ActivityIndicator size="large" color="#f87171" />
          <Text style={tailwind`text-gray-500 mt-4 text-base`}>Loading players...</Text>
        </View>
      );
    }

    if (error?.global) {
      return (
        <View style={tailwind`flex-1 items-center justify-center px-6 py-20`}>
          <MaterialIcons name="error-outline" size={64} color="#9ca3af" />
          <Text style={tailwind`text-gray-700 text-lg font-semibold mt-4 text-center`}>
            Oops! Something went wrong
          </Text>
          <Text style={tailwind`text-gray-500 text-sm mt-2 text-center`}>
            {error.global}
          </Text>
        </View>
      );
    }

    return (
      <View style={tailwind`flex-1 items-center justify-center px-6 py-20`}>
        <MaterialIcons name="people-outline" size={64} color="#9ca3af" />
        <Text style={tailwind`text-gray-700 text-lg font-semibold mt-4 text-center`}>
          No Players Yet
        </Text>
        <Text style={tailwind`text-gray-500 text-sm mt-2 text-center mb-4`}>
          Add players to build your squad
        </Text>
        {authUser && teamData.user_id === authUser.id (
          <Pressable
            onPress={() => setIsSelectPlayerModal(true)}
            style={tailwind`bg-red-400 px-6 py-3 rounded-lg`}
          >
            <Text style={tailwind`text-white font-semibold`}>Add Player</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={tailwind`flex-1 bg-white`}>
      <Animated.ScrollView
        style={tailwind`flex-1 bg-gray-50`}
        onScroll={handlerScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: 100,
          minHeight: sHeight + 100,
        }}
      >
        {/* Add Player Button - Only for team owner */}
        {authUser && authUser.id === teamData.user_id && players?.length > 0 && (
          <View style={tailwind`px-4 mb-4`}>
            <Pressable
              onPress={() => setIsSelectPlayerModal(true)}
              style={[
                tailwind`flex-row items-center justify-center py-3 rounded-lg bg-red-400`,
                { shadowColor: '#f87171', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 }
              ]}
            >
              <MaterialIcons name="person-add" size={20} color="white" />
              <Text style={tailwind`text-white font-semibold ml-2`}>Add Player</Text>
            </Pressable>
          </View>
        )}

        {/* Error Message */}
        {error?.global && players?.length > 0 && (
          <View style={tailwind`mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg`}>
            <Text style={tailwind`text-red-600 text-sm`}>{error.global}</Text>
          </View>
        )}

        {/* Players List */}
        {!loading && !error?.global && players?.length > 0 ? (
          <View style={tailwind`px-4`}>
            <Text style={tailwind`text-lg font-bold text-gray-900 mb-3`}>
              Squad ({players.length})
            </Text>
            {players.map((item, index) => (
              <Pressable
                key={index}
                style={[
                  tailwind`flex-row items-center bg-white p-4 mb-2 rounded-xl`,
                  { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 }
                ]}
                onPress={() => handleProfile(item)}
              >
                {/* Avatar */}
                <View style={tailwind`relative`}>
                  {item.media_url ? (
                    <Image
                      style={tailwind`w-14 h-14 rounded-full`}
                      source={{ uri: item.media_url }}
                    />
                  ) : (
                    <View style={tailwind`w-14 h-14 rounded-full bg-gray-100 items-center justify-center`}>
                      <Text style={tailwind`text-red-400 text-xl font-bold`}>
                        {item?.short_name || item?.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Player Info */}
                <View style={tailwind`flex-1 ml-4`}>
                  <Text style={tailwind`text-gray-900 text-base font-semibold`} numberOfLines={1}>
                    {item?.name}
                  </Text>
                  <View style={tailwind`flex-row items-center mt-1`}>
                    {item?.position && (
                      <>
                        <Text style={tailwind`text-gray-500 text-sm`}>{item.position}</Text>
                        {item?.country && (
                          <View style={tailwind`h-1 w-1 rounded-full bg-gray-400 mx-2`} />
                        )}
                      </>
                    )}
                    {item?.country && (
                      <Text style={tailwind`text-gray-500 text-sm`}>{item.country}</Text>
                    )}
                  </View>
                </View>

                {/* Remove Button - Only for team owner */}
                {authUser && teamData.user_id === authUser.id && (
                  <Pressable
                    style={tailwind`p-2 ml-2`}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemovePlayer(item);
                    }}
                  >
                    <MaterialIcons name="close" size={20} color="#9ca3af" />
                  </Pressable>
                )}
              </Pressable>
            ))}
          </View>
        ) : (
          renderEmptyState()
        )}
      </Animated.ScrollView>

      {/* Add Player Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={isSelectPlayerModal}
        onRequestClose={() => {
          setIsSelectPlayerModal(false);
          setSearchPlayer('');
        }}
      >
        <View style={tailwind`flex-1 justify-end bg-black/50`}>
          <Pressable
            style={tailwind`flex-1`}
            onPress={() => {
              setIsSelectPlayerModal(false);
              setSearchPlayer('');
            }}
          />
          <View style={[tailwind`bg-white rounded-t-3xl`, { minHeight:sHeight*0.6 }]}>
            {/* Modal Header */}
            <View style={tailwind`flex-row items-center justify-between p-4 border-b border-gray-100`}>
              <Text style={tailwind`text-lg font-bold text-gray-900`}>Add Player</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsSelectPlayerModal(false);
                  setSearchPlayer('');
                }}
              >
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={tailwind`px-4 pt-4 pb-2`}>
              <View style={tailwind`flex-row items-center bg-gray-100 rounded-lg px-4 py-3`}>
                <MaterialIcons name="search" size={20} color="#9ca3af" />
                <TextInput
                  value={searchPlayer}
                  onChangeText={(text) => {
                    setSearchPlayer(text);
                    handleSearchPlayer(text);
                  }}
                  placeholder="Search player by name"
                  placeholderTextColor="#9ca3af"
                  style={tailwind`flex-1 ml-2 text-gray-900`}
                />
                {searchPlayer.length > 0 && (
                  <TouchableOpacity onPress={() => {
                    setSearchPlayer('');
                    setFiltered(playerProfile);
                  }}>
                    <MaterialIcons name="cancel" size={18} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Players List */}
            <ScrollView
              style={tailwind`flex-1`}
              contentContainerStyle={tailwind`px-4 pb-6`}
              showsVerticalScrollIndicator={false}
            >
              {loading ? (
                <View style={tailwind`items-center py-10`}>
                  <ActivityIndicator size="large" color="#f87171" />
                </View>
              ) : filtered.length > 0 ? (
                filtered.map((item, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleAddPlayer(item)}
                    style={tailwind`flex-row items-center py-3 border-b border-gray-100`}
                  >
                    {/* Avatar */}
                    {item.media_url ? (
                      <Image
                        style={tailwind`w-12 h-12 rounded-full`}
                        source={{ uri: item.media_url }}
                      />
                    ) : (
                      <View style={tailwind`w-12 h-12 rounded-full bg-gray-100 items-center justify-center`}>
                        <Text style={tailwind`text-red-400 text-lg font-bold`}>
                          {item?.name?.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}

                    {/* Player Info */}
                    <View style={tailwind`flex-1 ml-3`}>
                      <Text style={tailwind`text-gray-900 font-semibold`}>{item.name}</Text>
                      {item.position && (
                        <Text style={tailwind`text-gray-500 text-sm mt-0.5`}>{item.position}</Text>
                      )}
                    </View>

                    {/* Add Icon */}
                    <MaterialIcons name="add-circle-outline" size={24} color="#f87171" />
                  </Pressable>
                ))
              ) : (
                <View style={tailwind`items-center py-10`}>
                  <MaterialIcons name="person-search" size={64} color="#d1d5db" />
                  <Text style={tailwind`text-gray-500 mt-4 text-center`}>
                    {searchPlayer ? 'No players found' : 'No available players'}
                  </Text>
                  <Text style={tailwind`text-gray-400 text-sm mt-1 text-center px-8`}>
                    {searchPlayer ? 'Try a different search term' : 'Create player profiles first'}
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
