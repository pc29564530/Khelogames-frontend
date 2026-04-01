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
  const authProfile = useSelector(state => state.profile.authProfile);
  const authUser = useSelector(state => state.profile.authUser);
  const currentProfile = useSelector(state => state.profile.currentProfile);
  const [isPlayerModalVisible, setIsPlayerModalVisible] = useState(false);
  const [isSubstituted, setIsSubstituted] = useState([]);
  const [selectedSquad, setSelectedSquad] = useState([]);
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
    const fetchPlayerProfile = async () => {
      try {
        setLoading(true);
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(
          `${BASE_URL}/get-available-players-by-sport/${game.id}`,
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
          `${BASE_URL}/${game.name}/addTeamMember`,
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
          dispatch(setTeamPlayer(item.data));
          setMember([...member, item.data]);
        }
        setIsSelectPlayerModal(false);
        setSearchPlayer('');
      } catch (err) {
        logSilentError(err);
         const backendErrors = err?.response?.data?.error?.fields;
            if(err?.response?.data?.error?.code === "FORBIDDEN") {
                setError({
                    global: err?.response?.data?.error?.message,
                    fields: {},
                })
            } else {
                setError({
                    global: "Unable to add player to team",
                    fields: backendErrors,
                });
            }
        console.error('Unable to add player to team', err);
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
         const backendErrors = err?.response?.data?.error?.fields;
          if(err?.response?.data?.error?.code === "FORBIDDEN") {
              setError({
                  global: err?.response?.data?.error?.message,
                  fields: {},
              })
          } else {
              setError({
                  global: "Unable to remove player from team",
                  fields: backendErrors,
              });
          }
        console.error('Unable to remove player from team: ', err);
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
        {/* {authProfile && teamData.user_id === authProfile.id ( */}
          <Pressable
            onPress={() => setIsSelectPlayerModal(true)}
            style={tailwind`bg-red-400 px-6 py-3 rounded-lg`}
          >
            <Text style={tailwind`text-white font-semibold`}>Add Player</Text>
          </Pressable>
        {/* )} */}
      </View>
    );
  };

  return (
    <View style={[tailwind`flex-1`,{ backgroundColor:"#0f172a"}]}>
      <Animated.ScrollView
        style={[tailwind`flex-1`,{backgroundColor:"#0f172a"}]}
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
        { authUser.id === teamData.user_id && players?.length >= 0 && (
          <View style={[tailwind`px-4 mb-4`]}>
            <Pressable
              onPress={() => setIsSelectPlayerModal(true)}
              style={[
                tailwind`flex-row items-center justify-center py-3 rounded-lg`,
                { shadowColor: '#f87171', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3, backgroundColor:"#f87171" }
              ]}
            >
              <MaterialIcons name="person-add" size={20} color="white" />
              <Text style={tailwind`text-white font-semibold ml-2`}>Add Player</Text>
            </Pressable>
          </View>
        )}

        {/* Error Message */}
        {error?.global && players?.length > 0 && (
          <View style={[tailwind`mx-4 mb-4 p-3 rounded-lg border`,{backgroundColor:"#1e293b",borderColor:"#ef4444"}]}>
            <Text style={tailwind`text-red-600 text-sm`}>{error.global}</Text>
          </View>
        )}

        {/* Players List */}
        {!loading && !error?.global && players?.length > 0 ? (
          <View style={tailwind`px-4`}>
            {players.map((item, index) => (
              <Pressable
                key={index}
                style={[
                  tailwind`flex-row items-center border p-4 mb-2 rounded-xl`,
                  { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, backgroundColor:"#1e293b", borderColor:"#334155" }
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
                    <View style={[tailwind`w-14 h-14 rounded-full items-center justify-center`, {backgroundColor:"#020617"}]}>
                      <Text style={[tailwind`text-xl font-bold`, {color:"#f87171"}]}>
                        {item?.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Player Info */}
                <View style={tailwind`flex-1 ml-4`}>
                  <Text style={[tailwind`text-gray-900 text-base font-semibold`, {color:"#f1f5f9"}]} numberOfLines={1}>
                    {item?.name}
                  </Text>
                  <View style={tailwind`flex-row items-center mt-1`}>
                        <Text style={[tailwind`text-sm`, {color: '#94a3b8'}]}>{item.positions}</Text>
                          <View style={tailwind`h-1 w-1 rounded-full bg-gray-400 mx-2`} />
                      <Text style={[tailwind`text-sm`, {color: '#94a3b8'} ]}>{item.country}</Text>
                  </View>
                </View>

                {/* Remove Button - Only for team owner */}
                {authProfile && teamData.user_id === authProfile.id && (
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
        <View style={tailwind`flex-1 justify-end bg-black/60`}>
          <Pressable
            style={tailwind`flex-1`}
            onPress={() => {
              setIsSelectPlayerModal(false);
              setSearchPlayer('');
            }}
          />

          <View
            style={[
              tailwind`rounded-t-3xl border-t`,
              { backgroundColor: "#1e293b", borderColor: "#334155", minHeight: sHeight * 0.6 }
            ]}
          >

            {/* Header */}
            <View
              style={[
                tailwind`flex-row items-center justify-between p-4 border-b`,
                { borderColor: "#334155" }
              ]}
            >
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#f1f5f9" }}>
                Add Player
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setIsSelectPlayerModal(false);
                  setSearchPlayer('');
                }}
              >
                <MaterialIcons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Error */}
            {error?.global && (
              <View
                style={[
                  tailwind`mx-3 mb-3 p-3 rounded-lg border`,
                  { backgroundColor: "#020617", borderColor: "#ef4444" }
                ]}
              >
                <Text style={{ color: "#ef4444", fontSize: 13 }}>
                  {error.global}
                </Text>
              </View>
            )}

            {/* Search */}
            <View style={tailwind`px-4 pt-4 pb-2`}>
              <View
                style={[
                  tailwind`flex-row items-center rounded-lg px-4 py-3 border`,
                  { backgroundColor: "#0f172a", borderColor: "#334155" }
                ]}
              >
                <MaterialIcons name="search" size={20} color="#94a3b8" />

                <TextInput
                  value={searchPlayer}
                  onChangeText={(text) => {
                    setSearchPlayer(text);
                    handleSearchPlayer(text);
                  }}
                  placeholder="Search player by name"
                  placeholderTextColor="#64748b"
                  style={{ flex: 1, marginLeft: 8, color: "#94a3b8", padding: 16, fontSize: 15, }}
                />

                {searchPlayer.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchPlayer('');
                      setFiltered(playerProfile);
                    }}
                  >
                    <MaterialIcons name="cancel" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Player list */}
            <ScrollView
              style={tailwind`flex-1`}
              contentContainerStyle={tailwind`px-4 pb-6`}
              showsVerticalScrollIndicator={false}
            >
              {loading ? (
                <View style={tailwind`items-center py-10`}>
                  <ActivityIndicator size="large" color="#f87171" />
                </View>

              ) : filtered?.length > 0 ? (

                filtered.map((item, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleAddPlayer(item)}
                    style={[
                      tailwind`flex-row items-center py-3 border-b`,
                      { borderColor: "#334155" }
                    ]}
                  >

                    {/* Avatar */}
                    {item.media_url ? (
                      <Image
                        style={tailwind`w-12 h-12 rounded-full`}
                        source={{ uri: item.media_url }}
                      />
                    ) : (
                      <View
                        style={[
                          tailwind`w-12 h-12 rounded-full items-center justify-center`,
                          { backgroundColor: "#020617" }
                        ]}
                      >
                        <Text style={{ color: "#f87171", fontSize: 16, fontWeight: "700" }}>
                          {item?.name?.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    {/* Player info */}
                    <View style={tailwind`flex-1 ml-3`}>
                      <Text style={{ color: "#f1f5f9", fontWeight: "600" }}>
                        {item.name}
                      </Text>
                        <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>
                          {item.positions}
                        </Text>
                    </View>

                    {/* Add icon */}
                    <MaterialIcons
                      name="add-circle-outline"
                      size={24}
                      color="#f87171"
                    />
                  </Pressable>
                ))

              ) : (

                <View style={tailwind`items-center py-10`}>
                  <MaterialIcons name="person-search" size={64} color="#475569" />

                  <Text style={{ color: "#94a3b8", marginTop: 16, textAlign: "center" }}>
                    {searchPlayer ? "No players found" : "No available players"}
                  </Text>

                  <Text
                    style={{
                      color: "#64748b",
                      fontSize: 12,
                      marginTop: 4,
                      textAlign: "center",
                      paddingHorizontal: 32
                    }}
                  >
                    {searchPlayer
                      ? "Try a different search term"
                      : "Create player profiles first"}
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
