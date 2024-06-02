import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import tailwind from 'twrnc';
import DateTimePicker from 'react-native-modern-datepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { addFootballScoreServices } from '../services/footballMatchServices';
import { addCricketScoreServices } from '../services/cricketMatchServices';
import { useDispatch, useSelector } from 'react-redux';

const CreateFixture = ({ tournament, teams, organizerID, handleCloseFixtureModal, sport }) => {
    const [team1, setTeam1] = useState(null);
    const [team2, setTeam2] = useState(null);
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [isModalTeamVisible, setIsModalTeamVisible] = useState(false);
    const [isModalDateVisible, setIsModalDateVisible] = useState(false);
    const [isModalStartTimeVisible, setIsModalStartTimeVisible] = useState(false);
    const [isModalEndTimeVisible, setIsModalEndTimeVisible] = useState(false);
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();

    const modifyDateTime = (newDateTime) => {
        if (!newDateTime) {
            console.error('new date time is undefined');
            return null;
        }
        const [datePart, timePart] = newDateTime.split(' ');
        const [year, month, day] = datePart.split('/').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        const matchDateTime = new Date(Date.UTC(year, month - 1, day, hour, minute));
        return matchDateTime;
    };

    const handleSelectTeam = (item) => {
        if (team1 === null) {
            setTeam1(item.id);
        } else {
            setTeam2(item.id);
        }
        setIsModalTeamVisible(false);
    };

    const handleSetFixture = async () => {
        try {
            const fixture = {
                organizer_id: organizerID,
                tournament_id: tournament.tournament_id,
                team1_id: team1,
                team2_id: team2,
                date_on: modifyDateTime(date),
                start_time: modifyDateTime(startTime),
                stage: "",
                sports: sport,
                end_time: modifyDateTime(endTime),
            };

            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`${BASE_URL}/${sport}/createTournamentMatch`, fixture, {
                headers: {
                    'Authorization': `bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const item = response.data;
            if (item) {
                switch (sport) {
                    case "Cricket":
                        return addCricketScoreServices({ sport, dispatch, item, authToken, axiosInstance });
                    default:
                        return addFootballScoreServices({ sport, dispatch, item, authToken, axiosInstance });
                }
            }
        } catch (err) {
            console.error("Unable to set the fixture: ", err);
        } finally {
            handleCloseFixtureModal();
        }
    };

    return (
        <View style={tailwind`justify-center items-center bg-gray-100`}>
            <View style={tailwind`bg-white rounded-lg shadow-lg p-6 w-11/12`}>
                <View style={tailwind`flex-row justify-between items-center mb-4`}>
                    <Text style={tailwind`text-2xl font-bold text-gray-800`}>Create Fixture</Text>
                    <Pressable onPress={handleCloseFixtureModal}>
                        <MaterialIcons name="close" size={24} color="gray" />
                    </Pressable>
                </View>
                <Pressable onPress={() => setIsModalDateVisible(true)} style={tailwind`mb-4 p-4 bg-blue-500 rounded-lg`}>
                    <Text style={tailwind`text-white text-center`}>Select Date</Text>
                </Pressable>
                <View style={tailwind`flex-row justify-between mb-4`}>
                    <Pressable onPress={() => setIsModalStartTimeVisible(true)} style={tailwind`flex-1 p-4 bg-green-500 rounded-lg mr-2`}>
                        <Text style={tailwind`text-white text-center`}>Start Time</Text>
                    </Pressable>
                    <Pressable onPress={() => setIsModalEndTimeVisible(true)} style={tailwind`flex-1 p-4 bg-red-500 rounded-lg ml-2`}>
                        <Text style={tailwind`text-white text-center`}>End Time</Text>
                    </Pressable>
                </View>
                <View style={tailwind`flex-row justify-between mb-6`}>
                    <Pressable onPress={() => setIsModalTeamVisible(true)} style={tailwind`flex-1 p-4 bg-yellow-500 rounded-lg mr-2`}>
                        <Text style={tailwind`text-white text-center`}>Team 1</Text>
                    </Pressable>
                    <Text style={tailwind`self-center text-lg text-gray-700`}>Vs</Text>
                    <Pressable onPress={() => setIsModalTeamVisible(true)} style={tailwind`flex-1 p-4 bg-yellow-500 rounded-lg ml-2`}>
                        <Text style={tailwind`text-white text-center`}>Team 2</Text>
                    </Pressable>
                </View>
                <Pressable onPress={handleSetFixture} style={tailwind`p-4 bg-purple-500 rounded-lg`}>
                    <Text style={tailwind`text-white text-center text-lg`}>Submit</Text>
                </Pressable>
            </View>

            {isModalDateVisible && (
            <Modal
            transparent={true}
            animationType="slide"
            visible={isModalDateVisible}
        >
            <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
            <View style={tailwind`bg-white rounded-md p-4`}>
                <DateTimePicker
                    onSelectedChange={(date) => {
                        setDate(date);
                        setIsModalDateVisible(false);
                    }}

                />
            </View>
            </View>
        </Modal>
        )}
        {isModalEndTimeVisible && (
            <Modal
            transparent={true}
            animationType="slide"
            visible={isModalEndTimeVisible}
        >
            <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
            <View style={tailwind`bg-white rounded-md p-4`}>
                <DateTimePicker
                    onSelectedChange={(endTime) => {
                        setEndTime(endTime);
                        setIsModalEndTimeVisible(false);
                    }}
                />
            </View>
            </View>
        </Modal>
        )}
        {isModalStartTimeVisible && (
            <Modal
            transparent={true}
            animationType="slide"
            visible={isModalStartTimeVisible}
        >
            <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
            <View style={tailwind`bg-white rounded-md p-4`}>
                <DateTimePicker
                    onSelectedChange={(startTime) => {
                        setStartTime(startTime);
                        setIsModalStartTimeVisible(false);
                    }}
                />
            </View>
            </View>
        </Modal>
        )}
        {isModalTeamVisible && (
            <Modal
                transparent={true}
                animationType="slide"
                visible={isModalTeamVisible}
            >
                <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                    <View style={tailwind`bg-white rounded-md p-4`}>
                            <ScrollView nestedScrollEnabled={true}>
                                {teams.map((item, index) => (
                                    <Pressable key={index} onPress={() => handleSelectTeam(item)} style={tailwind`p-4 border-b border-gray-200`}>
                                        <Text style={tailwind`text-lg text-gray-800`}>{item.club_name}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                    </View>
                </View>
            </Modal>
            )}
        </View>
    );
};

export default CreateFixture;
