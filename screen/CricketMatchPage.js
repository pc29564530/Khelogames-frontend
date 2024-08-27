import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {View, Text, Pressable, Modal, ScrollView} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import TopTabCricketMatchPage from '../navigation/TopTabCricketMatchPage';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
const filePath = require('../assets/status_code.json');


const CricketMatchPage = ({route}) => {
    const [isUpdateStatusModalVisible, setIsUpdateStatusModalVisible] = useState(false);
    const [statusCode, setStatusCode] = useState('');
    const [status, setStatus] = useState([]);
    const {item, sports} = route.params;
    const matchData = item;
    const axiosInstance = useAxiosInterceptor();
    const navigation= useNavigation();

    useEffect(() => {
        const readJSONFile = async () => {
            try {
                setStatus(filePath['status_codes']);
            } catch (error) {
                console.error('Error reading or parsing json file:', error);
            }
        };

        readJSONFile();
    }, []);

    const handleAddPlayerBattingOrBowlingStats = () => {
        navigation.navigate("AddCricketMatchPlayer", {homeTeamID:matchData.home_team_id, team2ID: matchData.team2_id, team1Name: matchData.team1_name, team2Name: matchData.team2_name, tournamentID: matchData.tournament_id, matchID: matchData.match_id});
    }

    const handleEditScore = () => {
        navigation.navigate("EditMatchScore", {team1ID:matchData.team1_id, team2ID: matchData.team2_id, team1Name: matchData.team1_name, team2Name: matchData.team2_name, tournamentID: matchData.tournament_id, matchID: matchData.match_id });
    }

    const handleUpdateStatus = async (item) => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken')
            const data = {
                id: matchData.match_id,
                status_code: item
            }
            const response = await axiosInstance.put(`${BASE_URL}/${sports}/updateMatchStatus`, data,{
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            })
            setIsUpdateStatusModalVisible(false);
        } catch (err) {
            console.log("unable to update the status of the match: ",err)
        }
    }

    navigation.setOptions({
        headerTitle:"",
        headerLeft:()=>(
            <Pressable onPress={()=>navigation.goBack()}>
                <AntDesign name="arrowleft" size={24} color="black" style={tailwind`ml-4`} />
            </Pressable>
        ),
        headerRight: () => (
            <View style={tailwind`flex-row`}>
               <Pressable style={tailwind`relative p-2 bg-white items-center justify-center rounded-lg shadow-lg mr-4`} onPress={() => setIsUpdateStatusModalVisible(true)}>
                        <MaterialIcons name="edit" size={24} color="black"/>
                </Pressable>
            </View>
        )
    })
    return (
        <View style={tailwind`flex-1 mt-4`}>
            <View style={tailwind` h-45 bg-black flex-row items-center justify-center gap-20`}>
                <View>
                    <Text style={tailwind`text-white text-2xl`}>{matchData.homeTeam.name}</Text>
                    {matchData.homeScore !== null && (
                        <>
                            <View style={tailwind`flex-row`}>
                                <Text style={tailwind`text-white text-2xl`}>{matchData?.homeScore?.score}</Text>
                                <Text style={tailwind`text-white text-2xl`}>-</Text>
                                <Text style={tailwind`text-white text-2xl`}>{matchData?.homeScore?.wickets}</Text>
                            </View>
                            <View style={tailwind`flex-row`}>
                                <Text style={tailwind`text-white text-2xl`}>(</Text>
                                <Text style={tailwind`text-white text-2xl`}>{matchData?.homeScore?.overs}</Text>
                                <Text style={tailwind`text-white text-2xl`}>)</Text>
                            </View>
                        </>
                    )}
                </View>
                <View style={tailwind`border-l-2 border-white h-20`} />
                <View>
                <Text style={tailwind`text-white text-2xl`}>{matchData.awayTeam.name}</Text>
                {matchData.awayScore !== null && (
                    <>
                        <View style={tailwind`flex-row`}>
                            <Text style={tailwind`text-white text-2xl`}>{matchData?.awayScore?.score}</Text>
                            <Text style={tailwind`text-white text-2xl`}>-</Text>
                            <Text style={tailwind`text-white text-2xl`}>{matchData?.awayScore?.wickets}</Text>
                        </View>
                        <View style={tailwind`flex-row`}>
                            <Text style={tailwind`text-white text-2xl`}>(</Text>
                            <Text style={tailwind`text-white text-2xl`}>{matchData?.awayScore?.overs}</Text>
                            <Text style={tailwind`text-white text-2xl`}>)</Text>
                        </View>
                    </>
                )}
                </View>
            </View>
            <TopTabCricketMatchPage matchData={matchData} matchID={matchData.matchId} homeTeamID={matchData.homeTeam.id} awayTeamID={matchData.awayTeam.id}/>
            {isUpdateStatusModalVisible && (
                <Modal 
                    transparent={true}
                    animationType='slide'
                    visible={isUpdateStatusModalVisible}
                    
                    onRequestClose={() => setIsUpdateStatusModalVisible(false)}
                >
                    <Pressable onPress={() => setIsUpdateStatusModalVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <ScrollView style={tailwind`bg-white rounded-md p-4 h-2/4`}>
                            {status?.map((item, index) => (
                                <Pressable key={index} onPress={() => {handleUpdateStatus(item.type)}}  style={tailwind`flex-row gap-2`}>
                                    <Text style={tailwind`text-xl py-2`}>{item.status_code}</Text>
                                    <Text style={tailwind`text-xl py-2`}>{item.description}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Modal>
            )}
        </View>
    );
}

export default CricketMatchPage;