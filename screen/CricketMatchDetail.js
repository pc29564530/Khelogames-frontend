import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Modal, Dimensions} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import axiosInstance from './axios_config';
import CheckBox from '@react-native-community/checkbox';
import {useSelector, useDispatch } from 'react-redux';
import { formattedDate, formattedTime } from '../utils/FormattedDateTime';
import { convertToISOString } from '../utils/FormattedDateTime';
import { setCricketMatchToss } from '../redux/actions/actions';
import validateCricketTossForm from '../utils/validation/cricketTossValidation';
import Animated, {useSharedValue, useAnimatedStyle, Extrapolation, interpolate, useAnimatedScrollHandler} from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CricketMatchDetail = ({match, parentScrollY, headerHeight, collapsedHeader}) => {
    const [isTossed, setIsTossed] = useState(false);
    const dispatch = useDispatch();

    const [isTossedModalVisible, setIsTossedModalVisible] = useState(false);
    const [tossOption, setTossOption] = useState('');
    const [teamID, setTeamId] = useState('');
    const [matchFormat, setMatchFormat] = useState();
    const [error, setError] = useState({
        global: null,
        fields: {},
    });
    const [loading, setLoading] = useState(false);
    const cricketToss = useSelector(state => state.cricketToss.cricketToss)
    const game = useSelector((state) => state.sportReducers.game);
    const currentDate = new Date();
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



    const addToss = async () => {
        try {
            setLoading(true);
            const formData = {
                match_public_id: match.public_id,
                toss_decision: tossOption,
                toss_win: teamID,
            }
            const validation = validateCricketTossForm(formData);
            if(!validation.isValid) {
                setError({
                    global: null,
                    fields: validation.errors,
                });
                console.error("Unable to create toss: ", err);
                return
            }
            const data = {
                match_public_id: match.public_id,
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
            const backendErrors = err.response.data.error.fields;
            setError({
                global: "Unable to create cricket toss",
                fields: backendErrors,
            });
            console.error("unable to add the toss: ", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchTossData = async () => {
            try {
                setLoading(true);
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
                const backendError = err?.response?.data?.error?.fields;
                setError({
                    global: "Unable to get toss details",
                    fields: backendError,
                });
                console.error("Unable to get the toss data: ", err);
            } finally {
                setLoading(false);
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
        <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
            <Animated.ScrollView
               onScroll={handlerScroll}
               scrollEventThrottle={16}
               showsVerticalScrollIndicator={false}
               contentContainerStyle={{
                   paddingTop: 20,
                   paddingBottom: 100,
                   paddingHorizontal: 16,
                   minHeight: sHeight + 100
               }}
            >
                {/* Header + Update Toss Button */}
                <View style={tailwind`mb-4`}>
                    <Text style={[tailwind`text-2xl font-bold`, { color: '#f1f5f9' }]}>Match Details</Text>
                    <Pressable
                        onPress={handleModalVisible}
                        style={[
                            tailwind`rounded-xl p-4 mt-4 flex-row items-center justify-center`,
                            { backgroundColor: '#f87171' }
                        ]}
                    >
                        <MaterialIcons name="swap-horiz" size={20} color="#fff" />
                        <Text style={[tailwind`text-center text-base font-semibold ml-2`, { color: '#fff' }]}>Update Toss</Text>
                    </Pressable>
                </View>

                {/* Error Banner */}
                {error?.global && (
                    <View style={[tailwind`rounded-xl p-3 mb-4 flex-row items-center`, { backgroundColor: '#f8717115', borderWidth: 1, borderColor: '#f8717130' }]}>
                        <MaterialIcons name="error-outline" size={18} color="#f87171" />
                        <Text style={[tailwind`text-sm ml-2 flex-1`, { color: '#fca5a5' }]}>{error.global}</Text>
                    </View>
                )}

                {/* Match Information Card */}
                <View style={[tailwind`rounded-2xl p-5 mb-4`, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }]}>
                    <Text style={[tailwind`text-lg font-bold mb-3`, { color: '#f1f5f9' }]}>Match Information</Text>

                    <View style={[tailwind`py-3`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
                        <Text style={[tailwind`text-xs font-medium mb-1`, { color: '#64748b' }]}>Venue</Text>
                        <Text style={[tailwind`text-sm`, { color: '#cbd5e1' }]}>-</Text>
                    </View>

                    <View style={[tailwind`py-3`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
                        <Text style={[tailwind`text-xs font-medium mb-1`, { color: '#64748b' }]}>Date</Text>
                        <Text style={[tailwind`text-sm`, { color: '#cbd5e1' }]}>
                            {match?.start_timestamp ? formattedDate(convertToISOString(match?.start_timestamp)) : '-'}
                        </Text>
                    </View>

                    <View style={[tailwind`py-3`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
                        <Text style={[tailwind`text-xs font-medium mb-1`, { color: '#64748b' }]}>Time</Text>
                        <Text style={[tailwind`text-sm`, { color: '#cbd5e1' }]}>
                            {match?.start_timestamp ? formattedTime(convertToISOString(match?.start_timestamp)) : '-'}
                        </Text>
                    </View>

                    {isTossed && (
                        <View style={tailwind`pt-3`}>
                            <Text style={[tailwind`text-xs font-medium mb-2`, { color: '#64748b' }]}>Toss Result</Text>
                            <View style={[tailwind`rounded-xl p-3 flex-row items-center`, { backgroundColor: '#0f172a' }]}>
                                <View style={[tailwind`w-8 h-8 rounded-full items-center justify-center mr-3`, { backgroundColor: '#f8717120' }]}>
                                    <MaterialIcons name="swap-horiz" size={18} color="#f87171" />
                                </View>
                                <View style={tailwind`flex-1`}>
                                    <Text style={[tailwind`text-sm font-semibold`, { color: '#f1f5f9' }]}>
                                        {cricketToss?.tossWonTeam?.id === match?.awayTeam?.id ? match.awayTeam.name : match.homeTeam.name}
                                    </Text>
                                    <Text style={[tailwind`text-xs mt-0.5`, { color: '#64748b' }]}>
                                        Chose to {cricketToss?.tossDecision}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </Animated.ScrollView>

            {/* Toss Modal */}
            {isTossedModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isTossedModalVisible}
                    onRequestClose={() => setIsTossedModalVisible(false)}
                >
                    <View style={tailwind`flex-1 justify-end bg-black/50`}>
                        <Pressable
                            style={tailwind`flex-1`}
                            onPress={() => setIsTossedModalVisible(false)}
                        />
                        <View style={[tailwind`rounded-t-3xl p-6`, { backgroundColor: '#1e293b' }]}>
                            {/* Drag handle */}
                            <View style={[tailwind`w-10 h-1 rounded-full self-center mb-5`, { backgroundColor: '#475569' }]} />

                            {/* Select Team */}
                            <Text style={[tailwind`text-lg font-bold mb-4`, { color: '#f1f5f9' }]}>Who Won the Toss?</Text>

                            {error?.fields?.toss_win && (
                                <Text style={[tailwind`text-xs mb-2`, { color: '#fca5a5' }]}>*{error.fields.toss_win}</Text>
                            )}

                            <View style={tailwind`flex-row justify-between mb-5 gap-3`}>
                                <Pressable
                                    onPress={() => handleTeam(match.homeTeam.public_id)}
                                    style={[
                                        tailwind`flex-1 p-4 rounded-xl items-center`,
                                        {
                                            backgroundColor: teamID === match.homeTeam.public_id ? '#f87171' : '#0f172a',
                                            borderWidth: 1,
                                            borderColor: teamID === match.homeTeam.public_id ? '#f87171' : '#334155',
                                        }
                                    ]}
                                >
                                    <Text style={[
                                        tailwind`text-base text-center font-semibold`,
                                        { color: teamID === match.homeTeam.public_id ? '#fff' : '#f1f5f9' }
                                    ]}>
                                        {match.homeTeam.name}
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => handleTeam(match.awayTeam.public_id)}
                                    style={[
                                        tailwind`flex-1 p-4 rounded-xl items-center`,
                                        {
                                            backgroundColor: teamID === match.awayTeam.public_id ? '#f87171' : '#0f172a',
                                            borderWidth: 1,
                                            borderColor: teamID === match.awayTeam.public_id ? '#f87171' : '#334155',
                                        }
                                    ]}
                                >
                                    <Text style={[
                                        tailwind`text-base text-center font-semibold`,
                                        { color: teamID === match.awayTeam.public_id ? '#fff' : '#f1f5f9' }
                                    ]}>
                                        {match.awayTeam.name}
                                    </Text>
                                </Pressable>
                            </View>

                            {/* Choose Decision */}
                            <Text style={[tailwind`text-lg font-bold mb-3`, { color: '#f1f5f9' }]}>Choose Decision</Text>

                            {error?.fields?.toss_decision && (
                                <Text style={[tailwind`text-xs mb-2`, { color: '#fca5a5' }]}>*{error.fields.toss_decision}</Text>
                            )}

                            <View style={tailwind`flex-row mb-5 gap-3`}>
                                <Pressable
                                    onPress={() => updateTossOption("Batting")}
                                    style={[
                                        tailwind`flex-1 p-4 rounded-xl flex-row items-center justify-center`,
                                        {
                                            backgroundColor: tossOption === 'Batting' ? '#f87171' : '#0f172a',
                                            borderWidth: 1,
                                            borderColor: tossOption === 'Batting' ? '#f87171' : '#334155',
                                        }
                                    ]}
                                >
                                    <MaterialIcons name="sports-cricket" size={18} color={tossOption === 'Batting' ? '#fff' : '#94a3b8'} />
                                    <Text style={[
                                        tailwind`text-base font-semibold ml-2`,
                                        { color: tossOption === 'Batting' ? '#fff' : '#f1f5f9' }
                                    ]}>
                                        Batting
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => updateTossOption("Bowling")}
                                    style={[
                                        tailwind`flex-1 p-4 rounded-xl flex-row items-center justify-center`,
                                        {
                                            backgroundColor: tossOption === 'Bowling' ? '#f87171' : '#0f172a',
                                            borderWidth: 1,
                                            borderColor: tossOption === 'Bowling' ? '#f87171' : '#334155',
                                        }
                                    ]}
                                >
                                    <MaterialIcons name="sports" size={18} color={tossOption === 'Bowling' ? '#fff' : '#94a3b8'} />
                                    <Text style={[
                                        tailwind`text-base font-semibold ml-2`,
                                        { color: tossOption === 'Bowling' ? '#fff' : '#f1f5f9' }
                                    ]}>
                                        Bowling
                                    </Text>
                                </Pressable>
                            </View>

                            {/* Submit Button */}
                            <Pressable
                                onPress={() => addToss()}
                                disabled={!teamID || !tossOption}
                                style={[
                                    tailwind`p-4 rounded-xl items-center`,
                                    { backgroundColor: teamID && tossOption ? '#f87171' : '#334155' }
                                ]}
                            >
                                <Text style={[
                                    tailwind`text-base font-semibold`,
                                    { color: teamID && tossOption ? '#fff' : '#475569' }
                                ]}>
                                    {loading ? 'Submitting...' : 'Submit Toss'}
                                </Text>
                            </Pressable>

                            {/* Cancel */}
                            <Pressable
                                onPress={() => setIsTossedModalVisible(false)}
                                style={tailwind`p-3 mt-2 items-center`}
                            >
                                <Text style={[tailwind`font-medium`, { color: '#94a3b8' }]}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

export default CricketMatchDetail;