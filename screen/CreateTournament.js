import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Modal } from 'react-native';
import tailwind from 'twrnc';
import FontAwesome from 'react-native-vector-icons/FontAwesome'; 
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from './axios_config';
import { useNavigation } from '@react-navigation/native';

const CreateTournament = () => {
    const [tournamentName, setTournamentName] = useState('');
    const [isFormatVisible, setIsFormatVisible] = useState(false);
    const [isSportVisible, setIsSportVisible] = useState(false);
    const [tournament, setTournament] = useState([]);
    const [format, setFormat] = useState('');
    const [sport, setSport] = useState('');
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();
    const formats = ['knockout', 'league', 'league+knockout', 'gourps+knockout', 'custom'];
    const sports = ['Football', 'Basketball', 'Tennis', 'Cricket', 'Volleyball'];

    const handleFormatModal = () => {
        setIsFormatVisible(!isFormatVisible);
    }

    const handleSportModal = () => {
        setIsSportVisible(!isSportVisible);
    }

    const handleFormatSelection = (selectedFormat) => {
        setFormat(selectedFormat);
        setIsFormatVisible(false);
    }

    const handleSportSelection = (selectedSport) => {
        setSport(selectedSport);
        setIsSportVisible(false);
    }

     const handleCreatedTournament = async () => {
        try {
            const data = {
                tournament_name: tournamentName,
                sport_type: sport,
                format: format,
                teams_joined: 0
            }
            console.log("Tournament: ", data)

            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');
            const response = await axiosInstance.post(`${BASE_URL}/createTournament`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const item = response.data;
            setTournament(item)
            const organizerData = {
                organizer_name:user,
                tournament_id: item.tournament_id
            }
            const responseData = await axiosInstance.post(`${BASE_URL}/createOrganizer`, organizerData,{
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            navigation.navigate("TournamentDesciption", {tournament_id: item.tournament_id});

        } catch (err) {
            console.log("unable to create a new tournament ", err);
        }
     }

    return (
        <View style={tailwind`flex-1`}>
            <View style={tailwind`border rounded-md h-60 w-full`}>
                <Pressable style={tailwind`flex-1 justify-center items-center`} onPress={() => {}}>
                    <View style={tailwind`items-center justify-center`}>
                        <Text>Tournament Banner</Text>
                        <Text>Add the banner</Text>
                        <FontAwesome name="upload" size={24} color="black" />
                    </View>
                    <View style={tailwind`absolute bottom-0 left-0 m-2`}>
                        <Pressable style={tailwind`items-start py-5 px-5 border rounded-full`} onPress={() => {}}>
                            <EvilIcons name="trophy" size={20} color="black" />
                            <Text>Logo</Text> 
                        </Pressable>
                    </View>
                </Pressable>
            </View>
            <View style={tailwind`mt-2`}>
                <TextInput 
                    value={tournamentName} 
                    onChangeText={setTournamentName} 
                    placeholder="Tournament Name.." 
                    placeholderTextColor="black" 
                    style={tailwind`text-2xl`}
                />
            </View>
            <View style={tailwind`absolute bottom-0 w-full bg-white p-2 items-end flex-row justify-between`}>
                <View style={tailwind`flex-row gap-5`}>
                    {/* Icon for selecting sport type */}
                    <Pressable style={tailwind`items-center`} onPress={handleSportModal}>
                        <MaterialIcons name="sports" size={24} color="black"/>
                        <Text>Sport Type</Text>
                    </Pressable>
                    {/* Icon for selecting format */}
                    <Pressable style={tailwind`items-center`} onPress={handleFormatModal}>
                        <AntDesign name="filetext1" size={24} color="black"/>
                        <Text>Format</Text>
                    </Pressable>
                </View>
                {/* Submit button */}
                <Pressable style={tailwind`border rounded-md`} onPress={handleCreatedTournament}>
                    <Text style={tailwind`text-lg p-1 bg-pink-300`}>Next</Text>
                </Pressable>
            </View>
            {/* Format selection modal */}
            <Modal
                transparent={true}
                animationType="slide"
                visible={isFormatVisible}
                onRequestClose={handleFormatModal}
            >
                <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                    <View style={tailwind`bg-white rounded-md p-4`}>
                        {formats.map((item, index) => (
                            <Pressable key={index} onPress={() => handleFormatSelection(item)}>
                                <Text style={tailwind`text-xl py-2`}>{item}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </Modal>
            {/* Sport type selection modal */}
            <Modal
                transparent={true}
                animationType="slide"
                visible={isSportVisible}
                onRequestClose={handleSportModal}
            >
                <View style={tailwind`flex-1 justify-end bg-black bg-opacity-50`}>
                    <View style={tailwind`bg-white rounded-md p-4`}>
                        {sports.map((item, index) => (
                            <Pressable key={index} onPress={() => handleSportSelection(item)}>
                                <Text style={tailwind`text-xl py-2`}>{item}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

export default CreateTournament;
