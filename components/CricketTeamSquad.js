import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {Text, View, ScrollView, Pressable, Image, Modal, Switch, Dimensions, TextInput, FlatList} from 'react-native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from '../screen/axios_config';
import { useSelector, useDispatch } from 'react-redux';
import { getTeamPlayers, setCricketMatchToss, setCricketMatchSquad, getCricketMatchSquad } from '../redux/actions/actions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Animated, {useSharedValue, Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle} from 'react-native-reanimated';

const positions = require('../assets/position.json');


const CricketTeamSquad = ({match, parentScrollY, headerHeight, collapsedHeader}) => {
    const dispatch = useDispatch();
     
    const players = useSelector(state => state.players.players)
    const squad = useSelector(state => state.players.squad)
    const cricketToss = useSelector(state => state.cricketToss.cricketToss)
    const game = useSelector((state) => state.sportReducers.game);
    const [selectedSquad, setSelectedSquad] = useState([]);
    const homeTeamID = match?.homeTeam?.id;
    const awayTeamID = match?.awayTeam?.id;
    const homeTeamPublicID = match?.homeTeam?.public_id;
    const awayTeamPublicID = match?.awayTeam?.public_id;
    const [currentTeamPlayer, setCurrentTeamPlayer] = useState(null);
    const cricketMatchSquad= useSelector(state => state.players.squads)
    const [isOnBench,setIsOnBench] = useState([]);
    const [isPlayerModalVisible,setIsPlayerModalVisible] = useState(false);
    const [authUser, setAuthUser] = useState(null);
    const [searchText, setSearchText] = useState('');

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

    const {height: sHeight, width: sWidth} = Dimensions.get("window");

    const currentScrollY = useSharedValue(0);
    // scroll handler for header animation
    const handlerScroll = useAnimatedScrollHandler({
        onScroll:(event) => {
            if(parentScrollY.value === collapsedHeader){
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


    useEffect(() => {
        if (cricketToss) {
            if (cricketToss.tossDecision === "Batting") {
                setCurrentTeamPlayer(cricketToss.tossWonTeam.public_id === homeTeamPublicID ? homeTeamPublicID : awayTeamPublicID);
            } else {
                setCurrentTeamPlayer(cricketToss.tossWonTeam.public_id === awayTeamPublicID ? homeTeamPublicID : awayTeamPublicID);
            }
        }
    }, [cricketToss, homeTeamPublicID, awayTeamPublicID]);

    const toggleTeam = (teamPublicID) => {
        setCurrentTeamPlayer(teamPublicID)
    }

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTeamsMemberFunc/${currentTeamPlayer}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                dispatch(getTeamPlayers(response.data || []));
            } catch (err) {
                console.error("unable to fetch the team player: ", err);
            }
        }
        fetchPlayers();
    }, [currentTeamPlayer]);

    const selectPosition = (item) => {
        var pos;
        positions["positions"]?.map(( itm ) => {
            if (itm.code === item) {
                pos =  itm.name;
                return;
            }
        })
        return pos;
    }

    useEffect(() => {
        const fetchSquad = async () => {
            try {
                const authToken = await AsyncStorage.getItem("AccessToken")
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketMatchSquad`, {
                    params:{
                        match_public_id: match.public_id,
                        team_public_id: currentTeamPlayer
                    },
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                dispatch(getCricketMatchSquad(response.data || []));
            } catch (err) {
                console.error("failed to fetch cricket_squad: ", err);
            }
        }
        fetchSquad();
    }, [currentTeamPlayer])

    const handleSelectSquad = async () => {
        try {
            var data={
                match_public_id: match.public_id,
                team_public_id: homeTeamPublicID === currentTeamPlayer ? homeTeamPublicID : awayTeamPublicID,
                player: selectedSquad,
                on_bench: isOnBench
            }
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.post(`${BASE_URL}/${game.name}/addCricketSquad`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            dispatch(setCricketMatchSquad(response.data || []));
            
        } catch (err) {
            console.error("Failed to create the squad for match: ", err)
        }
    }

    const currentPlayingXI = cricketMatchSquad?.filter(squad => squad.on_bench === false);
    const currentOnBench = cricketMatchSquad?.filter(squad => squad.on_bench === true);
    
    const renderPlayers = () => {
            return (
                <View style={tailwind`flex-1`}>
                    {currentPlayingXI.length > 0 && (
                        <View style={tailwind`rounded-2xl bg-white p-4 shadow-lg mb-4`}>
                            <Text style={tailwind`text-xl font-bold mb-4 text-gray-800`}>Playing XI</Text>
                            {currentPlayingXI.map((itm, index) => (
                            <View key={index} style={tailwind`flex-row items-center mb-4`}>
                                {itm?.player?.media_url ? (
                                    <Image
                                        source={{ uri: itm.player.media_url }}
                                        style={tailwind`w-12 h-12 rounded-full bg-gray-200 mr-4`}
                                    />
                                ):(
                                    <View style={tailwind`w-12 h-12 rounded-full bg-red-200 items-center justify-center`}>
                                        <Text style={tailwind`text-white`}>{itm.player.name.charAt(0).toUpperCase()}</Text>
                                    </View>
                                )}
                                <View style={tailwind`px-2`}>
                                    <Text style={tailwind`text-base font-semibold text-gray-900`}>
                                        {itm.player.name}
                                    </Text>
                                    <View style={tailwind`flex-row items-center`}>
                                        <Text style={tailwind`text-sm text-gray-600`}>
                                            {itm.player.positions}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            ))}
                        </View>
                    )}

                    {currentOnBench.length > 0 && (
                    <View style={tailwind`rounded-2xl bg-white p-4 shadow-lg mb-4`}>
                        <Text style={tailwind`text-xl font-bold mb-4 text-gray-800`}>On Bench</Text>

                        {currentOnBench.map((item, index) => (
                            <View key={index} style={tailwind`flex-row items-center mb-4`}>
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
                                        {item.player.name}
                                    </Text>
                                    <View style={tailwind`flex-row items-center gap-4 mt-1`}>
                                        <Text style={tailwind`text-sm text-gray-600`}>
                                        {selectPosition(item.player.positions)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                    )}  
                </View>
            );
        }

    const togglePlayerSelection = (item) => {
        setSelectedSquad(prev => {
            if(prev.some(p => p.public_id === item.public_id)) {
                return prev.filter(p => p.public_id !== item.public_id);
            } else {
                return [...prev, item];
            }
        })
    }

    const AddTeamPlayerButton = () => {
        if(!authUser){
          return null;
        }
        if(currentTeamPlayer === homeTeamPublicID && match.homeTeam.user_id === authUser.id ){
          return (
              <Pressable
                    style={tailwind`flex-row items-center justify-center py-3 rounded-xl bg-red-400 mb-2`}
                    onPress={() => setIsPlayerModalVisible(true)}
                >
                    <MaterialIcons name="add" size={22} color="white" />
                    <Text style={tailwind`ml-2 text-white text-base font-semibold`}>
                        Select Squad
                    </Text>
                </Pressable>
          )
        } else if(currentTeamPlayer === awayTeamPublicID && match.awayTeam.user_id === authUser.id ){
          return (
                <Pressable
                    style={tailwind`flex-row items-center justify-center py-3 rounded-xl bg-red-400 mb-2`}
                    onPress={() => setIsPlayerModalVisible(true)}
                >
                    <MaterialIcons name="add" size={22} color="white" />
                    <Text style={tailwind`ml-2 text-white text-base font-semibold`}>
                        Select Squad
                    </Text>
                </Pressable>
          )
        }
        return null;
    }

    return (
        <View style={tailwind`flex-1`}>
            <Animated.ScrollView
                onScroll={handlerScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: 0,
                    paddingBottom: 100,
                    minHeight: sHeight + 100
                }}
            >
                    <Animated.View style={[tailwind`bg-white shadow-lg w-full px-2`, contentStyle]}>
                        {/* Team switcher */}
                        <View style={tailwind`flex-row mb-2 p-2 items-center justify-between gap-2 `}>
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
                        <AddTeamPlayerButton />
                    </Animated.View>

                <View style={tailwind`flex-row justify-center items-start p-2`}>
                        {renderPlayers()}
                </View>
                {isPlayerModalVisible && (
                    <Modal
                    visible={isPlayerModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setIsPlayerModalVisible(false)}
                  >
                    <View style={tailwind`flex-1 bg-black/60 justify-end`}>
                      <View style={tailwind`max-h-[85%] bg-white rounded-t-3xl shadow-2xl p-4`}>
                        
                        {/* Header */}
                        <View style={tailwind`flex-row justify-between items-center pb-3 border-b border-gray-200`}>
                          <Text style={tailwind`text-xl font-bold`}>Select Team Squad</Text>
                          <Pressable onPress={() => setIsPlayerModalVisible(false)}>
                            <AntDesign name="closecircle" size={26} color="black" />
                          </Pressable>
                        </View>
                  
                        {/* Player List */}
                        <FlatList
                          data={players.filter(
                            (p) =>
                              p.name.toLowerCase().includes(searchText.toLowerCase()) ||
                              p.position.toLowerCase().includes(searchText.toLowerCase())
                          )}
                          keyExtractor={(item) => item.public_id}
                          showsVerticalScrollIndicator={false}
                          contentContainerStyle={tailwind`pb-20`}
                          renderItem={({ item }) => {
                            const isSelected = selectedSquad?.some((p) => p.public_id === item.public_id);
                            const isBench = isOnBench.includes(item.id);
                  
                            return (
                              <View
                                style={tailwind.style(
                                  `flex-row items-center p-3 rounded-xl mb-3`,
                                  isSelected ? "bg-green-50 border-green-400" : "bg-gray-50 border-gray-200"
                                )}
                              >
                                {item.media_url ? (
                                    <Image
                                        source={{ uri: item.media_url }}
                                        style={tailwind`w-12 h-12 rounded-full mr-3 bg-gray-300`}
                                  />
                                ):(
                                    <View style={tailwind`w-12 h-12 rounded-full items-center justify-center bg-gray-300`}>
                                        <Text style={tailwind`text-white`}>
                                            {item.name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                  
                                <View style={tailwind`flex-1 px-2`}>
                                  <Text style={tailwind`text-base font-semibold`}>{item.name}</Text>
                                  <View style={tailwind`flex-row items-center gap-2`}>
                                    <Text style={tailwind`text-sm text-gray-500`}>
                                      {selectPosition(item.position)}
                                    </Text>
                                    <Text style={tailwind`text-sm text-gray-500`}>{item.country}</Text>
                                  </View>
                                </View>
                  
                                {/* Bench Toggle */}
                                <View style={tailwind`items-center mr-3`}>
                                  <Text style={tailwind`text-xs text-gray-500`}>Bench</Text>
                                  <Switch
                                    value={isBench}
                                    onValueChange={(value) => {
                                      if (value) {
                                        setIsOnBench((prev) => [...prev, item.public_id]);
                                      } else {
                                        setIsOnBench((prev) => prev.filter((public_id) => public_id !== item.public_id));
                                      }
                                    }}
                                    trackColor={{ false: "#ccc", true: "#34D399" }}
                                    thumbColor={isOnBench.includes(item.id)? "#10B981" : "#f4f3f4"}
                                  />
                                </View>
                  
                                {/* Selection Button */}
                                <Pressable onPress={() => togglePlayerSelection(item)}>
                                  <AntDesign
                                    name={isSelected ? "checkcircle" : "pluscircleo"}
                                    size={24}
                                    color={isSelected ? "green" : "gray"}
                                  />
                                </Pressable>
                              </View>
                            );
                          }}
                        />
                  
                        {/* Submit Button */}
                        <View style={tailwind`absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200`}>
                          <Pressable
                            onPress={handleSelectSquad}
                            disabled={selectedSquad.length === 0}
                            style={tailwind.style(
                              `py-3 rounded-xl items-center`,
                              selectedSquad.length === 0 ? "bg-gray-400" : "bg-green-600"
                            )}
                          >
                            <Text style={tailwind`text-white text-base font-semibold`}>
                              {selectedSquad.length > 0
                                ? `Add ${selectedSquad.length} Player(s) to Squad`
                                : "Select Players"}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </Modal>                  
                )}
            </Animated.ScrollView>
        </View>
    )
}

export default CricketTeamSquad;
