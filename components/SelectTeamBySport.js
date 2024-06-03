import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Modal, Pressable} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import tailwind from 'twrnc';
import { useDispatch } from 'react-redux';
import { addTeamToGroup } from '../redux/actions/actions';

const SelectTeamBySport = ({tournament, groups }) => {
    const [isModalTeamVisible, setIsModalTeamVisible] = useState(false)
    const [teamID, setTeamID] = useState(null);
    const [teams, setTeams] = useState([]);
    const [groupID, setGroupID] = useState(null);
    const [isModalGroupVisible, setIsModalGroupVisible] = useState(false);
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${tournament.sport_type}/getTeams/${tournament.tournament_id}`, null, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                })
                if(!response.data || response.data === null) {
                    setTeams([]);
                } else {
                    setTeams(response.data);
                }
            } catch (err) {
                console.error("unable to fetch the team by sport: ", err);
            }
        }
        fetchTeam();
    }, []);


    const handleTeamSelect = () => {
        setIsModalTeamVisible(!isModalTeamVisible); 
    }

    const handleSelectGroup = (item) => {
        setGroupID(item.group_id);
        setIsModalGroupVisible(false);
    }

    const handleCloseGroup = () => {
        setIsModalGroupVisible(false);
    }

    const handleTeamClose = () => {
        setIsModalTeamVisible(!isModalTeamVisible);
    }

    const handleAddTeamToGroup = async() => {
        try {
            const data = {
                group_id: groupID,
                tournament_id: tournament.tournament_id,
                team_id: teamID
            }
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`${BASE_URL}/addGroupTeam`,data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            })

            if(response.data && response.data !== null) {
                try {
                    const teamData = {
                        "tournament_id":response.data.tournament_id,
                        "group_id":response.data.group_id,
                        "team_id":response.data.team_id,
                        "wins":0,
                        "loss":0,
                        "draw":0,
                        "goal_for":0,
                        "goal_against":0,
                        "goal_difference":0,
                        "points":0
                    }
                    const responseAddTeam = await axiosInstance.post(`${BASE_URL}/${tournament.sport_type}/createTournamentStanding`, teamData, {
                        headers: {
                            'Authorization': `bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    const item = responseAddTeam.data || [];
                    dispatch(addTeamToGroup(item));
                } catch (err) {
                    console.log("unable to add the team to standing: ", err)
                }
            }
        } catch (err) {
            console.error("unable to fetch the team by sport: ", err);
        }
    }

    const handleGroupSelect = () => {
        setIsModalGroupVisible(!isModalGroupVisible)
    }

    const handleTeamSelection = (item) => {
        setTeamID(item);
        setIsModalTeamVisible(false);
    }

    return (
        <View>
            <Pressable onPress={() => handleTeamSelect()} style={tailwind`bg-blue-500 p-2 rounded-lg mb-4`}>
                <Text>Select Team</Text>
            </Pressable>
            <Pressable onPress={() => handleGroupSelect()} style={tailwind`bg-blue-500 p-2 rounded-lg mb-4`}>
                <Text>Select Group/League</Text>
            </Pressable>
            <Pressable onPress={() => handleAddTeamToGroup()} style={tailwind`bg-blue-500 p-2 rounded-lg`}>
                <Text style={tailwind`text-white`}>Save</Text>
            </Pressable>
            {isModalTeamVisible && (
               <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isModalTeamVisible}
                    onRequestClose={handleTeamClose}
                >
                    <Pressable onPress={handleTeamClose} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            {teams.map((item,index) => (
                                <Pressable key={index} onPress={() => handleTeamSelection(item.id)} style={tailwind`mt-2 p-1`}>
                                    <Text style={tailwind`text-black text-lg`}>{item.club_name}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </Pressable>
                </Modal>
            )}
            
            {isModalGroupVisible && (
                <Modal
                        transparent={true}
                        animationType="slide"
                        visible={isModalGroupVisible}
                        onRequestClose={handleCloseGroup}
                >
                    <Pressable onPress={handleCloseGroup} style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                        <View style={tailwind`bg-white rounded-md p-4`}>
                            {groups.map((item,index) => (
                                <Pressable key={index} onPress={() => handleSelectGroup(item)} style={tailwind`mt-2 p-1`}>
                                    <Text style={tailwind`text-black text-lg`}>{item.group_name}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    )
}

export default SelectTeamBySport;