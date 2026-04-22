import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {Text, View, ScrollView, Pressable, Image, Modal, Switch, Dimensions, TextInput, FlatList, useWindowDimensions} from 'react-native';
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
    const authProfile = useSelector(state => state.profile.authProfile)
    const game = useSelector((state) => state.sportReducers.game);
    const [selectedSquad, setSelectedSquad] = useState([]);
    const homeTeamID = match?.homeTeam?.id;
    const awayTeamID = match?.awayTeam?.id;
    const homeTeamPublicID = match?.homeTeam?.public_id;
    const awayTeamPublicID = match?.awayTeam?.public_id;
    const [currentTeamPlayer, setCurrentTeamPlayer] = useState(homeTeamPublicID);
    const cricketMatchSquad= useSelector(state => state.players.squads)
    const [isPlayerModalVisible,setIsPlayerModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const [loading, setLoading] = useState(false);

    const {height: sHeight, width: sWidth} = useWindowDimensions();

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
        if (cricketToss && cricketToss.tossWonTeam) {
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
            const errorCode = err?.response?.data?.error?.code;
            const errorMessage = err?.response?.data?.error?.message;
            const backendFields = err?.response?.data?.error?.fields;

            if (backendFields && Object.keys(backendFields).length > 0) {
                setError({ global: errorMessage || "Invalid input", fields: backendFields });
            } else if (errorCode && errorCode !== "INTERNAL_ERROR") {
                setError({ global: errorMessage, fields: {} });
            } else {
                setError({ global: "Unable to add cricket match squad", fields: {} });
            }
            console.error("Failed to add the squad for match: ", err?.response?.data?.error)
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
                        <View style={[tailwind`mx-4 mb-3 rounded-2xl overflow-hidden`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
                            <View style={[tailwind`p-4`, {borderBottomWidth: 1, borderBottomColor: '#334155'}]}>
                                <Text style={[tailwind`text-base font-bold`, {color: '#f1f5f9'}]}>Playing XI</Text>
                            </View>
                            {currentPlayingXI.map((itm, index) => (
                            <View key={index} style={[tailwind`flex-row items-center px-4 py-3`, {borderBottomWidth: 1, borderBottomColor: '#33415550'}]}>
                                {itm?.player?.media_url ? (
                                    <Image
                                        source={{ uri: itm.player.media_url }}
                                        style={[tailwind`w-11 h-11 rounded-full`, {backgroundColor: '#334155'}]}
                                    />
                                ):(
                                    <View style={[tailwind`w-11 h-11 rounded-full items-center justify-center`, {backgroundColor: '#f8717120'}]}>
                                        <Text style={[tailwind`font-semibold`, {color: '#f87171'}]}>{itm?.player?.name?.charAt(0).toUpperCase()}</Text>
                                    </View>
                                )}
                                <View style={tailwind`flex-1 ml-3`}>
                                    <Text style={[tailwind`text-sm font-semibold`, {color: '#f1f5f9'}]}>
                                        {itm.player.name}
                                    </Text>
                                    <View style={tailwind`flex-row items-center mt-0.5`}>
                                        <Text style={[tailwind`text-xs`, {color: '#64748b'}]}>
                                            {selectPosition(itm.player.positions)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            ))}
                        </View>
                    )}

                    {currentOnBench.length > 0 && (
                    <View style={[tailwind`mx-4 mb-3 rounded-2xl overflow-hidden`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
                        <View style={[tailwind`p-4`, {borderBottomWidth: 1, borderBottomColor: '#334155'}]}>
                            <Text style={[tailwind`text-base font-bold`, {color: '#f1f5f9'}]}>On Bench</Text>
                        </View>

                        {currentOnBench.map((item, index) => (
                            <View key={index} style={[tailwind`flex-row items-center px-4 py-3`, {borderBottomWidth: 1, borderBottomColor: '#33415550'}]}>
                                {item?.player?.media_url ? (
                                    <Image
                                        source={{ uri: item.player.media_url }}
                                        style={[tailwind`w-11 h-11 rounded-full`, {backgroundColor: '#334155'}]}
                                    />
                                ):(
                                    <View style={[tailwind`w-11 h-11 rounded-full items-center justify-center`, {backgroundColor: '#334155'}]}>
                                        <Text style={[tailwind`font-semibold`, {color: '#94a3b8'}]}>{item.player.name.charAt(0).toUpperCase()}</Text>
                                    </View>
                                )}
                                <View style={tailwind`flex-1 ml-3`}>
                                    <Text style={[tailwind`text-sm font-semibold`, {color: '#f1f5f9'}]}>
                                        {item.player.name}
                                    </Text>
                                    <View style={tailwind`flex-row items-center mt-0.5`}>
                                        <Text style={[tailwind`text-xs`, {color: '#64748b'}]}>
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
    //Check the team manager and scorer for squad add
    const AddTeamPlayerButton = () => {
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

    return (
        <View style={tailwind`flex-1`}>
            <Animated.ScrollView
                onScroll={handlerScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                style={{flex: 1, backgroundColor: '#0f172a'}}
                contentContainerStyle={{
                    paddingTop: 0,
                    paddingBottom: 100,
                    minHeight: sHeight + 100
                }}
            >
                    <Animated.View style={[tailwind` w-full px-4 py-3 mb-2`, contentStyle, {backgroundColor: '#1e293b', shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2}]}>
                        {/* Team switcher */}
                        <View style={tailwind`flex-row mb-2 items-center justify-between gap-2`}>
                            <Pressable
                            onPress={() => toggleTeam(homeTeamPublicID)}
                            style={[
                                tailwind`flex-1 rounded-xl items-center py-3 border`,
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
                                    tailwind`flex-1 rounded-xl items-center py-3 border`,
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
                        {/* Add scorer check and manager check and tournament host check */}
                        {match.status_code === "not_started" && (
                            <AddTeamPlayerButton />
                        )}
                    </Animated.View>

                {/* Empty State Display */}
                {!loading && currentPlayingXI.length === 0 && currentOnBench.length === 0 && (
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
                      <View style={[tailwind`max-h-[80%] rounded-t-2xl p-4`, { backgroundColor: '#1e293b' }]}>
                        
                        {/* Header */}
                        <View style={[tailwind`flex-row justify-between items-center pb-3`, {borderBottomWidth: 1, borderBottomColor: '#334155'}]}>
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

                        {/* Search Player */}
                        {/* <View>
                            <TextInput
                                style={tailwind`bg-gray-100 rounded-lg px-4 py-2 mb-3 mt-2`}
                                placeholder="Search players..."
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View> */}
                  
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
                                    tailwind`flex-row items-center px-4 py-3`,
                                    { borderBottomWidth: 1, borderBottomColor: '#33415550' },
                                    isSelected && { backgroundColor: '#10b98115' }
                                ]}
                                >
                                {item.media_url ? (
                                    <Image
                                        source={{ uri: item.media_url }}
                                        style={[tailwind`w-11 h-11 rounded-full`, { backgroundColor: '#334155' }]}
                                  />
                                ):(
                                    <View style={[tailwind`w-11 h-11 rounded-full items-center justify-center`, { backgroundColor: '#334155' }]}>
                                        <Text style={[tailwind`font-semibold`, { color: '#94a3b8' }]}>
                                            {item.name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                )}

                                <View style={tailwind`flex-1 ml-3`}>
                                    <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>
                                        {item.name}
                                    </Text>
                                    <View style={tailwind`flex-row items-center mt-0.5`}>
                                        <Text style={[tailwind`text-xs`, { color: '#64748b' }]}>
                                            {selectPosition(item.position)}
                                        </Text>
                                        {item.country && (
                                            <>
                                                <Text style={[tailwind`text-xs mx-1.5`, { color: '#475569' }]}>•</Text>
                                                <Text style={[tailwind`text-xs`, { color: '#64748b' }]}>
                                                    {item.country}
                                                </Text>
                                            </>
                                        )}
                                    </View>
                                </View>

                                {/* Bench Toggle */}
                                <View style={tailwind`items-center mr-3`}>
                                  <Text style={[tailwind`text-xs text-gray-400 mb-1`, { color: '#64748b' }]}>Bench</Text>
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
                                        trackColor={{ false: '#334155', true: '#FCA5A5' }}
                                        thumbColor={isSelected && selectedSquad.find(p => p.public_id === item.public_id)?.on_bench ? "#f87171" : "#64748b"}
                                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                                    />
                                </View>

                                {/* Selection Button */}
                                <Pressable onPress={() => togglePlayerSelection(item)}>
                                  <AntDesign
                                    name={isSelected ? "checkcircle" : "pluscircleo"}
                                    size={24}
                                    color={isSelected ? "#10B981" : "#475569"}
                                  />
                                </Pressable>
                              </View>
                            );
                          }}
                        />
                  
                        {/* Submit Button */}
                        <View style={[tailwind`absolute bottom-0 left-0 right-0 p-4 border-t-100`, { backgroundColor: '#1e293b', borderTopWidth: 1, borderTopColor: '#334155' }]}>
                          {error.global && (
                            <View style={[tailwind`mb-2 p-2 rounded-lg`, {backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130'}]}>
                              <Text style={[tailwind`text-xs text-center`, {color: '#fca5a5'}]}>
                                {error.global}
                              </Text>
                            </View>
                          )}
                          <Pressable
                            onPress={handleSelectSquad}
                            disabled={selectedSquad.length === 0 || loading}
                            style={[
                              tailwind`py-3.5 rounded-xl items-center`,
                              selectedSquad.length === 0 || loading ? { backgroundColor: '#334155' } : { backgroundColor: '#f87171' },
                              {shadowColor: '#f87171', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3}
                            ]}
                          >
                            <Text style={[tailwind` text-base font-semibold`, { color: selectedSquad.length === 0 ? '#64748b' : '#ffffff' }]}>
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
