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
    const [currentTeamPlayer, setCurrentTeamPlayer] = useState(homeTeamPublicID);
    const cricketMatchSquad= useSelector(state => state.players.squads)
    const [isPlayerModalVisible,setIsPlayerModalVisible] = useState(false);
    const [authUser, setAuthUser] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const [loading, setLoading] = useState(false);

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
                setLoading(true);
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTeamsMemberFunc/${currentTeamPlayer}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                dispatch(getTeamPlayers(response.data.data || []));
            } catch (err) {
                setError({
                    global: "Unable to fetch team players",
                    fields: err?.response?.data?.error?.fields || {},
                })
                console.error("unable to fetch the team player: ", err);
            } finally {
                setLoading(false);
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
                setLoading(true);
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
                dispatch(getCricketMatchSquad(response.data.data || []));
            } catch (err) {
                setError({
                    global: "Unable to fetch team squad",
                    fields: err?.response?.data?.error?.fields || {},
                })
                console.error("failed to fetch cricket_squad: ", err);
            } finally {
                setLoading(false);
            }
        }
        fetchSquad();
    }, [currentTeamPlayer])

    const handleSelectSquad = async () => {
        try {
            setLoading(true);
            setError({ global: null, fields: {} });

            var data={
                match_public_id: match.public_id,
                team_public_id: homeTeamPublicID === currentTeamPlayer ? homeTeamPublicID : awayTeamPublicID,
                player: selectedSquad,
            }
            const authToken = await AsyncStorage.getItem("AccessToken")
            const response = await axiosInstance.post(`${BASE_URL}/${game.name}/addCricketSquad`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            dispatch(setCricketMatchSquad(response.data.data || []));
            setIsPlayerModalVisible(false);
            setSelectedSquad([]);
        } catch (err) {
            setError({
                global: "Unable to add squad to match",
                fields: err?.response?.data?.error?.fields || {},
            })
            console.error("Failed to create the squad for match: ", err)
        } finally {
            setLoading(false);
        }
    }

    const currentPlayingXI = cricketMatchSquad?.filter(squad => squad.on_bench === false);
    const currentOnBench = cricketMatchSquad?.filter(squad => squad.on_bench === true);
    
    const renderPlayers = () => {
            return (
                <View style={tailwind`flex-1`}>
                    {currentPlayingXI.length > 0 && (
                        <View style={[tailwind`bg-white mx-4 mb-3 rounded-2xl overflow-hidden`, {shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2}]}>
                            <View style={tailwind`p-4 border-b border-gray-100`}>
                                <Text style={tailwind`text-base font-bold text-gray-900`}>Playing XI</Text>
                            </View>
                            {currentPlayingXI.map((itm, index) => (
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
                                    </View>
                                </View>
                            </View>
                            ))}
                        </View>
                    )}

                    {currentOnBench.length > 0 && (
                    <View style={[tailwind`bg-white mx-4 mb-3 rounded-2xl overflow-hidden`, {shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2}]}>
                        <View style={tailwind`p-4 border-b border-gray-100`}>
                            <Text style={tailwind`text-base font-bold text-gray-900`}>On Bench</Text>
                        </View>

                        {currentOnBench.map((item, index) => (
                            <View key={index} style={tailwind`flex-row items-center px-4 py-3 border-b border-gray-50`}>
                                {item?.player?.media_url ? (
                                    <Image
                                        source={{ uri: item.player.media_url }}
                                        style={tailwind`w-11 h-11 rounded-full bg-gray-100`}
                                    />
                                ):(
                                    <View style={tailwind`w-11 h-11 rounded-full bg-gray-100 items-center justify-center`}>
                                        <Text style={tailwind`text-gray-500 font-semibold`}>{item.player.name.charAt(0).toUpperCase()}</Text>
                                    </View>
                                )}
                                <View style={tailwind`flex-1 ml-3`}>
                                    <Text style={tailwind`text-sm font-semibold text-gray-900`}>
                                        {item.player.name}
                                    </Text>
                                    <View style={tailwind`flex-row items-center mt-0.5`}>
                                        <Text style={tailwind`text-xs text-gray-400`}>
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
            if (prev.some(p => p.public_id === item.public_id)) {
              return prev.filter(p => p.public_id !== item.public_id);
            } else {
              return [...prev, { ...item, on_bench: false }];
            }
        });
    }

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
        } else if(currentTeamPlayer === awayTeamPublicID ){
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
                    <Animated.View style={[tailwind`bg-white w-full px-4 py-3 mb-2`, contentStyle, {shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2}]}>
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

                {/* Error Display */}
                {error.global && currentPlayingXI.length === 0 && currentOnBench.length === 0 && (
                    <View style={tailwind`mx-4 mt-4 p-4 bg-white rounded-2xl items-center`}>
                        <MaterialIcons name="people-outline" size={32} color="#D1D5DB" />
                        <Text style={tailwind`text-gray-900 font-semibold text-sm mt-3 mb-1`}>
                            No Squad Selected
                        </Text>
                        <Text style={tailwind`text-gray-400 text-xs text-center`}>
                            {error.global}
                        </Text>
                    </View>
                )}

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

                        {/* Search Player */}
                        <View>
                            <TextInput
                                style={tailwind`bg-gray-100 rounded-lg px-4 py-2 mb-3 mt-2`}
                                placeholder="Search players..."
                                value={searchText}
                                onChangeText={setSearchText}
                            />
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
                          contentContainerStyle={tailwind`pb-20 pt-2`}
                          renderItem={({ item }) => {
                            const isSelected = selectedSquad?.some((p) => p.public_id === item.public_id);

                            return (
                              <View
                                style={[
                                  tailwind`flex-row items-center px-4 py-3 border-b border-gray-50`,
                                  isSelected && tailwind`bg-green-50`
                                ]}
                              >
                                {item.media_url ? (
                                    <Image
                                        source={{ uri: item.media_url }}
                                        style={tailwind`w-11 h-11 rounded-full bg-gray-100`}
                                  />
                                ):(
                                    <View style={tailwind`w-11 h-11 rounded-full items-center justify-center bg-gray-100`}>
                                        <Text style={tailwind`text-gray-500 font-semibold`}>
                                            {item.name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                )}

                                <View style={tailwind`flex-1 ml-3`}>
                                  <Text style={tailwind`text-sm font-semibold text-gray-900`}>{item.name}</Text>
                                  <View style={tailwind`flex-row items-center mt-0.5`}>
                                    <Text style={tailwind`text-xs text-gray-400`}>
                                      {selectPosition(item.position)}
                                    </Text>
                                    {item.country && (
                                      <>
                                        <Text style={tailwind`text-gray-300 text-xs mx-1.5`}>•</Text>
                                        <Text style={tailwind`text-xs text-gray-400`}>{item.country}</Text>
                                      </>
                                    )}
                                  </View>
                                </View>

                                {/* Bench Toggle */}
                                <View style={tailwind`items-center mr-3`}>
                                  <Text style={tailwind`text-xs text-gray-400 mb-1`}>Bench</Text>
                                  <Switch
                                        value={isSelected ? selectedSquad.find(p => p.public_id === item.public_id)?.on_bench : false}
                                        onValueChange={(value) => {
                                            if (!isSelected) return;
                                            setSelectedSquad(prev =>
                                            prev.map(p =>
                                                p.public_id === item.public_id ? { ...p, on_bench: value } : p
                                            )
                                            );
                                        }}
                                        disabled={!isSelected}
                                        trackColor={{ false: "#E5E7EB", true: "#FCA5A5" }}
                                        thumbColor={isSelected && selectedSquad.find(p => p.public_id === item.public_id)?.on_bench ? "#f87171" : "#f4f3f4"}
                                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                                    />
                                </View>

                                {/* Selection Button */}
                                <Pressable onPress={() => togglePlayerSelection(item)}>
                                  <AntDesign
                                    name={isSelected ? "checkcircle" : "pluscircleo"}
                                    size={24}
                                    color={isSelected ? "#10B981" : "#D1D5DB"}
                                  />
                                </Pressable>
                              </View>
                            );
                          }}
                        />
                  
                        {/* Submit Button */}
                        <View style={tailwind`absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100`}>
                          {error.global && (
                            <View style={tailwind`mb-2 p-2 bg-red-50 rounded-lg`}>
                              <Text style={tailwind`text-red-600 text-xs text-center`}>
                                {error.global}
                              </Text>
                            </View>
                          )}
                          <Pressable
                            onPress={handleSelectSquad}
                            disabled={selectedSquad.length === 0 || loading}
                            style={[
                              tailwind`py-3.5 rounded-xl items-center`,
                              selectedSquad.length === 0 || loading ? tailwind`bg-gray-300` : tailwind`bg-red-400`,
                              {shadowColor: '#f87171', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3}
                            ]}
                          >
                            <Text style={tailwind`text-white text-base font-semibold`}>
                              {loading ? 'Saving...' : selectedSquad.length > 0
                                ? `Add ${selectedSquad.length} Player(s)`
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
