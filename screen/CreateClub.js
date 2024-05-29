import { useNavigation } from '@react-navigation/native';
import React, {useState} from 'react';
import {View, Text, Pressable, TextInput, FlatList} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import tailwind from 'twrnc';
import useAxiosInterceptor from './axios_config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConstants';
import { SelectMedia } from '../services/SelectMedia';

const CreateClub = ({route}) => {
    const sports = route.params.sports;
    const navigation = useNavigation();
    const [clubName, setClubName] = useState('');
    const [sport, setSport] = useState('');
    const [avatarURL, setAvatarURL] = useState('');
    const axiosInstance = useAxiosInterceptor();

    const handleMediaSelection = async () => {
        const {mediaURL, mediaType} = await SelectMedia();
        setAvatarURL(mediaURL);
    }

    const handleSubmit = async () => {
        try {
            const user = await AsyncStorage.getItem('User')
            const club = {
                club_name: clubName,
                avatar_url: avatarURL,
                sport: sport
            }
            const authToken = await AsyncStorage.getItem('AccessToken');
            
            const response = await axiosInstance.post(`${BASE_URL}/createClub`, club, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
        } catch (err) {
            console.error("unable to create the club ", err);
        }
    }

    navigation.setOptions({
        headerTitle:'',
        headerRight:() => (
            <View style={tailwind`flex-row items-center justify-center ml-12`}>
                <Pressable style={tailwind`mr-2`} onPress={handleSubmit}>
                    <FontAwesome name="send" size={24} color="black" />
                </Pressable>
            </View>
        )
    })

    const handleSelectSport = (item) => {
        setSport(item);
    }

    return(
        <View style={tailwind`flex-1 mt-4`}>
            <View style={tailwind``}>
                <View style={tailwind`m-2`}>
                    <View style={tailwind`border rounded-md bg-gray-200 w-20 h-20 items-center justify-center`}>
                        <Text style={tailwind`text-black text-lg`}>Upload Image</Text>
                    </View>
                    <Pressable onPress={() => handleMediaSelection()} style={tailwind`border rounded-full w-8 h-8 bg-blue-400 items-center justify-center -mt-6 ml-15`}>
                        <FontAwesome name="upload" size={20} color="black" />
                    </Pressable>
                </View>
                <View style={tailwind`mb-5`}>
                    <TextInput
                        style={tailwind` p-3 mb-10 font-bold text-lg h-24 text-black`}
                        multiline 
                        value={clubName} 
                        onChangeText={setClubName} 
                        placeholder="Name your team or club.."
                        placeholderTextColor="black"
                    />
                </View>
                <View style={tailwind``}>
                    <View>
                        <Text>Select sport for </Text>
                    </View>
                    <View style={tailwind`w-100`}>
                        {sports.map((item,index) => (
                            <Pressable key={index} style={[tailwind`border rounded-md bg-orange-200 p-1.5 mr-2 items.center justify-center`, {width:item.length*11}]} onPress={() => handleSelectSport(item)}>
                                <Text style={tailwind`text-black`}>{item}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </View>

        </View>
    );
}

export default CreateClub;