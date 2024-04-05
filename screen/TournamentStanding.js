import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Modal, TextInput} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import PointTable from '../components/PointTable';

const TournamentStanding = ({route}) => {
    const tournament = route.params.tournament;
    const axiosInstance = useAxiosInterceptor();
    const [group, setGroup] = useState([]);
    const [standings, setStandings] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupStrength, setGroupStrength] = useState(3);
    const [standingGroupData, setStandingGroupData] = useState([]);

    const fetchGroup = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const tour = {
                tournament_id: tournament.tournament_id
            }
            const response = await axiosInstance.get(`${BASE_URL}/getTournamentGroups`, {
                params:{
                    tournament_id: tournament.tournament_id.toString()
                },
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            setGroup(response.data);
        } catch (err) {
            console.error("unable to fetch the group using sport: ", err);
        }
    }
    console.log("Group: ", group)
    useEffect(() => {
        fetchGroup();
    }, [])
    
    useEffect(() => {
        const fetchStanding = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                let standingData = [];
                if (group.length > 0 && group[0] !== undefined) {
                    for (const item of group) {
                        if (item !== undefined) {
                            const response = await axiosInstance.get(`${BASE_URL}/getTournamentStanding`, {
                                params: {
                                    tournament_id: tournament.tournament_id.toString(),
                                    group_id: item.group_id,
                                    sport_type: tournament.sport_type
                                },
                                headers: {
                                    'Authorization': `Bearer ${authToken}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            standingData.push({groupName: item.group_name, standData: response.data});
                        } else {
                            console.error("Item is undefined");
                        }

                    }
                    setStandings(standingData)
                } else {
                    console.error("Group array is empty or contains undefined elements");
                }
            } catch (err) {
                console.error("unable to fetch the standing using sport: ", err);
            }
        };

        if (group?.length >= 0) {
            fetchStanding();
        }
    }, [group, tournament]);

    console.log("Standing: ", standings)
    let tableHead;
    let standingsData=[];

    if(standings[0]?.standData[0]?.sport_type === "Football") {
        tableHead = ["Team", "W", "L", "D", "GD", "Pts"];
        standingsData = standings[0]?.standData.map((item, index) => [
            item.club_name, item.wins, item.loss, item.draw, item.goals_for, item.goals_against, item.goals_difference, item.points
        ]).map(row => row.filter(value => value !== undefined));
    } else {
        tableHead = ["Team", "M", "W", "L", "D", "Points"];
        standingsData = standings[0]?.standData.map((item, index) => [
            item.club_name, item.wins, item.loss, item.draw, item.goals_difference, item.points
        ]).map(row => row.filter(value => value !== undefined));
    }

    if(standings.length>0){

    }





    const handleAddGroup = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const groupData = {
                group_name:groupName,
                tournament_id: tournament.tournament_id,
                group_strength: groupStrength
            }
            const response = await axiosInstance.post(`${BASE_URL}/addTournamentGroup`,groupData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            } )
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

    const handleClose = () => {
        setIsModalVisible(!isModalVisible);
    }

   //console.log("Standing Ponit: ", standingsData) 
  return (
    <View style={tailwind`mt-4`}>
        <Pressable onPress={() => setIsModalVisible(!isModalVisible)} style={tailwind`p-4 rounded-lg shadow-lg w-30 items-center justify-center`}>
            <Text>Set Group</Text>
        </Pressable>
        <View>
            {standings.length > 0 ? (
                standings.map((group, standingIndex) => (
                    <View key={standingIndex}>
                        <Text>{group.groupName}</Text>
                        <View>
                             <PointTable standingsData={standingsData} tableHead={tableHead}/>
                        </View>
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
        {isModalVisible && <Modal animationType="slide"
                visible={isModalVisible}
                transparent={true}
            >
                <Pressable onPress={() => handleClose()} style={tailwind`flex-1 justify-end bg-black bg-opacity-50 rounded-lg bg-black items-center justify-end`}>
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
                        <Pressable onPress={handleAddGroup} style={tailwind`bg-blue-500 p-2 rounded-lg`}>
                            <Text style={tailwind`text-white`}>Save</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
            }

        
    </View>
       
  )
}

export default TournamentStanding