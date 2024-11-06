import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import { View, Text, Pressable, Image, Modal, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import FootballMatchPageContent from '../navigation/FootballMatchPageContent';
import { formattedTime, formattedDate, convertToISOString } from '../utils/FormattedDateTime';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { getMatch } from '../redux/actions/actions';
const filePath = require('../assets/status_code.json');

const FootballMatchPage = ({ route }) => {
    const dispatch = useDispatch();
    const matchID = route.params.matchID;
    const match = useSelector((state) => state.matches.match);
    const navigation = useNavigation();
    const [menuVisible, setMenuVisible] = useState(false);
    const [statusVisible, setStatusVisible] = useState(false);
    const axiosInstance = useAxiosInterceptor();
    const [statusCode, setStatusCode] = useState();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const game = useSelector((state) => state.sportReducers.game);

    const handleUpdateResult = async (itm) => {
        setStatusVisible(false);
        setMenuVisible(false);
        setLoading(true);
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const data = { id: matchID, status_code: itm };
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

    useEffect(() => {
        navigation.setOptions({
            headerTitle: '',
            headerRight: () => (
                <View style={tailwind`flex-row items-center`}>
                    <Pressable style={tailwind`mr-2`} onPress={toggleMenu}>
                        <MaterialIcon name="more-vert" size={24} color="black" />
                    </Pressable>
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
            ),
        });
    }, [menuVisible, navigation]);

    const handleSearch = (text) => setSearchQuery(text);

    const filteredStatusCodes = filePath["status_codes"].filter((item) => 
        item.type.includes(searchQuery) || item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={tailwind`flex-1`}>
            <View style={tailwind`p-4 bg-black items-center `}>
                <Text style={tailwind`text-white text-xl font-semibold`}>{match.status.toUpperCase()}</Text>
            </View>
            <View style={tailwind`h-45 bg-black flex-row items-center justify-center gap-2 p-2`}>
                <View style={tailwind`flex-row gap-2 justify-between`}>
                    <Text style={tailwind`text-white text-3xl font-bold`}>{match.homeTeam.name}</Text>
                    {(match.status !== "not_started") && (
                        <View style={tailwind` gap-2 items-center`}>
                            <Text style={tailwind`text-white text-3xl font-medium`}>{match?.homeScore.homeScore.score}</Text>
                            {/* {match.status === "finished" && match.result === match.homeTeam.id && (
                                <Text style={tailwind`text-white text-lg`}>won</Text>
                            )} */}
                        </View>
                    )}
                </View>
                <View style={tailwind`h-1 w-5 border-t-2 border-white px-2 py-0.5`} />
                <View style={tailwind`flex-row justify-between gap-2`}>
                    {(match.status !== "not_started") && (
                        <View style={tailwind`flex-row gap-2 items-center`}>
                            <Text style={tailwind`text-white text-3xl font-medium`}>{match?.awayScore.awayScore.score}</Text>
                            {/* {match.status === "finished" && match.result === match.awayTeam.id && (
                                <Text style={tailwind`text-white text-lg`}>won</Text>
                            )} */}
                        </View>
                    )}
                    <Text style={tailwind`text-white text-3xl font-bold`}>{match.awayTeam.name}</Text>
                </View>
                <View>
                    {match.status === "not_started" && (
                        <View>
                            <Text style={tailwind`text-white`}>{formattedDate(convertToISOString(match.startTimeStamp))}</Text>
                            <Text style={tailwind`text-white`}>{formattedTime(convertToISOString(match.startTimeStamp))}</Text>
                        </View>
                    )}
                </View>
            </View>
            {loading && (
                <View style={tailwind`absolute inset-0 flex justify-center items-center bg-black bg-opacity-50`}>
                    <ActivityIndicator size="large" color="#FFF" />
                </View>
            )}
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
                                    <Text style={tailwind`text-lg text-gray-800`}>{item.description}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Modal>
            )}
            <FootballMatchPageContent matchData={match} />
        </View>
    );
};

export default FootballMatchPage;