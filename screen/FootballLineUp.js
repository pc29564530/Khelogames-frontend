import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Image, Modal, Switch, Dimensions } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import { useSelector, useDispatch } from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { getTeamPlayers } from '../redux/actions/actions';
const positions = require('../assets/position.json');
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { validateFootballLineUp } from '../utils/validation/footballLineupValidation';
import { useFocusEffect } from '@react-navigation/native';

//TODO: Squad selection should display the current squad selected
const FootballLineUp = ({ item, parentScrollY, headerHeight, collapsedHeight }) => {
  const dispatch = useDispatch();
  const match = item;
  const homeTeamPublicID = match?.homeTeam?.public_id;
  const awayTeamPublicID = match?.awayTeam?.public_id;
  const [currentTeamPlayer, setCurrentTeamPlayer] = useState(homeTeamPublicID);
  const [isPlayerModalVisible, setIsPlayerModalVisible] = useState(false);
  const [isSubstituted, setIsSubstituted] = useState([]);
  const [currentSquad, setCurrentSquad] = useState([]);
  const [selectedSquad, setSelectedSquad] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    global: null,
    fields: {},
  })
  const [authUser, setAuthUser] = useState(null);

  const game = useSelector((state) => state.sportReducers.game);
  const players = useSelector((state) => state.players.players);

  const {height: sHeight, width: sWidth} = Dimensions.get("window");

  useFocusEffect(
    React.useCallback(() => {
      setCurrentTeamPlayer(homeTeamPublicID)
  },[]))

  //checking for auth user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("User");
        if (storedUser) {
          setAuthUser(JSON.parse(storedUser)); // parse because it's stored as string
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    };
    fetchUser();
  }, []);

  const currentScrollY = useSharedValue(0);
  // scroll handler for header animation
  const handlerScroll = useAnimatedScrollHandler({
    onScroll:(event) => {
        if(parentScrollY.value === collapsedHeight){
            parentScrollY.value = currentScrollY.value
        } else {
            parentScrollY.value = event.contentOffset.y
        }
      }
  })

  // Content animation style
  const contentStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
          parentScrollY.value,
          [0, 50],
          [1, 1],
          Extrapolation.CLAMP
      );

      return {
          opacity
      };
  });

  const toggleTeam = (teamID) => {
    setCurrentTeamPlayer(teamID);
  };

  const selectPosition = (item) => {
    if (!item) return null;
    const positionList = positions[game.name] || [];
    const matched = positionList.find((itm) => itm.code === item || itm.name === item);
    return matched ? matched.name : item;
  };

  //TODO: Need to make toggle or revert the squad

  // const togglePlayerSelection = (player) => {
  //   setSelectedSquad((prev) =>
  //     prev.some((p) => p.public_id === player.public_id)
  //       ? prev.filter((p) => p.public_id !== player.public_id)
  //       : [...prev, player]
  //   );

  //   setIsSubstituted((prev) =>
  //     prev.includes(player.public_id)
  //       ? prev
  //       : prev
  //   );
  // };

  const handleSelectSquad = async () => {
    try {
      setLoading(true);
      setError({ global: null, fields: {} });
      //Remove substitue for validation
      const payload = {
        match_public_id: match.public_id,
        team_public_id: currentTeamPlayer,
        player: selectedSquad,
        substitute: isSubstituted,
      };
      const validation = validateFootballLineUp(payload);
      if (!validation.isValid) {
        setError({ global: null, fields: validation.errors });
        return;
      }

      setError({ global: null, fields: {} });

      const data = {
        match_public_id: match.public_id,
        team_public_id:
          homeTeamPublicID === currentTeamPlayer
            ? homeTeamPublicID
            : awayTeamPublicID,
        player: selectedSquad,
        is_substituted: isSubstituted,
      };
      
      const authToken = await AsyncStorage.getItem('AccessToken');
      const response = await axiosInstance.post(
        `${BASE_URL}/${game.name}/addFootballMatchSquad`,
        data,
        {
          headers: {
            'Authorization': `bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const squadData = response.data.data;
      setCurrentSquad(Array.isArray(squadData) ? squadData : []);
      setIsPlayerModalVisible(false);
      setSelectedSquad([]);
      setIsSubstituted([]);
    } catch (err) {
      if(err?.response.data?.error?.code === "FORBIDDEN"){
        setError({
          global: err?.response?.data?.error?.message,
          fields: {},
        })
      } else {
        setError({
          global: "Unable to create squad for match",
          fields: err?.response?.data?.error?.fields || {}
        })
      }
      console.log('Unable to create squad for match: ', err);
    } finally {
      setLoading(false);
    }
  };

  // fetch current squad for team
  useEffect(() => {
    const fetchSquad = async () => {
      try {
        setLoading(true);
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(
          `${BASE_URL}/${game.name}/getFootballMatchSquad`,
          {
            params: {
              match_public_id: match.public_id.toString(),
              team_public_id: currentTeamPlayer.toString(),
            },
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const squadData = response.data.data;
        setCurrentSquad(Array.isArray(squadData) ? squadData : []);
      } catch (err) {
        const backendError = err?.response?.data?.error?.fields || {};
        setError({
          global: "Unable to fetch squad",
          fields: backendError,
        });
        console.error('failed to fetch football lineup: ', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSquad();
  }, [currentTeamPlayer]);

  // fetch all team players
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.get(
          `${BASE_URL}/${game.name}/getTeamsMemberFunc/${currentTeamPlayer}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        dispatch(getTeamPlayers(response.data.data || []));
      } catch (err) {
        setError({
          global: "Unable to fetch team players",
          fields: err?.response?.data?.error?.fields || {},
        })
        console.error('unable to fetch the team player: ', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, [currentTeamPlayer]);

  const currentLineUp = currentSquad?.filter((itm) => itm?.is_substitute == false);
  const substitutionPlayer = currentSquad?.filter(
    (itm) => itm?.is_substitute === true
  );

  const togglePlayerSelection = (itm) => {
    setSelectedSquad((prevSquad) => [...prevSquad, itm?.public_id]);
  };

  const AddTeamPlayerButton = () => {
    if(!authUser){
      return null;
    }
    if(currentTeamPlayer === homeTeamPublicID){
      return (
        <Pressable
          style={[tailwind`flex-row items-center justify-center py-3 rounded-xl`, { backgroundColor: '#f87171' }]}
          onPress={() => setIsPlayerModalVisible(true)}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <Text style={tailwind`ml-2 text-white text-sm font-semibold`}>
            Select Squad
          </Text>
        </Pressable>
      )
    } else if(currentTeamPlayer === awayTeamPublicID){
      return (
        <Pressable
          style={[tailwind`flex-row items-center justify-center py-3 rounded-xl`, { backgroundColor: '#f87171' }]}
          onPress={() => setIsPlayerModalVisible(true)}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <Text style={tailwind`ml-2 text-white text-sm font-semibold`}>
            Select Squad
          </Text>
        </Pressable>
      )
    }
    return null;
  }

  return (
    <Animated.ScrollView
        onScroll={handlerScroll}
        scrollEventThrottle={16}
        style={{ flex: 1, backgroundColor: '#0f172a' }}
        contentContainerStyle={{
            paddingTop: 0,
            paddingBottom: 100,
            minHeight: sHeight + 100
        }}
        showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[contentStyle, tailwind`w-full px-4 py-3 mb-2`, { backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
      {/* Team switcher */}
      <View style={tailwind`flex-row mb-2 items-center justify-between gap-2`}>
        <Pressable
          onPress={() => toggleTeam(homeTeamPublicID)}
          style={[
            tailwind`flex-1 rounded-xl items-center py-3`,
            homeTeamPublicID === currentTeamPlayer
              ? { backgroundColor: '#f87171', borderWidth: 1, borderColor: '#f87171' }
              : { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' },
          ]}
        >
          <Text style={[
            tailwind`text-sm font-semibold`,
            homeTeamPublicID === currentTeamPlayer ? { color: '#ffffff' } : { color: '#94a3b8' }
          ]}>
            {match?.homeTeam?.name}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => toggleTeam(awayTeamPublicID)}
          style={[
            tailwind`flex-1 rounded-xl items-center py-3`,
            awayTeamPublicID === currentTeamPlayer
              ? { backgroundColor: '#f87171', borderWidth: 1, borderColor: '#f87171' }
              : { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' },
          ]}
        >
          <Text style={[
            tailwind`text-sm font-semibold`,
            awayTeamPublicID === currentTeamPlayer ? { color: '#ffffff' } : { color: '#94a3b8' }
          ]}>
            {match?.awayTeam?.name}
          </Text>
        </Pressable>
      </View>

      {/* Squad selector */}
      {/* Check for team manager */}
      <AddTeamPlayerButton />
      </Animated.View>
      {/* Current Lineup */}
      {!loading && currentLineUp.length === 0 && substitutionPlayer.length === 0 && (
        <View style={[tailwind`mx-4 mt-4 p-4 rounded-2xl items-center`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
          <MaterialIcons name="people-outline" size={32} color="#475569" />
          <Text style={[tailwind`font-semibold text-sm mt-3 mb-1`, { color: '#f1f5f9' }]}>
            No Squad Selected
          </Text>
          <Text style={[tailwind`text-xs text-center`, { color: '#64748b' }]}>
            {error.global || "No squad has been selected for this team yet."}
          </Text>
        </View>
      )}
      {currentLineUp.length > 0 && (
        <View style={[tailwind`mx-4 mb-3 rounded-2xl overflow-hidden`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
          <View style={[tailwind`p-4`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
            <Text style={[tailwind`text-base font-bold`, { color: '#f1f5f9' }]}>
              Starting XI
            </Text>
          </View>
          {currentLineUp?.map((itm, index) => (
            <View key={index} style={[tailwind`flex-row items-center px-4 py-3`, { borderBottomWidth: 1, borderBottomColor: '#33415550' }]}>
              {itm?.player?.media_url ? (
                  <Image
                    source={{ uri: itm.player.media_url }}
                    style={[tailwind`w-11 h-11 rounded-full`, { backgroundColor: '#334155' }]}
                  />
              ):(
                <View style={[tailwind`w-11 h-11 rounded-full items-center justify-center`, { backgroundColor: '#f8717120' }]}>
                  <Text style={[tailwind`font-semibold`, { color: '#f87171' }]}>{itm.player.name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={tailwind`flex-1 ml-3`}>
                <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>
                  {itm.player.name}
                </Text>
                <View style={tailwind`flex-row items-center mt-0.5`}>
                  <Text style={[tailwind`text-xs`, { color: '#64748b' }]}>
                    {selectPosition(itm.player.positions)}
                  </Text>
                  {itm.player.country && (
                    <>
                      <Text style={[tailwind`text-xs mx-1.5`, { color: '#475569' }]}>•</Text>
                      <Text style={[tailwind`text-xs`, { color: '#64748b' }]}>
                        {itm.player.country}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Substitutions */}
      {substitutionPlayer.length > 0 && (
        <View style={[tailwind`mx-4 mb-3 rounded-2xl overflow-hidden`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
          <View style={[tailwind`p-4`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
            <Text style={[tailwind`text-base font-bold`, { color: '#f1f5f9' }]}>
              Substitutes
            </Text>
          </View>
          {substitutionPlayer.map((itm, index) => (
            <View key={index} style={[tailwind`flex-row items-center px-4 py-3`, { borderBottomWidth: 1, borderBottomColor: '#33415550' }]}>
              {itm?.player?.media_url ? (
                <Image
                  source={{ uri: itm.player.media_url }}
                  style={[tailwind`w-11 h-11 rounded-full`, { backgroundColor: '#334155' }]}
                />
              ):(
                <View style={[tailwind`w-11 h-11 rounded-full items-center justify-center`, { backgroundColor: '#334155' }]}>
                  <Text style={[tailwind`font-semibold`, { color: '#94a3b8' }]}>{itm.player.name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={tailwind`flex-1 ml-3`}>
                <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>
                  {itm.player.name}
                </Text>
                <View style={tailwind`flex-row items-center mt-0.5`}>
                  <Text style={[tailwind`text-xs`, { color: '#64748b' }]}>
                    {selectPosition(itm.player.positions)}
                  </Text>
                  {itm.player.country && (
                    <>
                      <Text style={[tailwind`text-xs mx-1.5`, { color: '#475569' }]}>•</Text>
                      <Text style={[tailwind`text-xs`, { color: '#64748b' }]}>
                        {itm.player.country}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Player selection modal */}
      {isPlayerModalVisible && (
        <Modal
          visible={isPlayerModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsPlayerModalVisible(false)}
        >
          <View style={tailwind`flex-1 bg-black/60 justify-end`}>
            <View
              style={[tailwind`max-h-[80%] rounded-t-2xl p-4`, { backgroundColor: '#1e293b' }]}
            >
              {/* Header */}
              <View style={tailwind`flex-row justify-between items-center mb-4`}>
                <Text style={[tailwind`text-xl font-bold`, { color: '#f1f5f9' }]}>Select Players</Text>
                <Pressable onPress={() => setIsPlayerModalVisible(false)}>
                  <AntDesign name="close" size={24} color="#94a3b8" />
                </Pressable>
              </View>

              {error?.global && (
                <View style={[tailwind`mx-4 mb-4 p-3 rounded-lg`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                  <Text style={[tailwind`text-sm`, { color: '#fca5a5' }]}>{error.global}</Text>
                </View>
              )}
              {error?.fields.player && (
                <View style={[tailwind`mx-4 mb-4 p-3 rounded-lg`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                  <Text style={[tailwind`text-sm`, { color: '#fca5a5' }]}>{error.fields.player}</Text>
                </View>
              )}

              {/* Player list */}
              <ScrollView contentContainerStyle={tailwind`pb-20 pt-2`}>
                {players.map((itm, index) => {
                  const isSelected = selectedSquad?.some((p) => p === itm.public_id);
                  return (
                    <View
                      key={index}
                      style={[
                        tailwind`flex-row items-center px-4 py-3`,
                        { borderBottomWidth: 1, borderBottomColor: '#33415550' },
                        isSelected && { backgroundColor: '#10b98115' }
                      ]}
                    >

                      {itm?.media_url ? (
                        <Image
                          source={{ uri: itm.media_url }}
                          style={[tailwind`w-11 h-11 rounded-full`, { backgroundColor: '#334155' }]}
                        />
                      ):(
                        <View style={[tailwind`w-11 h-11 rounded-full items-center justify-center`, { backgroundColor: '#334155' }]}>
                          <Text style={[tailwind`font-semibold`, { color: '#94a3b8' }]}>
                            {itm.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={tailwind`flex-1 ml-3`}>
                        <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>
                          {itm.name}
                        </Text>
                        <View style={tailwind`flex-row items-center mt-0.5`}>
                          <Text style={[tailwind`text-xs`, { color: '#64748b' }]}>
                            {selectPosition(itm.positions)}
                          </Text>
                          {itm.country && (
                            <>
                              <Text style={[tailwind`text-xs mx-1.5`, { color: '#475569' }]}>•</Text>
                              <Text style={[tailwind`text-xs`, { color: '#64748b' }]}>
                                {itm.country}
                              </Text>
                            </>
                          )}
                        </View>
                      </View>

                      {/* Substitute Toggle */}
                      <View style={tailwind`items-center mr-3`}>
                        <Text style={[tailwind`text-xs mb-1`, { color: '#64748b' }]}>Sub</Text>
                        <Switch
                          value={isSubstituted.includes(itm.public_id)}
                          disabled={!isSelected}
                          onValueChange={(value) => {
                            if (value) {
                              setIsSubstituted((prev) =>prev.includes(itm.public_id) ? prev : [...prev, itm.public_id]);
                            } else {
                              setIsSubstituted((prev) => prev.filter((pid) => pid !== itm.public_id));
                            }
                          }}
                          trackColor={{ false: '#334155', true: '#FCA5A5' }}
                          thumbColor={isSubstituted.includes(itm.public_id) ? '#f87171' : '#64748b'}
                          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                        />
                      </View>

                      {/* Selection Button */}
                      <Pressable onPress={() => togglePlayerSelection(itm)}>
                        <AntDesign
                          name={isSelected ? 'checkcircle' : 'pluscircleo'}
                          size={24}
                          color={isSelected ? '#10B981' : '#475569'}
                        />
                      </Pressable>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Submit Button */}
              <View style={[tailwind`absolute bottom-0 left-0 right-0 p-4`, { backgroundColor: '#1e293b', borderTopWidth: 1, borderTopColor: '#334155' }]}>
                <Pressable
                  onPress={() => {handleSelectSquad()}}
                  style={[
                    tailwind`py-3.5 rounded-xl items-center`,
                    selectedSquad.length === 0
                      ? { backgroundColor: '#334155' }
                      : { backgroundColor: '#f87171' },
                  ]}
                >
                  <Text style={[tailwind`text-base font-semibold`, { color: selectedSquad.length === 0 ? '#64748b' : '#ffffff' }]}>
                    {selectedSquad.length > 0 ? `Add ${selectedSquad.length} Player(s)` : 'Select Players'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Animated.ScrollView>
  );
};

export default FootballLineUp;