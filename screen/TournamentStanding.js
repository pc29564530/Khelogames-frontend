import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Modal, TextInput, ScrollView} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import PointTable from '../components/PointTable';
import SelectTeamBySport from '../components/SelectTeamBySport';
import { useFocusEffect } from '@react-navigation/native';
import { fetchStandings, fetchGroups, addGroup, getTeamsByTournamentID } from '../services/tournamentServices';
import { useDispatch, useSelector } from 'react-redux';


const TournamentStanding = ({route}) => {
    const {tournament, currentRole} = route.params;
    const axiosInstance = useAxiosInterceptor();
    const [isModalTeamVisible, setIsModalTeamVisible] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupStrength, setGroupStrength] = useState(3);
    const [isModalGroupVisible, setIsModalGroupVisible] = useState(false);
    const groups = useSelector((state) => state.tournamentsReducers.groups);
    const standings = useSelector((state) => state.tournamentsReducers.standings);
    const teams = useSelector((state) => state.teams.teams);
    const dispatch = useDispatch();


    
    useFocusEffect(
        React.useCallback(() => {
         fetchGroups({tournament:tournament, axiosInstance:axiosInstance, dispatch: dispatch})
    }, [tournament, axiosInstance]));

    useEffect(() => {
        if (groups.length > 0) {
            fetchStandings({tournament:tournament, groups:groups, axiosInstance:axiosInstance, dispatch:dispatch});
        }
    }, [ tournament, groups, axiosInstance]);
    
    const handleAddGroup = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const groupData = {
                group_name:groupName,
                tournament_id: tournament.tournament_id,
                group_strength: groupStrength
            }
            const response = await axiosInstance.post(`${BASE_URL}/${tournament.sports}/createTournamentGroup`,groupData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            } )
            const item = response.data || [];
            dispatch(addGroup(item));
        } catch (err) {
            console.error("unable to add the group: ", err)
        }
    }

    const handleIncrement = () => {
        setGroupStrength(prevStrength => prevStrength+1);
    }

    const handleDecrement = () => {
        if(groupStrength > 1) {
            setGroupStrength(prevStrength => prevStrength-1);
        }
    }

    const handleGroupClose = () => {
        setIsModalGroupVisible(!isModalGroupVisible);
    }
    const handleTeamClose = () => {
        setIsModalTeamVisible(!isModalTeamVisible);
    }

    const handleTeamSelection = () => {
        setIsModalTeamSelection(false)
    }
    
  return (
    <ScrollView style={tailwind`mt-4`}>
        {currentRole === "admin" && (
            <View style={tailwind`flex-row`}>
                <Pressable onPress={() => setIsModalGroupVisible(!isModalGroupVisible)} style={tailwind`p-4 rounded-lg shadow-lg w-30 items-center justify-center`}>
                    <Text>Set Group</Text>
                </Pressable>
                <Pressable onPress={() => setIsModalTeamVisible(!isModalTeamVisible)} style={tailwind`p-4 rounded-lg shadow-lg w-30 items-center justify-center`}>
                    <Text>Set Team</Text>
                </Pressable>
            </View>
        )}
        <View>
            {standings?.length > 0 ? (
                standings?.map((group, standingIndex) => (
                    <View key={standingIndex}>
                        <Text>{group.groupName}</Text>
                        <PointTable standingsData={group.standData}/>
                    </View>
                    ))
                ) : (
                    <View style={tailwind`rounded-lg bg-white shadow-lg h-40 ml-12 mr-12 items-center justify-center`}>
                        <Text style={tailwind`text-black pt-16 text-lg`}>
                            Yet no standing is present
                        </Text>
                    </View>
            )}
        </View>
        {isModalGroupVisible && <Modal animationType="slide"
                visible={isModalGroupVisible}
                transparent={true}
            >
                <Pressable onPress={() => handleGroupClose()} style={tailwind`flex-1 justify-end bg-black   rounded-lg bg-black items-center justify-end`}>
                    <View style={tailwind`bg-white p-4 rounded-lg h-80 w-full`}>
                        <TextInput
                            value={groupName}
                            onChangeText={text => setGroupName(text)}
                            placeholder="Group Name"
                            style={tailwind`border-b border-gray-400 mb-4`}
                        />
                        <View style={tailwind`flex-row justify-between items-center mb-4`}>
                            <Text>Group Strength:</Text>
                            <Pressable onPress={handleDecrement} style={tailwind`border border-gray-400 p-2 rounded-full`}>
                                <Text>-</Text>
                            </Pressable>
                            <Text>{groupStrength}</Text>
                            <Pressable onPress={handleIncrement} style={tailwind`border border-gray-400 p-2 rounded-full`}>
                                <Text>+</Text>
                            </Pressable>
                        </View>
                        <Pressable onPress={() => handleAddGroup()} style={tailwind`bg-blue-500 p-2 rounded-lg`}>
                            <Text style={tailwind`text-white`}>Save</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
            }

            {isModalTeamVisible && <Modal animationType="slide"
                            visible={isModalTeamVisible}
                            transparent={true}
                            onRequestClose={handleTeamClose}
                        >
                <Pressable onPress={() => handleTeamClose()} style={tailwind`flex-1 justify-end bg-black bg-opacity-50 rounded-lg bg-black items-center justify-end`}>
                    <View style={tailwind`bg-white p-4 rounded-lg h-80 w-full`}>
                    <Pressable onPress={() => handleTeamSelection}>
                            <SelectTeamBySport tournament={tournament} groups={groups}/>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
            }
    </ScrollView>
       
  )
}

export default TournamentStanding