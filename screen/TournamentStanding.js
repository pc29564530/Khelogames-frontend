import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Modal, TextInput} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import PointTable from '../components/PointTable';
import { ScrollView } from 'react-native-gesture-handler';
import SelectTeamBySport from '../components/SelectTeamBySport';

const TournamentStanding = ({route}) => {
    const tournament = route.params.tournament;
    const axiosInstance = useAxiosInterceptor();
    const [group, setGroup] = useState([]);
    const [standings, setStandings] = useState([]);
    const [isModalTeamVisible, setIsModalTeamVisible] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupStrength, setGroupStrength] = useState(3);
    const [standingGroupData, setStandingGroupData] = useState([]);
    const [isModalGroupVisible, setIsModalGroupVisible] = useState(false);

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
                            const data = {
                                    tournament_id: tournament.tournament_id,
                                    group_id: item.group_id,
                                    sport_type: tournament.sport_type
                            }
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

    let tableHead;
    let standingsData=[];
    if( standings.length>0 && standings[0]?.standData !== null &&  standings[0]?.standData[0]?.sport_type === "Football") {
        tableHead = ["Team", "W", "L", "D", "GD", "Pts"];
        standingsData = standings[0]?.standData.map((item, index) => [
            item.club_name, item.wins, item.loss, item.draw, item.goals_for, item.goals_against, item.goals_difference, item.points
        ]).map(row => row.filter(value => value !== undefined));
    } else if(standings.length>0 && standings[0]?.standData !== null &&  standings[0]?.standData[0]?.sport_type === "Cricket"){
        tableHead = ["Team", "M", "W", "L", "D", "Points"];
        standingsData = standings[0]?.standData.map((item, index) => [
            item.club_name, item.wins, item.loss, item.draw, item.points
        ]).map(row => row.filter(value => value !== undefined));
    }

    const handleAddGroup = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const groupData = {
                group_name:groupName,
                tournament_id: tournament.tournament_id,
                group_strength: groupStrength
            }
            const response = await axiosInstance.post(`${BASE_URL}/createTournamentGroup`,groupData, {
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

    const handleGroupClose = () => {
        setIsModalGroupVisible(!isModalGroupVisible);
    }
    const handleTeamClose = () => {
        setIsModalTeamVisible(!isModalTeamVisible);
    }

    const handleTeamSelection = () => {
        setIsModalTeamSelection(!setIsModalTeamSelection)
    }

    const closeTeamBySport = () => {
        setIsModalTeamVisible(false)
    }
  return (
    <ScrollView style={tailwind`mt-4`}>
        <View style={tailwind`flex-row`}>
            <Pressable onPress={() => setIsModalGroupVisible(!isModalGroupVisible)} style={tailwind`p-4 rounded-lg shadow-lg w-30 items-center justify-center`}>
                <Text>Set Group</Text>
            </Pressable>
            <Pressable onPress={() => setIsModalTeamVisible(!isModalTeamVisible)} style={tailwind`p-4 rounded-lg shadow-lg w-30 items-center justify-center`}>
                <Text>Set Team</Text>
            </Pressable>
        </View>
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
                        <Pressable onPress={handleAddGroup} style={tailwind`bg-blue-500 p-2 rounded-lg`}>
                            <Text style={tailwind`text-white`}>Save</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
            }

            {isModalTeamVisible && <Modal animationType="slide"
                            visible={isModalTeamVisible}
                            transparent={true}
                            onRequestClose={closeTeamBySport}
                        >
                <Pressable onPress={() => handleTeamClose()} style={tailwind`flex-1 justify-end bg-black bg-opacity-50 rounded-lg bg-black items-center justify-end`}>
                    <View style={tailwind`bg-white p-4 rounded-lg h-80 w-full`}>
                        <Pressable onPress={() => handleTeamSelection}>
                            <SelectTeamBySport tournament={tournament} group={group} closeTeamBySport={closeTeamBySport}/>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
            }
    </ScrollView>
       
  )
}

export default TournamentStanding