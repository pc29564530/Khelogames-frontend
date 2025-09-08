import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Image, Modal, Switch } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import { useSelector, useDispatch } from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { getTeamPlayers } from '../redux/actions/actions';
const positions = require('../assets/position.json');
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
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

  const game = useSelector((state) => state.sportReducers.game);
  const players = useSelector((state) => state.players.players);
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

  const handleSelectSquad = async () => {
    try {
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
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setCurrentSquad(response.data || []);
    } catch (err) {
      console.error('Failed to create the squad for match: ', err);
    }
  };

  // 🔹 fetch current squad for team
  useEffect(() => {
    const fetchSquad = async () => {
      try {
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
        setCurrentSquad(response.data || []);
      } catch (err) {
        console.error('failed to fetch football lineup: ', err);
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

        dispatch(getTeamPlayers(response.data || []));
      } catch (err) {
        console.error('unable to fetch the team player: ', err);
      }
    };
    fetchPlayers();
  }, [currentTeamPlayer]);

  const currentLineUp = currentSquad?.filter((itm) => itm.is_substitute == false);
  const substitutionPlayer = currentSquad.filter(
    (itm) => itm.is_substitute === true
  );

  const togglePlayerSelection = (itm) => {
    setSelectedSquad((prevSquad) => [...prevSquad, itm]);
  };

  return (
    <Animated.ScrollView
        onScroll={handlerScroll}
        scrollEventThrottle={16}
        style={tailwind`flex-1 bg-gray-50`}
        contentContainerStyle={{
            paddingTop: 10,
            paddingHorizontal: 16,
            paddingBottom: 100
        }}
        showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[contentStyle]}>
      {/* Team switcher */}
      <View
        style={tailwind`flex-row mb-2 p-2 items-center justify-between gap-2`}
      >
        <Pressable
          onPress={() => {
            toggleTeam(homeTeamPublicID);
          }}
          style={[
            tailwind`rounded-lg w-1/2 items-center shadow-lg bg-white p-2`,
            homeTeamPublicID === currentTeamPlayer
              ? tailwind`bg-red-400`
              : tailwind`bg-white`,
          ]}
        >
          <Text style={tailwind`text-lg font-bold`}>
            {match?.homeTeam?.name}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => toggleTeam(awayTeamPublicID)}
          style={[
            tailwind`rounded-lg w-1/2 items-center shadow-lg bg-white p-2`,
            awayTeamPublicID === currentTeamPlayer
              ? tailwind`bg-red-400`
              : tailwind`bg-white`,
          ]}
        >
          <Text style={tailwind`text-lg font-bold`}>
            {match?.awayTeam?.name}
          </Text>
        </Pressable>
      </View>

      {/* Squad selector */}
      <View style={tailwind`mb-2 gap-4 p-2`}>
        <Pressable
          style={tailwind`rounded-md shadow-lg bg-white p-4 items-center`}
          onPress={() => {
            setIsPlayerModalVisible(true);
          }}
        >
          <View style={tailwind`flex-row items-center`}>
            <MaterialIcons name="add" size={24} color="gray" />
            <Text style={tailwind`text-lg`}>Select Squad</Text>
          </View>
        </Pressable>
      </View>

      {/* Current Lineup */}
      {currentLineUp.length > 0 && (
        <View style={tailwind`rounded-2xl bg-white p-4 shadow-lg mb-4`}>
          <Text style={tailwind`text-xl font-bold mb-4 text-gray-800`}>
            Current Squad
          </Text>
          {currentLineUp?.map((itm, index) => (
            <View key={index} style={tailwind`flex-row items-center mb-4 gap-2`}>
              {item?.player?.media_url ? (
                  <Image
                    source={{ uri: itm.player.media_url }}
                    style={tailwind`w-12 h-12 rounded-full bg-gray-200 mr-4`}
                  />
              ):(
                <View style={tailwind`w-12 h-12 rounded-full bg-gray-200 items-center justify-center`}>
                  <Text>{itm.player.name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={tailwind`flex-1`}>
                <Text style={tailwind`text-base font-semibold text-gray-900`}>
                  {itm.player.name}
                </Text>
                <View style={tailwind`flex-row items-center gap-4 mt-1`}>
                  <Text style={tailwind`text-sm text-gray-600`}>
                    {selectPosition(itm.player.positions)}
                  </Text>
                  <Text style={tailwind`text-sm text-gray-600`}>•</Text>
                  <Text style={tailwind`text-sm text-gray-600`}>
                    {itm.player.country}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Substitutions */}
      {substitutionPlayer.length > 0 && (
        <View style={tailwind`rounded-2xl bg-white p-4 shadow-lg mb-4`}>
          <Text style={tailwind`text-xl font-bold mb-4 text-gray-800`}>
            Substitution
          </Text>
          {substitutionPlayer.map((itm, index) => (
            <View key={index} style={tailwind`flex-row items-center mb-4`}>
              <Image
                source={{ uri: itm.avatarUrl }}
                style={tailwind`w-12 h-12 rounded-full bg-gray-200 mr-4`}
              />
              <View style={tailwind`flex-1`}>
                <Text style={tailwind`text-base font-semibold text-gray-900`}>
                  {itm.name}
                </Text>
                <View style={tailwind`flex-row items-center gap-4 mt-1`}>
                  <Text style={tailwind`text-sm text-gray-600`}>
                    {selectPosition(itm.position)}
                  </Text>
                  <Text style={tailwind`text-sm text-gray-600`}>•</Text>
                  <Text style={tailwind`text-sm text-gray-600`}>
                    {itm.country}
                  </Text>
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

              {/* Player list */}
              <ScrollView contentContainerStyle={tailwind`gap-3 pb-4`}>
                {players.map((itm, index) => (
                  <View
                    key={index}
                    style={tailwind`flex-row items-center p-3 bg-gray-100 rounded-xl shadow-sm`}
                  >
                    <Image
                      source={{ uri: itm.avatarUrl || 'https://via.placeholder.com/40' }}
                      style={tailwind`w-10 h-10 rounded-full mr-3 bg-gray-300`}
                    />
                    <View style={tailwind`flex-1`}>
                      <Text style={tailwind`text-base font-semibold`}>
                        {itm.name}
                      </Text>
                      <View style={tailwind`flex-row items-center gap-3`}>
                        <Text style={tailwind`text-sm text-gray-500`}>
                          {selectPosition(itm.position)}
                        </Text>
                        <Text style={tailwind`text-sm text-gray-500`}>
                          {itm.country}
                        </Text>
                      </View>
                    </View>
                    <Pressable onPress={() => togglePlayerSelection(itm)}>
                      <AntDesign
                        name={
                          selectedSquad?.some(
                            (p) => p.public_id === itm.public_id
                          )
                            ? 'checkcircle'
                            : 'pluscircleo'
                        }
                        size={22}
                        color={
                          selectedSquad?.some((p) => p.id === itm.id)
                            ? 'green'
                            : 'gray'
                        }
                      />
                    </Pressable>
                    <View>
                      <Switch
                        value={isSubstituted.includes(itm.public_id)}
                        onValueChange={(value) => {
                          if (value) {
                            setIsSubstituted((prev) => [...prev, itm.public_id]);
                          } else {
                            setIsSubstituted((prev) =>
                              prev.filter((pid) => pid !== itm.public_id)
                            );
                          }
                        }}
                        trackColor={{ false: '#ccc', true: '#34D399' }}
                        thumbColor={
                          isSubstituted.includes(itm.public_id)
                            ? '#10B981'
                            : '#f4f3f4'
                        }
                      />
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Submit */}
              <Pressable
                onPress={() => handleSelectSquad()}
                style={tailwind`mt-4 bg-green-600 py-3 rounded-xl items-center`}
              >
                <Text style={tailwind`text-white text-base font-semibold`}>
                  Add to Squad
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
      </Animated.View>
    </Animated.ScrollView>
  );
};

export default FootballLineUp;
