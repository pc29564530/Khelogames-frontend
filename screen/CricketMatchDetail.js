import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Modal} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import CheckBox from '@react-native-community/checkbox';
import {useSelector, useDispatch } from 'react-redux';
import { formattedDate, formattedTime } from '../utils/FormattedDateTime';
import { convertToISOString } from '../utils/FormattedDateTime';
import { setCricketMatchToss } from '../redux/actions/actions';

const CricketMatchDetail = ({route}) => {
    const [isTossed, setIsTossed] = useState(false);
    const dispatch = useDispatch();
    const axiosInstance = useAxiosInterceptor();
    const [isTossedModalVisible, setIsTossedModalVisible] = useState(false);
    const [tossOption, setTossOption] = useState('');
    // const [tossData, setTossData] = useState({});
    const [teamID, setTeamId] = useState('');
    const match = route.params.match;
    const [matchFormat, setMatchFormat] = useState();
    const cricketToss = useSelector(state => state.cricketToss.cricketToss)
    const game = useSelector((state) => state.sportReducers.game);
    const currentDate = new Date();

    const addToss = async () => {
        try {
            const data = {
                match_id: match.id,
                toss_decision: tossOption,
                toss_win: teamID
            }
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`${BASE_URL}/${game.name}/addCricketToss`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });
            dispatch(setCricketMatchToss(response.data))
            setIsTossedModalVisible(false);
        } catch (err) {
            console.error("unable to add the toss: ", err);
        }
    }

    useEffect(() => {
        const fetchTossData = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getCricketToss/${match.public_id}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    }
                });
               
                if (response.data && response.data.tossWonTeam) {
                    setIsTossed(true);
                }
                dispatch(setCricketMatchToss(response.data))
            } catch (err) {
                console.error("Unable to get the toss data: ", err);
            }
        }
        fetchTossData();
    }, []);

    const handleModalVisible = () => {
        setIsTossedModalVisible(!isTossedModalVisible);
    }

    const handleTeam = (item) => {
        setTeamId(item);
    }

    const updateTossOption = (item) => {
        setTossOption(item);
    }
    
    return (
        <View style={tailwind`flex-1 p-4 bg-white`}>
            <View style={tailwind`mb-4`}>
                <Text style={tailwind`text-2xl font-bold text-gray-600`}>Update Match Details</Text>
                <Pressable onPress={handleModalVisible} style={tailwind`bg-white shadow-lg rounded-full p-3 mt-4`}>
                    <Text style={tailwind`text-gray text-center text-lg`}>Update Toss</Text>
                </Pressable>
            </View>
            <View style={tailwind`bg-white rounded-lg p-4 mb-4 shadow-lg`}>
                <Text style={tailwind`text-lg font-bold text-gray-600`}>Match Information</Text>
                <View style={tailwind`mt-2`}>
                    <Text style={tailwind`text-gray-700`}>Venue: </Text>
                </View>
                <View style={tailwind`flex-row`}>
                    <Text>Date: </Text>
                    <Text>{formattedDate(convertToISOString(match?.start_timestamp))}</Text>
                </View>
                <View style={tailwind`flex-row`}>
                    <Text>Time: </Text>
                    <Text>{formattedTime(convertToISOString(match?.start_timestamp))}</Text>
                </View>
                {isTossed &&  (
                    <View style={tailwind`mt-4`}>
                        <Text style={tailwind`text-gray-700`}>Toss Won By: {cricketToss?.tossWonTeam?.id === match?.awayTeam?.id ? match.awayTeam.name : match.homeTeam.name}</Text>
                        <Text style={tailwind`text-gray-700`}>Decision: {cricketToss?.tossDecision}</Text>
                    </View>
                )}
            </View>
            {isTossedModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isTossedModalVisible}
                    onRequestClose={() => setIsTossedModalVisible(false)}
                >
                    <Pressable onPress={() => setIsTossedModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-t-lg p-6`}>
                            <Text style={tailwind`text-xl font-bold text-gray-600 mb-4`}>Select Team for Toss</Text>
                            <View style={tailwind`flex-row justify-evenly mb-4`}>
                                <Pressable onPress={() => handleTeam(match.homeTeam.public_id)} style={[tailwind`p-4 rounded-md bg-white shadow-lg`, teamID === match.homeTeam.id && tailwind`bg-red-400`]}>
                                    <Text style={tailwind`text-lg text-center text-blue-900`}>{match.homeTeam.name}</Text>
                                </Pressable>
                                <Pressable onPress={() => handleTeam(match.awayTeam.public_id)} style={[tailwind`p-4 rounded-md bg-white shadow-lg`, teamID === match.awayTeam.id && tailwind`bg-red-400`]}>
                                    <Text style={tailwind`text-lg text-center text-blue-900`}>{match.awayTeam.name}</Text>
                                </Pressable>
                            </View>
                            <Text style={tailwind`text-lg font-bold text-gray-600 mb-2`}>Choose Decision</Text>
                            <View style={tailwind`flex-row items-center mb-2`}>
                                <CheckBox
                                    value={tossOption === 'Batting'}
                                    onValueChange={() => updateTossOption("Batting")}
                                />
                                <Text style={tailwind`ml-2 text-lg text-blue-900`}>Batting</Text>
                            </View>
                            <View style={tailwind`flex-row items-center mb-4`}>
                                <CheckBox
                                    value={tossOption === 'Bowling'}
                                    onValueChange={() => updateTossOption("Bowling")}
                                />
                                <Text style={tailwind`ml-2 text-lg text-blue-900`}>Bowling</Text>
                            </View>
                            <Pressable onPress={() => addToss()} style={tailwind`bg-white p-2 shadow-lg rounded-lg`}>
                                <Text style={tailwind`text-gray-600 text-center text-lg`}>Submit</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
}

export default CricketMatchDetail;
