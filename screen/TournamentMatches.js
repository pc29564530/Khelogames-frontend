import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable, Modal, Image } from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import CreateFixtue from '../components/CreateFixture';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ScrollView } from 'react-native-gesture-handler';
import TournamentFootballMatch from '../components/TournamentFootballMatch';
import TournamentCricketMatch from '../components/TournamentCricketMatch';

const TournamentMatches = ({route }) => {
    const {tournament, currentRole } = route.params;
    const [teams, setTeams] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [organizerID, setOrganizerID] = useState(null);
    const axiosInstance = useAxiosInterceptor();

    useEffect(() => {
        fetchTournamentOrganizer();
    }, []);

    useEffect(() => {
            fetchTournamentTeams();
    }, []);

    const fetchTournamentOrganizer = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');
            const response = await axiosInstance.get(`${BASE_URL}/getOrganizer/${tournament.tournament_id}`, null, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const item = response.data;
            item.forEach(item => {
                if (item.organizer_name.toLowerCase() === user.toLowerCase()) {
                    // setAdmin(true);
                    setOrganizerID(item.organizer_id);
                }
            });
        } catch (err) {
            console.log("Unable to fetch the organizer: ", err);
        }
    };

    const fetchTournamentTeams = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`${BASE_URL}/getTeams/${tournament.tournament_id}`, null, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            setTeams(response.data);
        } catch (err) {
            console.error("Unable to fetch teams: ", err);
        }
    };


    const handleCloseFixtureModal = () => {
        setIsModalVisible(!isModalVisible);
    }
    
    const determineMatchStatus = (item) => {
            startTimeStr = item.start_time;
            endTimeStr = item.end_time;
            const [datePart, timePart] = startTimeStr.split('T');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute, second] = timePart.slice(0,-1).split(':').map(Number);
            const matchStartDateTime = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

        const [datePartEnd, timePartEnd] = endTimeStr.split('T');
        const [yearEnd, monthEnd, dayEnd] = datePartEnd.split('-').map(Number);
        const [hourEnd, minuteEnd, secondEnd] = timePartEnd.slice(0,-1).split(':').map(Number);
        const matchEndDateTime = new Date(Date.UTC(yearEnd, monthEnd - 1, dayEnd, hourEnd, minuteEnd, secondEnd));


        const currentDateTime = new Date();
        const localDate = new Date(currentDateTime.getTime()-currentDateTime.getTimezoneOffset()*60*1000)
        if (isNaN(matchStartDateTime) || isNaN(matchEndDateTime)) {
            console.error("date time format error")
            return "";
        }
    
        let status;
        if (localDate < matchStartDateTime ) {
            status = "Not Started";
        } else if (localDate > matchEndDateTime) {
            status = "End";
        } else {
            status = "Live";
        }
        return status;
    };
    
    const formattedDate = (item) => {
        const timestampStrDate = item;
        const timestampDate = new Date(timestampStrDate);
        const optionsDate = { weekday: 'long', month: 'long', day: '2-digit' };
        const formattedDate = timestampDate.toLocaleDateString('en-US', optionsDate);
        return formattedDate;
    }
    
    const formattedTime = (item) => {
        const timestampStr = item;
        const [datePart, timePart] = timestampStr.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        let adjustedHour = hour;
        if (adjustedHour > 12) {
            adjustedHour = adjustedHour%12;
        } else if (adjustedHour < 12) {
            adjustedHour = adjustedHour;
        }
        const period = hour < 12 ? 'AM' : 'PM';
        const formattedTime = `${adjustedHour}:${minute < 10 ? '0' + minute : minute} ${period}`;
        return formattedTime;
    }

    const tournamentMatchBySport = (sport) => {
        switch (sport) {
            case "Cricket":
                return  <TournamentCricketMatch
                    tournament={tournament}
                    determineMatchStatus={determineMatchStatus}
                    formattedDate={formattedDate}
                    formattedTime={formattedTime}
                    AsyncStorage={AsyncStorage}
                    axiosInstance={axiosInstance}
                    BASE_URL={BASE_URL}
                />;
            default:
                return  <TournamentFootballMatch
                    tournament={tournament}
                    determineMatchStatus={determineMatchStatus}
                    formattedDate={formattedDate}
                    formattedTime={formattedTime}
                    AsyncStorage={AsyncStorage}
                    axiosInstance={axiosInstance}
                    BASE_URL={BASE_URL}
                />;
        }
    }

    return (
        <ScrollView 
            contentContainerStyle={{flexGrow:1}}
            nestedScrollEnabled={true}
        >
        <View style={tailwind`flex-1 bg-gray-100`}>
            <View style={tailwind`p-4 flex-row justify-between items-center bg-white`}>
                <Text style={tailwind`text-xl font-bold text-gray-800`}>{tournament?.name}</Text>
                {currentRole === "admin" && (
                    <Pressable onPress={() => setIsModalVisible(!isModalVisible)} style={tailwind`rounded-lg bg-purple-200 p-2 justify-start flex-row items-center`}>
                        <Text style={tailwind`text-lg text-purple-800`}>Set Fixture</Text>
                        <MaterialIcons name="add" size={24} color="black" />
                    </Pressable>
                )}
            </View>
            {isModalVisible && (
                <Modal transparent={true} animationType='slide' visible={isModalVisible} onRequestClose={handleCloseFixtureModal}>
                    <View style={tailwind`flex-1 justify-center bg-black bg-opacity-50`}>
                        <CreateFixtue
                            tournament={tournament}
                            teams={teams}
                            organizerID={organizerID}
                            handleCloseFixtureModal={handleCloseFixtureModal}
                        />
                    </View>
                </Modal>
            )}
            {tournamentMatchBySport(tournament.sport_type)}
        </View>
        </ScrollView>
    );
};

export default TournamentMatches;
