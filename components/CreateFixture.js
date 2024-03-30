import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, Text, Pressable, Modal} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import tailwind from 'twrnc';
import DateTimePicker from '@react-native-community/datetimepicker'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CreateFixtue = ({tournament, teams, organizerID}) => {
    const [admin, setAdmin] = useState('');
    const [team1, setTeam1] = useState(null);
    const [team2, setTeam2] = useState(null);
    const [date,setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [isModalTeamVisible, setIsModalTeamVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [modalType, setModalType] = useState('')
    const axiosInstance = useAxiosInterceptor()

    const showDate = () => {
        setShowDatePicker(true);
    }

    const showTime = () => {
        setShowTimePicker(true);
    }

    const handleDateChange = (event, selectedDate) => {

        const currentDate = selectedDate || date;
        setDate(currentDate)
        setShowDatePicker(false)
    }

    const handleTimeChange = (event, selectedTime) => {
        if (selectedTime !== undefined) {
          const hours = selectedTime.getHours();
          const minutes = selectedTime.getMinutes();
          const newDate = new Date(date);
          newDate.setHours(hours);
          newDate.setMinutes(minutes);
          const timeZoneOffSet = newDate.getTimezoneOffset();
          newDate.setMinutes(newDate.getMinutes()-timeZoneOffSet);
          setTime(newDate);
          setShowTimePicker(false)
          setShowDatePicker(false)
        }
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
                console.log("tournamentSport : ", tournament.sport_type)
                const fixture = {
                    organizer_id:organizerID,
                    tournament_id: tournament.tournament_id,
                    team1_id: team1,
                    team2_id: team2,
                    date_on: date,
                    start_at: time,
                    stage:'',
                    sports:tournament.sport_type
                }

                console.log("Fixture: ", fixture)
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.post(`${BASE_URL}/createTournamentMatch`, fixture,{
                    headers: {
                        'Authorization':`bearer ${authToken}`,
                        'Content-Type':'application/json'
                    }
                })
            } catch (err) {
                console.error("unable to set the fixture : ", err);
            }
      }

      return (
        <View style={tailwind`rounded-lg bg-white p-10  m-8`}>
            <Pressable onPress={showDate} style={tailwind`mb-2`}>
                <MaterialIcons name="date-range" size={24} color="black" />
            </Pressable>
            <Pressable onPress={showTime} style={tailwind`mb-2`}>
                <MaterialIcons name="access-time" size={24} color="black" />
            </Pressable>
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
            {showDatePicker && (
                <DateTimePicker 
                    testID='dateTimePicker'
                    value={date}
                    mode='date'
                    is24Hour={true}
                    display='default'
                    onChange={handleDateChange}
                />
            )}
            {showTimePicker && (
                <DateTimePicker 
                    testID="timePicker"
                    value={time}
                    mode="time"
                    is24Hour={true}
                    display='default'
                    onChange={handleTimeChange}
                />
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