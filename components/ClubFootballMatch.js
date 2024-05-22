import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useContext, useEffect, useState} from 'react';
import { View, Text, Pressable, Image, Modal} from 'react-native';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import { useNavigation } from '@react-navigation/native';
import FixturePage from '../screen/FixturePage';
import AntDesign from 'react-native-vector-icons/AntDesign'
import axios from 'axios';
import {formattedDate, formattedTime} from '../utils/FormattedDateTime'
import { ScrollView } from 'react-native-gesture-handler';
import { determineMatchStatus } from '../utils/MatchStatus';
import { GlobalContext } from '../context/GlobalContext';

const ClubFootballMatch = ({clubData}) => {
    const [match, setMatch] = useState([]);
    const [isDropDownVisible, setIsDropDownVisible] = useState(false);
    const [tournamentName, setTournamentName] = useState();
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();
    const {sport, setSport} = useContext(GlobalContext);

    useEffect(() => {
        fetchTournamentMatch();
    }, []);

    const fetchTournamentMatch = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/${sport}/getMatchByClubName` ,{
                params: {
                    id: clubData.id.toString()
                },
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if(!response.data || response.data === null ){
                setMatch([]);
            } else {
                const item = response.data;
                const matchData = item.map( async (itm, index) => {
                    try {
                        const responseScore1 = await axiosInstance.get(`${BASE_URL}/${sport}/getFootballMatchScore`, {
                            params:{
                                match_id: itm.match_id,
                                team_id: itm.team1_id
                            },
                            headers: {
                                'Authorization': `Bearer ${authToken}`,
                                'Content-Type': 'application/json',
                            }
                        });

                        const responseScore2 = await axiosInstance.get(`${BASE_URL}/${sport}/getFootballMatchScore`, {
                            params:{
                                match_id: itm.match_id,
                                team_id: itm.team2_id
                            },
                            headers: {
                                'Authorization': `Bearer ${authToken}`,
                                'Content-Type': 'application/json',
                            }
                        });

                        if(responseScore1.data === null && responseScore2.data === null) {
                            return {...itm, responseScore1: [], responseScore2: []}
                        } else {
                            return {...itm, responseScore1: responseScore1.data, responseScore2: responseScore2.data}
                        }
                        
                    } catch (err) {
                        console.error("unable to get the score using tournament match", err)
                    }
                })

                const matchDataWithScore = await Promise.all(matchData);

                setMatch(matchDataWithScore)
                const tournamentIDSet = new Set();
                const tournamentData = [];
                item.forEach((itm) => {
                    if(!tournamentIDSet.has(itm.tournament_id)){
                        tournamentIDSet.add(itm.tournament_id)
                        tournamentData.push({
                            ...itm,
                            tournament_id: itm.tournament_id,
                            tournament_name: itm.tournament_name
                        })
                    }
                });

                setTournamentName(tournamentData);
             }
        } catch (err) {
            console.log("unable to get the tournament match ", err);
        }
    }
    const handleFixtureStatus = async (item) => {
        navigation.navigate("CricketMatchPage", {item:item})
    }

    const handleDropDown = () => {
        setIsDropDownVisible(true);
    }

    const handleTournamentNavigate = async (tournamentItem) => {
        try {
            const authToken = await AsyncStorage.getItem('AcessToken');
            const response = await axiosInstance.get(`${BASE_URL}/${sport}/getTournaments`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                  },
            });
            const items = response.data;
            if (items && items !== null) {
                const dataWithDisplayText = items.map((it, index) => {
                    let displayText = '';
                    const usernameInitial = it.tournament_name ? it.tournament_name.charAt(0) : '';
                    displayText = usernameInitial.toUpperCase();
                    return {...it, displayText: displayText}
                });
                const tournamentWithDisplayText = await Promise.all(dataWithDisplayText)
                tournamentWithDisplayText.map((itm) => {
                    if(itm.tournament_id === tournamentItem.tournament_id ){
                        navigation.navigate("TournamentPage", {item:itm})
                    }   
                });
            }
        } catch (err) {
            console.error("unable to navigate to tournament name: ", err);
        }
    }

    return (
        <ScrollView style={tailwind`mt-4`}>
            <Pressable style={tailwind`border rounded-lg flex-row items-center justify-center inline inline-block w-35 gap-2`} onPress={() => handleDropDown()}>
                <Text style={tailwind`text-lg text-black p-2`}>Tournament</Text>
                <AntDesign name="down"  size={10} color="black" />
            </Pressable>
            <ScrollView>
                {match.length>0 && match.map((item, index) => (
                    <Pressable key={index} style={tailwind`mb-4 p-1 bg-white rounded-lg shadow-md`} onPress={() => handleFixtureStatus(item)} >
                        <View style={tailwind`items-start justify-center ml-2`}>
                            <Text style={tailwind``}>{item.tournament_name}</Text>
                        </View>
                        <View style={tailwind`flex-row items-center`}>
                            <View style={tailwind` justify-between mb-2 gap-1 p-2 mt-1`}>
                                <View style={tailwind`items-center flex-row`}>
                                    <Image source={{ uri: item.team1_avatar_url }} style={tailwind`w-6 h-6 bg-violet-200 rounded-full `} />
                                    <Text style={tailwind`ml-2 text-md font-semibold text-gray-800`}>{item.team1_name}</Text>
                                </View>
                                <View style={tailwind` items-center flex-row`}>
                                    <Image source={{ uri: item.team2_avatar_url }} style={tailwind`w-6 h-6 bg-violet-200 rounded-full`} />
                                    <Text style={tailwind`ml-2 text-md font-semibold text-gray-800`}>{item.team2_name}</Text>
                                </View>
                            </View>
                            <View style={tailwind`bg-gray-400 w-0.2 mx-4 h-10`}></View>
                            <View style={tailwind` justify-between`}>
                            {(determineMatchStatus(item)==="Live" || determineMatchStatus(item) === "End")  &&  (
                                <>
                                    <Text style={tailwind`text-black`}>{!item.responseScore1.goal_for?(0):item.responseScore1.goal_for }</Text>
                                    <Text style={tailwind`text-black`}>{!item.responseScore2.goal_for?(0):item.responseScore2.goal_for}</Text>
                                </>
                            )}
                            {determineMatchStatus(item)==="Not Started" && (
                                <>
                                    <Text style={tailwind`text-black`}>{formattedDate(item.date_on)}</Text>
                                    <Text style={tailwind`text-black`}>{formattedTime(item.start_time)}</Text>
                                </>
                            )}
                            </View>
                        </View>
                </Pressable>
                ))}
            </ScrollView>
                {isDropDownVisible && (
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isDropDownVisible}
                        onRequestClose = {() => setIsDropDownVisible(!isDropDownVisible)}
                    >
                        <View style={tailwind`flex-1 justify-end bg-gray-900 bg-opacity-50 w-full`}>
                            <View style={tailwind`bg-white rounded-md p-4`}>
                                {tournamentName && tournamentName?.map((item, index) => (
                                    <Pressable
                                        key={index}
                                        style={tailwind`bg-white p-2`}
                                        onPress={() => {handleTournamentNavigate(item)}}
                                    >
                                        <Text>{item.tournament_name}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </Modal>
                )}
        </ScrollView>
    );
}

export default ClubFootballMatch;