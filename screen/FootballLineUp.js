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
  //checking for auth user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("User");
        if (storedUser) {
          setAuthUser(JSON.parse(storedUser)); // parse because it’s stored as string
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
    let pos;
    positions[game.name].map((itm) => {
      if (itm.code === item) {
        pos = itm.name;
      }
    });
    return pos;
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

      const payload = {
        match_public_id: match.public_id,
        team_public_id: currentTeamPlayer,
        player: selectedSquad,
        is_substitute: isSubstituted,
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
        is_substitute: isSubstituted,
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
      console.log("Squad added successfully: ", response.data);
      setCurrentSquad(response.data.data || []);
    } catch (err) {
      setError({
        global: err?.response?.data?.error?.message || "Unable to create squad for match",
        fields: err?.response?.data?.error?.fields || {}
      })
      console.log('Unable to create squad for match: ', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 fetch current squad for team
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
        setCurrentSquad(response.data.data || []);
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
  const substitutionPlayer = currentSquad.filter(
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
          style={tailwind`flex-row items-center justify-center py-3 rounded-xl bg-red-400`}
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
          style={tailwind`flex-row items-center justify-center py-3 rounded-xl bg-red-400`}
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
        style={tailwind`flex-1 bg-gray-50`}
        contentContainerStyle={{
            paddingTop: 0,
            paddingBottom: 100,
            minHeight: sHeight + 100
        }}
        showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[contentStyle, tailwind`bg-white w-full px-4 py-3 mb-2`, {shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2}]}>
      {/* Team switcher */}
      <View style={tailwind`flex-row mb-2 items-center justify-between gap-2`}>
        <Pressable
          onPress={() => toggleTeam(homeTeamPublicID)}
          style={[
            tailwind`flex-1 rounded-xl items-center py-3 border`,
            homeTeamPublicID === currentTeamPlayer
              ? tailwind`bg-red-400 border-red-400`
              : tailwind`bg-white border-gray-200`,
          ]}
        >
          <Text style={[
            tailwind`text-sm font-semibold`,
            homeTeamPublicID === currentTeamPlayer ? tailwind`text-white` : tailwind`text-gray-600`
          ]}>
            {match?.homeTeam?.name}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => toggleTeam(awayTeamPublicID)}
          style={[
            tailwind`flex-1 rounded-xl items-center py-3 border`,
            awayTeamPublicID === currentTeamPlayer
              ? tailwind`bg-red-400 border-red-400`
              : tailwind`bg-white border-gray-200`,
          ]}
        >
          <Text style={[
            tailwind`text-sm font-semibold`,
            awayTeamPublicID === currentTeamPlayer ? tailwind`text-white` : tailwind`text-gray-600`
          ]}>
            {match?.awayTeam?.name}
          </Text>
        </Pressable>
      </View>

      {/* Squad selector */}
      <AddTeamPlayerButton />
      </Animated.View>
      {/* Current Lineup */}
      {!loading && currentLineUp.length === 0 && substitutionPlayer.length === 0 && (
        <View style={tailwind`mx-4 mt-4 p-4 bg-white rounded-2xl items-center`}>
          <MaterialIcons name="people-outline" size={32} color="#D1D5DB" />
          <Text style={tailwind`text-gray-900 font-semibold text-sm mt-3 mb-1`}>
            No Squad Selected
          </Text>
          <Text style={tailwind`text-gray-400 text-xs text-center`}>
            {error.global || "No squad has been selected for this team yet."}
          </Text>
        </View>
      )}
      {currentLineUp.length > 0 && (
        <View style={[tailwind`bg-white mx-4 mb-3 rounded-2xl overflow-hidden`, {shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2}]}>
          <View style={tailwind`p-4 border-b border-gray-100`}>
            <Text style={tailwind`text-base font-bold text-gray-900`}>
              Starting XI
            </Text>
          </View>
          {currentLineUp?.map((itm, index) => (
            <View key={index} style={tailwind`flex-row items-center px-4 py-3 border-b border-gray-50`}>
              {itm?.player?.media_url ? (
                  <Image
                    source={{ uri: itm.player.media_url }}
                    style={tailwind`w-11 h-11 rounded-full bg-gray-100`}
                  />
              ):(
                <View style={tailwind`w-11 h-11 rounded-full bg-red-100 items-center justify-center`}>
                  <Text style={tailwind`text-red-400 font-semibold`}>{itm.player.name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={tailwind`flex-1 ml-3`}>
                <Text style={tailwind`text-sm font-semibold text-gray-900`}>
                  {itm.player.name}
                </Text>
                <View style={tailwind`flex-row items-center mt-0.5`}>
                  <Text style={tailwind`text-xs text-gray-400`}>
                    {selectPosition(itm.player.positions)}
                  </Text>
                  {itm.player.country && (
                    <>
                      <Text style={tailwind`text-gray-300 text-xs mx-1.5`}>•</Text>
                      <Text style={tailwind`text-xs text-gray-400`}>
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
        <View style={[tailwind`bg-white mx-4 mb-3 rounded-2xl overflow-hidden`, {shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2}]}>
          <View style={tailwind`p-4 border-b border-gray-100`}>
            <Text style={tailwind`text-base font-bold text-gray-900`}>
              Substitutes
            </Text>
          </View>
          {substitutionPlayer.map((itm, index) => (
            <View key={index} style={tailwind`flex-row items-center px-4 py-3 border-b border-gray-50`}>
              {itm?.player?.media_url ? (
                <Image
                  source={{ uri: itm.player.media_url }}
                  style={tailwind`w-11 h-11 rounded-full bg-gray-100`}
                />
              ):(
                <View style={tailwind`w-11 h-11 rounded-full bg-gray-100 items-center justify-center`}>
                  <Text style={tailwind`text-gray-500 font-semibold`}>{itm.player.name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={tailwind`flex-1 ml-3`}>
                <Text style={tailwind`text-sm font-semibold text-gray-900`}>
                  {itm.player.name}
                </Text>
                <View style={tailwind`flex-row items-center mt-0.5`}>
                  <Text style={tailwind`text-xs text-gray-400`}>
                    {selectPosition(itm.player.positions)}
                  </Text>
                  {itm.player.country && (
                    <>
                      <Text style={tailwind`text-gray-300 text-xs mx-1.5`}>•</Text>
                      <Text style={tailwind`text-xs text-gray-400`}>
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
          <View style={tailwind`flex-1 bg-black bg-opacity-60 justify-end`}>
            <View
              style={tailwind`max-h-[80%] bg-white rounded-t-2xl shadow-xl p-4`}
            >
              {/* Header */}
              <View style={tailwind`flex-row justify-between items-center mb-4`}>
                <Text style={tailwind`text-xl font-bold`}>Select Players</Text>
                <Pressable onPress={() => setIsPlayerModalVisible(false)}>
                  <AntDesign name="close" size={24} color="black" />
                </Pressable>
              </View>

              {error?.global && (
                <View style={tailwind`mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg`}>
                  <Text style={tailwind`text-red-600 text-sm`}>{error.global}</Text>
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
                        tailwind`flex-row items-center px-4 py-3 border-b border-gray-50`,
                        isSelected && tailwind`bg-green-50`
                      ]}
                    >
                      {itm?.media_url ? (
                        <Image
                          source={{ uri: itm.media_url }}
                          style={tailwind`w-11 h-11 rounded-full bg-gray-100`}
                        />
                      ):(
                        <View style={tailwind`w-11 h-11 rounded-full bg-gray-100 items-center justify-center`}>
                          <Text style={tailwind`text-gray-500 font-semibold`}>
                            {itm.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={tailwind`flex-1 ml-3`}>
                        <Text style={tailwind`text-sm font-semibold text-gray-900`}>
                          {itm.name}
                        </Text>
                        <View style={tailwind`flex-row items-center mt-0.5`}>
                          <Text style={tailwind`text-xs text-gray-400`}>
                            {selectPosition(itm.position)}
                          </Text>
                          {itm.country && (
                            <>
                              <Text style={tailwind`text-gray-300 text-xs mx-1.5`}>•</Text>
                              <Text style={tailwind`text-xs text-gray-400`}>
                                {itm.country}
                              </Text>
                            </>
                          )}
                        </View>
                      </View>

                      {/* Substitute Toggle */}
                      <View style={tailwind`items-center mr-3`}>
                        <Text style={tailwind`text-xs text-gray-400 mb-1`}>Sub</Text>
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
                          trackColor={{ false: '#E5E7EB', true: '#FCA5A5' }}
                          thumbColor={isSubstituted.includes(itm.public_id) ? '#f87171' : '#f4f3f4'}
                          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                        />
                      </View>

                      {/* Selection Button */}
                      <Pressable onPress={() => togglePlayerSelection(itm)}>
                        <AntDesign
                          name={isSelected ? 'checkcircle' : 'pluscircleo'}
                          size={24}
                          color={isSelected ? '#10B981' : '#D1D5DB'}
                        />
                      </Pressable>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Submit Button */}
              <View style={tailwind`absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100`}>
                <Pressable
                  onPress={() => handleSelectSquad()}
                  style={[
                    tailwind`py-3.5 rounded-xl items-center`,
                    selectedSquad.length === 0 ? tailwind`bg-gray-300` : tailwind`bg-red-400`,
                    {shadowColor: '#f87171', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3}
                  ]}
                >
                  <Text style={tailwind`text-white text-base font-semibold`}>
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