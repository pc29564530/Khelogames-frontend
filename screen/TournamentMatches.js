import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, Text, Pressable, Modal} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
import DateTimePicker from '@react-native-community/datetimepicker'
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const TournamentMatches = ({route}) => {
    const tournament = route.params.tournament
    console.log("Tournament Matches: ", tournament)
    const [tournamentOrganizer, setTournamentOrganizer] = useState([]);
    const [date, setDate] = useState(new Date());
    const [team1, setTeam1] = useState(null);
    const [team2, setTeam2] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [time, setTime] = useState(new Date)
    const axiosInstance = useAxiosInterceptor();
    const [teams, setTeams] = useState([]);
    const [admin, setAdmin] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');
    const [currentUser, setCurrentUser] = useState('');
    const [organizerID, setOrganizerID] = useState(null);
    const [allMatchs, setAllMatchs] = useState([]);
    const [tournamentTeamData, setTournamentTeamData] = useState([]);

    useEffect(() => {
    const fetchTournamentOrganizer = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken')
                const user = await AsyncStorage.getItem('User')
                const response = await axiosInstance.get(`${BASE_URL}/getOrganizer/${tournament.tournament_id}`,null, {
                    headers: {
                        'Authorization':`bearer ${authToken}`,
                        'Content-Type':'application/json'
                    }
                })
                console.log("response: ", response.data)
                const item = response.data;
                const orgazinerName = item.map((item) => item.organizer_name);
                const isAdmin = orgazinerName.includes(currentUser)
                setAdmin(isAdmin);
                setCurrentUser(user);
                console.log("Organizer; ", item)
                
                if(isAdmin) {
                    console.log("is IUteL ",item)
                    item.map((it) => {
                        if(it.organizer_name === currentUser) {
                            setOrganizerID(it.organizer_id);
                        }
                    })
                }
                

            } catch (err) {
                console.log("unable to fetch the organizer: ", err)
            }
        }
        fetchTournamentOrganizer();
    }, []);

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
    // console.log("Date: ", date)
    console.log("Date: ", date)
    console.log("Time: ", time)

    const fetchTournamentMatchs = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken')
            const response = await axiosInstance.get(`${BASE_URL}/getAllTournamentMatch`, {
                headers: {
                    'Authorization':`bearer ${authToken}`,
                    'Content-Type':'application/json'
                }
            })
            console.log("response: hj : ", response.data)
            const item = response.data;
            const allMatchData = item.map( async (item) => {
                try {
                    const authToken = await AsyncStorage.getItem('AccessToken');
                    const response1 = await axiosInstance.get(`${BASE_URL}/getClub/${item.team1_id}`, null, {
                        headers: {
                            'Authorization':`bearer ${authToken}`,
                            'Content-Type':'application/json'
                        }
                    })

                    const response2 = await axiosInstance.get(`${BASE_URL}/getClub/${item.team2_id}`, null, {
                        headers: {
                            'Authorization':`bearer ${authToken}`,
                            'Content-Type':'application/json'
                        }
                    })
                    
                    console.log("response1: ", response1.data)
                    console.log("response2: ", response2.data)

                    return {...item, team1_name:response1.data.club_name, team2_name: response2.data.club_name}
                    
                    // setTeams(response.data);
                } catch (err) {
                    console.error("unable to select the team or club name: ", err);
                }


                

            })
            const data = await Promise.all(allMatchData)
            console.log("Data: ", data)
            setTournamentTeamData(data)
           console.log("All Match: ", item)
            

        } catch (err) {
            console.log("unable to fetch the organizer: ", err)
        }
    }

      useEffect(() => {
        const fetchTournamentTeams = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/getTeams/${tournament.tournament_id}`, null, {
                    headers: {
                        'Authorization':`bearer ${authToken}`,
                        'Content-Type':'application/json'
                    }
                })
                console.log("teams: ", response.data)
                
                setTeams(response.data);
            } catch (err) {
                console.error("unable to select the team or club name: ", err);
            }
        }
        fetchTournamentTeams()
        fetchTournamentMatchs()
      }, []);

      const handleSelectTeam = (item) => {
        console.log("Item: Team: ", item)
        if(modalType === 'team1') {
            setTeam1(item.id);
            
        } else {
            setTeam2(item.id);
        }
        setIsModalVisible(!isModalVisible)
      }

      const handleSetFixture = async () => {
            try {
                const fixture = {
                    organizer_id:organizerID,
                    tournament_id: tournament.tournament_id,
                    team1_id: team1,
                    team2_id: team2,
                    date_on: date,
                    start_at: time,
                    stage:''
                }
                console.log("Fixture: ", fixture)
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.post(`${BASE_URL}/createTournamentMatch`, fixture,{
                    headers: {
                        'Authorization':`bearer ${authToken}`,
                        'Content-Type':'application/json'
                    }
                })
                console.log(response.data)
            } catch (err) {
                console.error("unable to set the fixture : ", err);
            }
      }

      console.log("modal: ", isModalVisible)
    return (
        <View style={tailwind`flex-1 mt-1 items-center justify-center`}>
           {admin && (
            <View style={tailwind`rounded-lg shadow-lg bg-orange-200 p-4 mb-4 w-80`}>
                
               <Pressable onPress={showDate} style={tailwind`mb-2`}>
                    <MaterialIcons name="date-range" size={24} color="black" />
               </Pressable>
               <Pressable onPress={showTime} style={tailwind`mb-2`}>
                    <MaterialIcons name="access-time" size={24} color="black" />
               </Pressable>
               <View style={tailwind`flex-row justify-between mb-2`}>
                <Pressable onPress={() => {setModalType('team1'), setIsModalVisible(!isModalVisible)}}>
                        <Text style={tailwind`text-center`}>Team 1</Text>
                </Pressable>
                <Text style={tailwind`text-center`}>Vs</Text>
                <Pressable onPress={() =>{setModalType('team2'), setIsModalVisible(!isModalVisible)}}>
                        <Text style={tailwind`text-center`}>Team 2</Text>
                </Pressable>
               </View>
               <Pressable onPress={()=>handleSetFixture()}>
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
               {isModalVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isModalVisible}
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
           )}
            <View >
                {tournamentTeamData.map((item,index) => (
                    <Pressable key={index} style={tailwind`mt-4 rounded-lg bg-purple-300  p-4 flex-row items-center justify-evenly`}>
                        <Text style={tailwind`text-xl`}>{item.team1_name}</Text>
                        <Text style={tailwind`text-xl`}>vs</Text>
                        <Text style={tailwind`text-xl`}>{item.team2_name}</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

export default TournamentMatches;