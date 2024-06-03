import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import CreateFixtue from '../components/CreateFixture';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TournamentFootballMatch from '../components/TournamentFootballMatch';
import TournamentCricketMatch from '../components/TournamentCricketMatch';
import { useDispatch, useSelector } from 'react-redux';
import { getTeams } from '../redux/actions/actions';

const TournamentMatches = ({ route }) => {
    const { tournament, currentRole } = route.params;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [organizerID, setOrganizerID] = useState(null);
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const teams = useSelector((state) => state.teams.teams);

    useEffect(() => {
        fetchTournamentOrganizer();
        fetchTournamentTeams();
    }, []);

    const fetchTournamentOrganizer = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');
            const response = await axiosInstance.get(`${BASE_URL}/getOrganizer`, {
                params: {
                    tournament_id: tournament.tournament_id.toString(),
                    organizer_name: user
                },
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const item = response.data;
            setOrganizerID(item.organizer_id)
            //add this foreach when there is more than one organizer for tournament
            // item.forEach(item => {
            //     if (item.organizer_name.toLowerCase() === user.toLowerCase()) {
            //         // setAdmin(true);
            //         setOrganizerID(item.organizer_id);
            //     }
            // });
        } catch (err) {
            console.log("Unable to fetch the organizer: ", err);
        }
    };

    const fetchTournamentTeams = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/${tournament.sport_type}/getTeams/${tournament.tournament_id}`, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            dispatch(getTeams(response.data || []));
        } catch (err) {
            console.error("Unable to fetch teams: ", err);
        }
    };

    const handleCloseFixtureModal = () => {
        setIsModalVisible(false);
    };

    const determineMatchStatus = (item) => {
        const startTimeStr = item.start_time;
        const endTimeStr = item.end_time;

        const matchStartDateTime = new Date(startTimeStr);
        const matchEndDateTime = new Date(endTimeStr);
        const currentDateTime = new Date();

        if (isNaN(matchStartDateTime) || isNaN(matchEndDateTime)) {
            console.error("date time format error");
            return "";
        }

        let status;
        if (currentDateTime < matchStartDateTime) {
            status = "Not Started";
        } else if (currentDateTime > matchEndDateTime) {
            status = "End";
        } else {
            status = "Live";
        }
        return status;
    };

    const formattedDate = (item) => {
        const timestampDate = new Date(item);
        const optionsDate = { weekday: 'long', month: 'long', day: '2-digit' };
        return timestampDate.toLocaleDateString('en-US', optionsDate);
    };

    const formattedTime = (item) => {
        const timestampStr = item;
        const [datePart, timePart] = timestampStr.split('T');
        const [hour, minute] = timePart.split(':').map(Number);

        let adjustedHour = hour;
        if (adjustedHour > 12) {
            adjustedHour %= 12;
        } else if (adjustedHour === 0) {
            adjustedHour = 12;
        }
        const period = hour < 12 ? 'AM' : 'PM';
        return `${adjustedHour}:${minute < 10 ? '0' + minute : minute} ${period}`;
    };

    const tournamentMatchBySport = (sport) => {
        switch (sport) {
            case "Cricket":
                return (
                    <TournamentCricketMatch
                        tournament={tournament}
                        determineMatchStatus={determineMatchStatus}
                        formattedDate={formattedDate}
                        formattedTime={formattedTime}
                        AsyncStorage={AsyncStorage}
                        axiosInstance={axiosInstance}
                        BASE_URL={BASE_URL}
                    />
                );
            default:
                return (
                    <TournamentFootballMatch
                        tournament={tournament}
                        determineMatchStatus={determineMatchStatus}
                        formattedDate={formattedDate}
                        formattedTime={formattedTime}
                        AsyncStorage={AsyncStorage}
                        axiosInstance={axiosInstance}
                        BASE_URL={BASE_URL}
                    />
                );
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} nestedScrollEnabled={true}>
            <View style={tailwind`flex-1 bg-gray-100`}>
                <View style={tailwind`p-4 flex-row justify-between items-center bg-white shadow-md`}>
                    <Text style={tailwind`text-xl font-bold text-gray-800`}>{tournament?.name}</Text>
                    <Pressable
                        onPress={() => setIsModalVisible(!isModalVisible)}
                        style={tailwind`rounded-lg bg-purple-500 p-2 flex-row items-center`}
                    >
                        <Text style={tailwind`text-lg text-white mr-2`}>Set Fixture</Text>
                        <MaterialIcons name="add" size={24} color="white" />
                    </Pressable>
                </View>
                {isModalVisible && (
                    <Modal transparent={true} animationType='slide' visible={isModalVisible} onRequestClose={handleCloseFixtureModal}>
                        <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                            <View style={tailwind`bg-white rounded-t-lg p-6 max-h-3/4`}>
                                <CreateFixtue
                                    tournament={tournament}
                                    teams={teams}
                                    organizerID={organizerID}
                                    handleCloseFixtureModal={handleCloseFixtureModal}
                                    sport={tournament.sport_type}
                                />
                            </View>
                        </View>
                    </Modal>
                )}
                {tournamentMatchBySport(tournament.sport_type)}
            </View>
        </ScrollView>
    );
};

export default TournamentMatches;
