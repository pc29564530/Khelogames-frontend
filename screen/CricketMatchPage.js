import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState} from 'react';
import { View, Text, Pressable, Image, Modal, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector, useDispatch } from 'react-redux';
import { getMatch } from '../redux/actions/actions';
const filePath = require('../assets/status_code.json');
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import CricketMatchPageContent from '../navigation/CricketMatchPageContent';

const CricketMatchPage = ({ route }) => {
    const dispatch = useDispatch();
    const match = route.params.item;                                                                         
    //const match = useSelector((state) => state.matches.match);
    const navigation = useNavigation();
    const [menuVisible, setMenuVisible] = useState(false);
    const [statusVisible, setStatusVisible] = useState(false);
    const axiosInstance = useAxiosInterceptor();
    const [statusCode, setStatusCode] = useState();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const game = useSelector((state) => state.sportReducers.game);

    const {height:sHeight, width: sWidth} = Dimensions.get('screen')
    const handleUpdateResult = async (itm) => {
        setStatusVisible(false);
        setMenuVisible(false);
        setLoading(true);
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const data = { id: match.matchId, status_code: itm };
            const response = await axiosInstance.put(`${BASE_URL}/${game.name}/updateMatchStatus`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            dispatch(getMatch(response.data || []));
        } catch (err) {
            console.error("Unable to update the match: ", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleMenu = () => setMenuVisible(!menuVisible);


    const handleSearch = (text) => setSearchQuery(text);

    const filteredStatusCodes = filePath["status_codes"].filter((item) => 
        item.type.includes(searchQuery) || item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={tailwind`flex-1 bg-white`}>
            <View style={[tailwind`safe-center top-0 right-0 left-0 bg-red-400`]}>
                <View style={tailwind`flex-row justify-between fixed p-2 pt-4`}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <AntDesign name="arrowleft" size={26} color="white" />
                    </Pressable>
                    <Pressable style={tailwind``} onPress={toggleMenu}>
                        <MaterialIcon name="more-vert" size={24} color="white" />
                    </Pressable>
                </View>
                <View style={[tailwind`items-center -top-4`]}>
                    <Text style={tailwind`text-white text-xl font-semibold`}>{match.status?.charAt(0)?.toUpperCase()+match?.status?.slice(1)}</Text>
                </View>
                <View style={[tailwind`items-center flex-row justify-evenly px-2 py-2  bg-red-400 -top-4`]}>
                    <View style={tailwind`items-center`}>
                        {match?.homeTeam?.media_url?(
                            <Image/>
                        ):(
                            <View style={tailwind`rounded-full h-12 w-12 bg-yellow-400 items-center justify-center`}>
                                <Text style={tailwind`text-white text-md`}>{match?.homeTeam?.name?.charAt(0)?.toUpperCase()}</Text>
                            </View>
                        )}
                        <View>
                            <Text  style={tailwind`text-white`}>{match.homeTeam?.name}</Text>
                        </View>
                    </View>
                    <View style={tailwind`flex-row gap-2 justify-evenly items-center`}>
                        <View style={tailwind``}>
                            {match.status !== "not_started" && match?.homeScore ? (
                                <> 
                                    <Text style={tailwind`ml-2 text-lg text-white`}>
                                        {match?.homeScore?.score}/{match?.homeScore?.wickets}
                                    </Text>
                                    <Text style={tailwind`ml-2 text-lg text-white`}>({match?.homeScore?.overs})</Text>
                                </>
                            ):(<Text style={tailwind`text-lg text-white`}>-</Text>)}
                            
                        </View>
                        <View style={tailwind`h-10 w-0.4 bg-white`} />
                        <View style={tailwind``}>
                            {match.status !== "not_started" && match?.awayScore ? (
                                <>
                                    <Text style={tailwind`ml-2 text-lg text-white`}>
                                        {match?.awayScore?.score}/{match?.awayScore?.wickets}
                                    </Text>
                                    <Text style={tailwind`ml-2 text-lg text-white`}>({match?.awayScore?.overs})</Text>
                                </>
                            ):(
                                <Text style={tailwind`text-lg text-white`}>-</Text> 
                            )}
                        </View>
                    </View>
                    <View style={tailwind`items-center`}>
                        { match.awayTeam?.media_url ? (
                            <Image/>
                        ):(
                            <View style={tailwind`rounded-full h-12 w-12 bg-yellow-400 items-center justify-center`}>
                                <Text style={tailwind`text-white text-md`}>{match?.awayTeam?.name?.charAt(0)?.toUpperCase()}</Text>
                            </View>
                        )}
                        <View>
                            <Text  style={tailwind`text-white`}>{match?.awayTeam?.name}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View
                style={tailwind`flex-1`}   
            >
                <CricketMatchPageContent matchData={match} />
            </View>
            {statusVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={statusVisible}
                    onRequestClose={() => setStatusVisible(false)}
                >
                    <Pressable onPress={() => setStatusVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <ScrollView style={tailwind`bg-white rounded-lg p-6 shadow-lg`}>
                            <TextInput
                                style={tailwind`bg-gray-100 p-3 mb-4 rounded-md text-black`}
                                placeholder="Search status..."
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                            {filteredStatusCodes.map((item, index) => (
                                <Pressable key={index} onPress={() => { setStatusCode(item.type); handleUpdateResult(item.type); }} style={tailwind`p-4 border-b border-gray-200 flex-row items-center gap-3`}>
                                    <Text style={tailwind`text-lg text-black`}>{index + 1}.</Text>
                                    <Text style={tailwind`text-lg text-gray-800`}>{item?.description}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Modal>
            )}
            {menuVisible && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={menuVisible}
                    onRequestClose={toggleMenu}
                >
                    <TouchableOpacity onPress={toggleMenu} style={tailwind`flex-1`}>
                        <View style={tailwind`flex-row justify-end`}>
                            <View style={tailwind`mt-12 mr-4 bg-white rounded-lg shadow-lg p-4 w-40 gap-4`}>
                                <TouchableOpacity onPress={() => setStatusVisible(true)}>
                                    <Text style={tailwind`text-xl`}>Edit Match</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {}}>
                                    <Text style={tailwind`text-xl`}>Delete Match</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {}}>
                                    <Text style={tailwind`text-xl`}>Share</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}
        </View>
    );
};

export default CricketMatchPage;