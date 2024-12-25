import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import { View, Text, Pressable, Image, Modal, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import FootballMatchPageContent from '../navigation/FootballMatchPageContent';
import { formattedTime, formattedDate, convertToISOString } from '../utils/FormattedDateTime';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector, useDispatch } from 'react-redux';
import { getMatch } from '../redux/actions/actions';
const filePath = require('../assets/status_code.json');
import Animated, { Extrapolation, interpolate, interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

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

    const {height:sHeight, width: sWidth} = Dimensions.get('screen')

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


    const handleSearch = (text) => setSearchQuery(text);

    const filteredStatusCodes = filePath["status_codes"].filter((item) => 
        item.type.includes(searchQuery) || item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const scrollY = useSharedValue(0);

    const handleScroll = useAnimatedScrollHandler((e) => {
        scrollY.value = e.contentOffset.y;
    })

    const bgColor = 'white'
      const bgColor2 = tailwind.color('bg-red-400')
      const offsetValue = 100;
      const headerInitialHeight = 100;
      const headerNextHeight = 60;
      const animatedHeader = useAnimatedStyle(() => {
        const height = interpolate(
          scrollY.value,
          [0, offsetValue],
          [headerInitialHeight, headerNextHeight],
          Extrapolation.CLAMP,
        )
    
        const backgroundColor = interpolateColor(
          scrollY.value,
          [0, offsetValue],
          [bgColor, bgColor2]
        )
        return {
          backgroundColor, height
        }
      })

      const animatedMatchDetails = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, 100, offsetValue],
            [1, 1, 1],
            Extrapolation.CLAMP,
          )
        const xValue = 0;
        const translateX = interpolate(
            scrollY.value,
            [0, offsetValue],
            [0, -xValue],
            Extrapolation.CLAMP,
        )
          const translateY = interpolate(
            scrollY.value,
            [0, offsetValue],
            [0, -90],
            Extrapolation.CLAMP,
          )
          const scale = interpolate(
            scrollY.value,
            [0, offsetValue],
            [1, 0.7],
            Extrapolation.CLAMP,
          )
          return { opacity, transform: [{ translateX }, { translateY }, {scale}] }
      })

      const animatedStatus = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, 100, offsetValue],
            [1,0,0],
            Extrapolation.CLAMP,
        )
        const translateY = 0

          const scale = interpolate(
            scrollY.value,
            [0, offsetValue],
            [1, 0.6],
            Extrapolation.CLAMP,
          )
        return {opacity, transform:[{translateY}, {scale}]}
      })

    return (
        <View style={tailwind`flex-1 bg-white`}>
            <Animated.View style={[tailwind`safe-center top-0 right-0 left-0 bg-white`, animatedHeader]}>
                <View style={tailwind`flex-row justify-between fixed p-2 pt-4`}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <AntDesign name="arrowleft" size={26} color="black" />
                    </Pressable>
                    <Pressable style={tailwind``} onPress={toggleMenu}>
                        <MaterialIcon name="more-vert" size={24} color="black" />
                    </Pressable>
                </View>
                <Animated.View style={[tailwind`items-center`, animatedStatus]}>
                    <Text style={tailwind`text-black text-xl font-semibold`}>{match.status.charAt(0).toUpperCase()+match.status.slice(1)}</Text>
                </Animated.View>
                <Animated.View style={[tailwind`items-center flex-row justify-evenly px-2 py-2`, animatedMatchDetails]}>
                    <View style={tailwind`items-center`}>
                        {match.homeTeam.media_url?(
                            <Image/>
                        ):(
                            <View style={tailwind`rounded-full h-12 w-12 bg-yellow-400 items-center justify-center`}>
                                <Text style={tailwind`text-black text-md`}>{match.homeTeam.name.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                        <View>
                            <Text  style={tailwind`text-black`}>{match.homeTeam.name}</Text>
                        </View>
                    </View>
                    <View style={tailwind`flex-row gap-2 justify-center items-center`}>
                        <Text style={tailwind`text-black text-lg`}>{match.homeScore.homeScore.score}</Text>
                        <Text style={tailwind`text-black text-lg`}>-</Text>
                        <Text style={tailwind`text-black text-lg`}>{match.awayScore.awayScore.score}</Text>
                    </View>
                    <View style={tailwind`items-center`}>
                        {match.awayTeam?.media_url ? (
                            <Image/>
                        ):(
                            <View style={tailwind`rounded-full h-12 w-12 bg-yellow-400 items-center justify-center`}>
                                <Text style={tailwind`text-black text-md`}>{match.awayTeam.name.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                        <View>
                            <Text  style={tailwind`text-black`}>{match.awayTeam.name}</Text>
                        </View>
                    </View>
                </Animated.View>
            </Animated.View>
            <Animated.ScrollView
                contentContainerStyle={{ paddingBottom: headerNextHeight, paddingTop: headerInitialHeight, minHeight: sHeight}}
                onScroll={handleScroll}
                scrollEnabled={true}
                
            >
                <FootballMatchPageContent matchData={match} />
            </Animated.ScrollView>
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
        </View>
    );
};

export default FootballMatchPage;