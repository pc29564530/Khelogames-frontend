import React, {useState, useEffect, useContext} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, Text, Pressable, Modal} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import tailwind from 'twrnc';
import DateTimePicker from 'react-native-modern-datepicker'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {addFootballScoreServices} from '../services/footballMatchServices';
import {addCricketScoreServices} from '../services/cricketMatchServices';
import { useDispatch } from 'react-redux';

const CreateFixtue = ({tournament, teams, organizerID, handleCloseFixtureModal, sport}) => {
    const [admin, setAdmin] = useState('');
    const [team1, setTeam1] = useState(null);
    const [team2, setTeam2] = useState(null);
    const [date,setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [isModalTeamVisible, setIsModalTeamVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [isModalEndTimeVisible, setIsModalEndTimeVisible] = useState(false);
    const [isModalStartTimeVisible, setIsModalStartTimeVisible] = useState(false);
    const [isModalDateVisible, setIsModalDateVisible] = useState(false);
    const [modalType, setModalType] = useState('')
    const axiosInstance = useAxiosInterceptor()
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
    if(modalType === 'team1') {
        setTeam1(item.id);
        
    } else {
        setTeam2(item.id);
    }
    setIsModalTeamVisible(!isModalTeamVisible)
    }

    const handleSetFixture = async () => {
        
        try {
            const fixture = {
                organizer_id:organizerID,
                tournament_id: tournament.tournament_id,
                team1_id: team1,
                team2_id: team2,
                date_on: modifyDateTime(date),
                start_time: modifyDateTime(startTime),
                stage:"",
                sports:sport,
                end_time: modifyDateTime(endTime)
            }

            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`${BASE_URL}/${sport}/createTournamentMatch`, fixture,{
                headers: {
                    'Authorization':`bearer ${authToken}`,
                    'Content-Type':'application/json'
                }
            })

            const item = response.data;
            if(item && item !== null) {
                switch (sport) {
                    case "Cricket":
                        return addCricketScoreServices({sport, dispatch, item, authToken, axiosInstance});
                    default:
                        return addFootballScoreServices({sport, dispatch, item, authToken, axiosInstance})
                }
            }
            
        } catch (err) {
            console.error("unable to set the fixture : ", err);
        } finally {
            handleCloseFixtureModal();
        }
    }

    const hideDatePicker = () => {
        setShowDatePicker(false);
    };
      
    return (
    <View style={tailwind`rounded-lg bg-white p-10  m-8`}>
        <Pressable onPress={() => setIsModalDateVisible(!isModalDateVisible)} style={tailwind`mb-2`}>
            <MaterialIcons name="date-range" size={24} color="black" />
        </Pressable>
        <View style={tailwind`flex-row mb-2 gap-2`}>
            <Pressable onPress={() => setIsModalStartTimeVisible(!isModalStartTimeVisible)} style={tailwind`rounded-lg bg-red-300 p-2`} >
                <Text> Start Time</Text>
            </Pressable>
            <Pressable onPress={() => setIsModalEndTimeVisible(!isModalEndTimeVisible)} style={tailwind`rounded-lg bg-red-300 p-2`} >
                <Text>End Time</Text>
            </Pressable>
        </View>
        <View style={tailwind`flex-row justify-between mb-2`}>
        <Pressable onPress={() => {setModalType('team1'), setIsModalTeamVisible(!isModalTeamVisible)}} style={tailwind`rounded-lg bg-red-300 p-2`}>
                <Text style={tailwind`text-center`}>Team 1</Text>
        </Pressable>
        <Text style={tailwind`text-center`}>Vs</Text>
        <Pressable onPress={() =>{setModalType('team2'), setIsModalTeamVisible(!isModalTeamVisible)}} style={tailwind`rounded-lg bg-red-300 p-2`}>
                <Text style={tailwind`text-center`}>Team 2</Text>
        </Pressable>
        </View>
        <Pressable onPress={()=>handleSetFixture()} style={tailwind`rounded-lg bg-red-300 p-2 w-20 items-center`}>
            <Text>Submit</Text>
        </Pressable>
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
                        {teams.map((item,index) => (
                            <Pressable key={index} onPress={() => handleSelectTeam(item)} style={tailwind`mt-2 p-1`}>
                                <Text style={tailwind`text-black text-lg`}>{item.club_name}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </Modal>
            )}
    </View>
    );
}

export default CreateFixtue;