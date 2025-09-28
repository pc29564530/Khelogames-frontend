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
  Switch,
  Dimensions,
} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from '../screen/axios_config';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { getTeamPlayers, setTeamPlayer } from '../redux/actions/actions';
import { useSelector, useDispatch } from 'react-redux';
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
        setPlayerProfile(item);
        setFiltered(item);
      } catch (err) {
        console.error('unable to get the player profile: ', err);
      }
    };
    fetchPlayerProfile();
  }, [game.id]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
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
        const item = response.data || [];
        if (!item) {
          setMember([]);
          dispatch(getTeamPlayers([]));
        } else {
          dispatch(getTeamPlayers(item));
          setMember(item);
        }
      } catch (err) {
        console.error('unable to fetch all member of team/club ', err);
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
        }
        setIsSelectPlayerModal(false);
      } catch (err) {
        console.error('unable to add the player data: ', err);
        setMember([]);
      }
    },
    [players, axiosInstance, dispatch]
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
        console.error('Unable to remove the player from team: ', err);
      }
    },
    [players, axiosInstance, teamData.public_id, dispatch, game.name]
  );

  const togglePlayerSelection = (itm) => {
    setSelectedSquad((prevSquad) => [...prevSquad, itm]);
  };

  return (
    <View style={tailwind`flex-1 bg-white`}>
    <Animated.ScrollView
        style={tailwind`flex-1 bg-gray-50`}
        onScroll={handlerScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: 100,
            minHeight: sHeight+100,
        }}
    >
      {/* Add player button */}
      {authUser && teamData.user_id === authUser.id && (
            <View style={tailwind`items-center p-3`}>
                <TouchableOpacity
                onPress={() => setIsSelectPlayerModal(true)}
                style={tailwind`flex-row items-center gap-2 rounded-xl w-[95%] shadow-md p-4 justify-center bg-red-500`}
                >
                <FontAwesome name="user-plus" size={20} color="white" />
                <Text style={tailwind`text-lg font-semibold text-white`}>
                    Add Player
                </Text>
                </TouchableOpacity>
            </View>
      )}
      {/* Players list */}
      <View
      >
        <View style={tailwind`mb-2`}>
            <Text style={tailwind`text-lg font-bold`}>Players</Text>
        </View>
        {players?.map((item, index) => (
          <Pressable
            key={index}
            style={tailwind`flex-row items-center bg-white p-3 mb-2 rounded-xl shadow-sm`}
            onPress={() => handleProfile(item)}
          >
            {/* Avatar */}
            {item.media_url ? (
              <Image
                style={tailwind`w-12 h-12 rounded-full bg-gray-200`}
                source={{ uri: item.media_url }}
              />
            ) : (
              <View
                style={tailwind`w-12 h-12 rounded-full bg-gray-200 items-center justify-center`}
              >
                <Text style={tailwind`text-red-500 text-lg font-bold`}>
                  {item?.short_name}
                </Text>
              </View>
            )}

            {/* Info */}
            <View style={tailwind`ml-4 flex-1`}>
              <Text style={tailwind`text-black text-base font-semibold`}>
                {item?.name}
              </Text>
              <View style={tailwind`flex-row items-center mt-1`}>
                <Text style={tailwind`text-gray-600 text-sm mr-2`}>
                  {item?.position}
                </Text>
                <Text style={tailwind`text-gray-600 text-sm`}>
                  {item?.country}
                </Text>
              </View>
            </View>

            {/* Delete */}
            <Pressable
              style={tailwind`p-2 rounded-full bg-red-100`}
              onPress={() => handleRemovePlayer(item)}
            >
              <AntDesign name="delete" size={20} color="red" />
            </Pressable>
          </Pressable>
        ))}
        </View>
      </Animated.ScrollView>

      {/* Search Player Modal */}
      {isSelectPlayerModal && (
        <Modal
          transparent
          animationType="slide"
          visible={isSelectPlayerModal}
          onRequestClose={() => setIsSelectPlayerModal(false)}
        >
          <Pressable
            onPress={() => {setIsSelectPlayerModal(false)}}
            style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}
          >
            <View
              style={tailwind`bg-white rounded-t-2xl p-5 max-h-[80%]`}
            >
              <TextInput
                value={searchPlayer}
                onChangeText={(text) => {
                  setSearchPlayer(text);
                  handleSearchPlayer(text);
                }}
                placeholder="Search player"
                style={tailwind`border border-gray-300 rounded-lg px-4 py-2 mb-4`}
              />
              <ScrollView showsVerticalScrollIndicator={false}>
                {filtered.length > 0 ? (
                  filtered.map((item, index) => (
                    <Pressable
                      key={index}
                      onPress={() => handleAddPlayer(item)}
                      style={tailwind`py-2 flex-row gap-2`}
                    >   
                        {item.media_url ? (
                            <Image
                                style={tailwind`w-12 h-12 rounded-full bg-gray-200`}
                                source={{ uri: item.media_url }}
                            />
                            ) : (
                            <View
                                style={tailwind`w-12 h-12 rounded-full bg-gray-200 items-center justify-center`}
                            >
                                <Text style={tailwind`text-red-500 text-lg font-bold`}>
                                {item?.short_name}
                                </Text>
                            </View>
                        )}
                        <View style={tailwind`items-center`}>
                            <Text style={tailwind`text-lg`}>{item.name}</Text>
                        </View>
                    </Pressable>
                  ))
                ) : (
                  <View style={tailwind`items-center`}>
                    <Text style={tailwind`text-gray-600`}>
                      No players found
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

export default Members;
