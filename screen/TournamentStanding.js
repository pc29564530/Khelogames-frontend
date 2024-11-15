import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Modal, TextInput, ScrollView,Touchable, FlatList} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import PointTable from '../components/PointTable';
//import SelectTeamBySport from '../components/SelectTeamBySport';
import { useFocusEffect } from '@react-navigation/native';
import { fetchStandings, fetchGroups, addGroup, getTeamsByTournamentID, fetchAllGroups } from '../services/tournamentServices';
import { useDispatch, useSelector } from 'react-redux';
import { addTeamToGroup } from '../redux/actions/actions';
import { TextFormatOutlined } from '@mui/icons-material';


const TournamentStanding = ({route}) => {
    const {tournament, currentRole} = route.params;
    const axiosInstance = useAxiosInterceptor();
    const [isModalTeamVisible, setIsModalTeamVisible] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupStrength, setGroupStrength] = useState(3);
    const [isModalGroupVisible, setIsModalGroupVisible] = useState(false);
    const [groupSelectedList, setGroupSelectedList] = useState([]);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const groups = useSelector((state) => state.tournamentsReducers.groups);
    const standings = useSelector((state) => state.tournamentsReducers.standings);
    const teams = useSelector((state) => state.teams.teams);
    const game = useSelector(state => state.sportReducers.game);
    
    const [isModalCreateStandingVisible, setIsCreateStandingVisible] = useState(false);
    const dispatch = useDispatch();


    
    useFocusEffect(
        React.useCallback(() => {
         //fetchGroups({tournament:tournament, axiosInstance:axiosInstance, dispatch: dispatch})
         fetchAllGroups({axiosInstance:axiosInstance, dispatch:dispatch})
    }, [axiosInstance]));

    useEffect(() => {
            fetchStandings({tournament:tournament, axiosInstance:axiosInstance, dispatch:dispatch, game: game});
    }, [ tournament, axiosInstance, dispatch]);

    const handleGroupSelect = (item) => {
        setSelectedGroup(item)
    }

    const handleTeamToggle = (team) => {

        if (selectedTeams.includes(team)) {
            setSelectedTeams(selectedTeams.filter(t => t.id !== team.id));
        } else {
            handleTeamToGroup(team.id)
            setSelectedTeams([...selectedTeams, team]);

        }
    };

    const handleCreateStanding = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const groupData = {
                group: selectedGroup.id,
                tournament_id: tournament.tournament_id,
                team_id: teamID
            }
            const response = await axiosInstance.post(`${BASE_URL}/${game.name}/createTournamentStanding`,groupData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            } )
            const item = response.data || [];
        } catch (err) {
            console.error("unable to add the group: ", err)
        }
    }

    const handleTeamToGroup = async (id) => {
        try {
            
            const authToken = await AsyncStorage.getItem('AccessToken');
            console.log(selectedGroup.id)
            const groupData = {
                tournament_id: tournament.id,
                group_id: selectedGroup.id,
                team_id: id
            }

            const response = await axiosInstance.post(`${BASE_URL}/${game.name}/createTournamentStanding`,groupData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            } )
            const item = response.data || [];
        } catch (err) {
            console.error("unable to add the group: ", err)
        }
    }

  return (
    <ScrollView style={tailwind`mt-4`}>
        <View style={tailwind``}>
            <Pressable onPress={() => {setIsCreateStandingVisible(true)}} style={tailwind`p-4 shadow-lg bg-red-200 w-full items-center justify-center`}>
                <Text style={tailwind`text-xl font-bold`}>Create Standing</Text>
            </Pressable>
        </View>
        <View style={tailwind`p-4`}>
            {standings?.length > 0 ? (
                standings.map((group, index) => (
                    <View key={index} style={tailwind`mb-8`}>
                        <Text style={tailwind`text-lg font-bold mb-2`}>{group.group_name}</Text>
                        <PointTable standingsData={group.team_row} game={game} />
                    </View>
                ))
            ) : (
                <View style={tailwind`rounded-lg bg-white shadow-lg h-40 items-center justify-center`}>
                    <Text style={tailwind`text-black pt-16 text-lg`}>No standings available</Text>
                </View>
            )}
        </View>


        {isModalCreateStandingVisible && 
            <Modal
                animationType="slide"
                visible={isModalCreateStandingVisible}
                transparent={true}
            >
                <Pressable 
                onPress={() => setIsCreateStandingVisible(false)} 
                style={tailwind`flex-1 justify-end bg-black/50 items-center`}
                >
                <View style={tailwind`bg-white p-5 rounded-t-3xl w-full items-center`}>
                    <Text style={tailwind`text-2xl font-bold text-gray-800 mb-4`}>Create Standing</Text>
                    <View style={tailwind`flex-row w-full justify-around`}>
                        <Pressable 
                            onPress={() => setIsModalGroupVisible(true)} 
                            style={tailwind`p-4 shadow-md bg-blue-500 rounded-lg w-32 items-center`}
                        >
                            <Text style={tailwind`text-lg font-bold text-white`}>Groups</Text>
                        </Pressable>
                        <Pressable 
                            onPress={() => {
                                if (selectedGroup) {
                                    setIsModalTeamVisible(true);
                                }
                            }}
                            style={[
                                tailwind`p-4 shadow-md rounded-lg w-32 items-center`,
                                selectedGroup ? tailwind`bg-green-500` : tailwind`bg-gray-300`
                            ]}
                            disabled={!selectedGroup}
                            >
                            <Text style={tailwind`text-lg font-bold text-white`}>Teams</Text>
                        </Pressable>
                    </View>
                    <Pressable onPress={() => {handleCreateStanding()}}>
                        <Text>Save</Text>
                    </Pressable>
                </View>
                </Pressable>
            </Modal>
        }

        {isModalGroupVisible && <Modal animationType="slide"
                visible={isModalGroupVisible}
                transparent={true}
            >
                <Pressable onPress={() => setIsModalGroupVisible(false)} style={tailwind`flex-1 justify-end bg-black   rounded-lg bg-black bg-opacity-50 items-center justify-end`}>
                    <View style={tailwind`bg-white p-4 rounded-lg h-80 w-full`}>
                        <Text>Select a Group</Text>
                        <FlatList 
                            data={groups}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({item}) => (
                                <Pressable onPress={() => handleGroupSelect(item)} style={tailwind`p-2 border-b border-gray-300`}>
                                    <Text>{item.name}</Text>
                                </Pressable>
                            )}
                        />
                    </View>
                </Pressable>
            </Modal>
            }
            {isModalTeamVisible && (
                <Modal animationType="slide" visible={isModalTeamVisible} transparent={true}>
                    <Pressable onPress={() => setIsModalTeamVisible(false)} style={tailwind`flex-1 justify-end bg-black bg-opacity-50 items-center`}>
                        <View style={tailwind`bg-white p-4 rounded-lg h-80 w-full`}>
                            <Text style={tailwind`text-lg font-bold mb-2`}>Select Teams for {selectedGroup.name}</Text>
                            <FlatList
                                data={teams}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <View style={tailwind`p-2 border-b border-gray-300 flex-row justify-between`}>
                                        <Text style={selectedTeams.includes(item) ? tailwind`text-gray-500` : tailwind`text-black`}>{item.name}</Text>
                                        <CheckBox
                                            value={selectedTeams.includes(item)}
                                            onValueChange={() => {handleTeamToggle(item)}}
                                            disabled={selectedTeams.includes(item)}
                                        />
                                    </View>
                                )}
                            />
                            <Pressable onPress={() => handleTeamToGroup()} style={tailwind`mt-4 p-4 bg-blue-500 rounded-lg`}>
                                <Text style={tailwind`text-white text-center`}>Submit Teams</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
            )}
    </ScrollView>
       
  )
}

export default TournamentStanding