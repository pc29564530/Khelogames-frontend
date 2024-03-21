import React, {useState, useEffect} from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useRef } from 'react';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import CreateClub from './CreateClub';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';

let sports = ["Football", "Cricket", "Chess", "VolleyBall", "Hockey", "Athletics", "Car Racing"];

const Club = () => {
    const navigation = useNavigation();
    const scrollViewRef = useRef(null);
    const axiosInstance = useAxiosInterceptor();
    const [clubs, setClubs] = useState([]);

    useEffect(() => {
        const getClubData = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/getClubs`,{
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                
                const item = response.data;
                if(!item || item === null) {
                    setClubs([]);
                } else {
                    const clubWithDisplayText = item.map((item,index) => {
                        let displayText = '';
                        if(!item.avatar_url || item.avatar_url === null) {
                            const usernameInitial = item.club_name ? item.club_name.charAt(0) : '';
                            displayText = usernameInitial.toUpperCase();
                        }
    
                        return {...item, displayText: displayText}
                    });
                    const clubData = await Promise.all(clubWithDisplayText)
                    console.log("ClubData: ", clubData)
                    setClubs(clubData);
                }
            } catch (err) {
                console.error("unable to fetch all team or club: ", err);
            }
        }
        
        getClubData()
    }, [])

    navigation.setOptions({
        headerTitle:'Club'
    });

    const handleAddClub = () => {
        navigation.navigate('CreateClub', {sports: sports});
    }

    const scrollRight = () => {
        scrollViewRef.current.scrollTo({x:100, animated:true})
    }

    const handleClub = (item) => {
        navigation.navigate('ClubPage', {item: item})
    }
    
    return (
        <View style={tailwind`flex-1 `}>
            <View style={tailwind`flex-row mt-5`}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    ref={scrollViewRef}
                    contentContainerStyle={tailwind`flex-row justify-between ml-2 mr-2`}
                >
                    {sports.map((item, index) => (
                        <View key={index} style={tailwind`border rounded-md bg-orange-200 p-1.5 mr-2`}>
                            <Text style={tailwind`text-black`}>{item}</Text>
                        </View>
                    ))}
                </ScrollView>
                <Pressable onPress={scrollRight} style={tailwind`justify-center ml-2`}>
                    <MaterialIcons name="keyboard-arrow-right" size={30} color="black" />
                </Pressable>
            </View>
            <View style={tailwind`mt-5`}>
                <Pressable style={tailwind`flex-row border rounded-md w-25 items-center justify-center ml-4`}>
                        <Text style={tailwind`text-lg`}>Filter</Text>
                        <MaterialIcons name="keyboard-arrow-down" size={30} color="black" />
                </Pressable>
            </View>
            <View style={tailwind`p-4 relative gap-4`}>
                <View>
                    {clubs.map((item,index) => (
                        <>
                            <Pressable key={index} style={tailwind`border rounded-md h-20 w-20 items-center justify-center`} onPress={()=> handleClub(item)}>
                                <Text style={tailwind`text-black text-5xl items-center justify-center`}>{item.displayText}</Text>
                            </Pressable>
                            <View style={tailwind``}>
                                <Text style={tailwind`text-lg text-black`}>{item.club_name}</Text>
                            </View>
                        </>
                    ))}
                </View>
            </View>
            <Pressable onPress={handleAddClub} style={tailwind`absolute bottom-5 right-5 p-4 border rounded-full w-20 h-20 bg-white items-center justify-center`}>
                <MaterialIcons name="add" size={40} color="black"/>
            </Pressable>
        </View>

    );
}

export default Club;
