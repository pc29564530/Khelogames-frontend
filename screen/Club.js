import React, {useState, useEffect, useContext} from 'react';
import { View, Text, Pressable, ScrollView, Dimensions, Image } from 'react-native';
import { useRef } from 'react';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { setSport } from "../redux/actions/actions";
import { useDispatch, useSelector } from 'react-redux';
import { getClub } from '../redux/actions/actions';

let sports = ["Football", "Cricket", "Chess", "VolleyBall", "Hockey", "Athletics", "Car Racing"];

const createRow = (items, itemInRow) => {
    const row=[];
    for(let i=0;i<items.length; i+=itemInRow) {
        row.push(items.slice(i, i+itemInRow));
    }
    return row;
}

const Club = () => {
    const navigation = useNavigation();
    const scrollViewRef = useRef(null);
    const axiosInstance = useAxiosInterceptor();
    //const [clubs, setClubs] = useState([]);
    const [currentRole, setCurrentRole] = useState('');
    const dispatch = useDispatch();
    const sport = useSelector(state => state.sportReducers.sport);
    const clubs = useSelector((state) => state.clubReducers.clubs);


    useEffect(() => {
        dispatch(setSport("Football"));
    }, []);
    
    useEffect(() => {
        const roleStatus = async () => {
            const checkRole = await AsyncStorage.getItem('Role');
            setCurrentRole(checkRole);
        }
        roleStatus();
    }, []);

    useEffect(() => {
        const screenWith = Dimensions.get('window').width
        const itemWidth = 100;
        const itemInRow = Math.floor(screenWith/itemWidth);
        
        const getClubData = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AccessToken');
                const response = await axiosInstance.get(`${BASE_URL}/${sport}/getClubsBySport`,{
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                
                const item = response.data;
                if(!item || item === null) {
                    dispatch(getClub([]));
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
                    const allClubs = createRow(clubData,itemInRow)
                    dispatch(getClub(allClubs));
                }
            } catch (err) {
                console.error("unable to fetch all team or club: ", err);
            }
        }
        
        getClubData()
    }, [sport])

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
        navigation.navigate('ClubPage', {clubData: item, sport: sport})
    }

    const handleSport = (item) => {
        dispatch(setSport(item));
    }

    navigation.setOptions({
        headerTitle:'',
        headerLeft:()=>(
            <Pressable onPress={()=>navigation.goBack()}>
                <AntDesign name="arrowleft" size={24} color="black" style={tailwind`ml-4`} />
            </Pressable>
        ),
        headerRight: () => (
            <View>
                {currentRole === "admin" && (
                    <Pressable style={tailwind`relative p-2 bg-white items-center justify-center rounded-lg shadow-lg mr-4`} onPress={() => handleAddClub()}>
                        <MaterialIcons name="add" size={24} color="black"/>
                    </Pressable>
                )}
            </View>
        )
    })
    
    return (
        <View style={tailwind`flex-1 `}>
            <View style={tailwind`flex-row mt-5`}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    ref={scrollViewRef}
                    contentContainerStyle={tailwind`flex-row flex-wrap justify-center`}
                >
                    {sports.map((item, index) => (
                        <Pressable key={index} style={tailwind`border rounded-md bg-orange-200 p-1.5 mr-2 ml-2`} onPress={() => handleSport(item)}>
                            <Text style={tailwind`text-black`}>{item}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
                <Pressable onPress={scrollRight} style={tailwind`justify-center ml-2`}>
                    <MaterialIcons name="keyboard-arrow-right" size={30} color="black" />
                </Pressable>
            </View>
            <ScrollView 
                contentContainerStyle={{justifyContent:'center'}}
                style={tailwind`p-4 gap-2`}>
                {clubs.map((clubRow, index) => (
                        <View key={index} style={tailwind`flex-row gap-4`}>
                            {Array.isArray(clubRow) ? (clubRow?.map((item, subIndex) => (
                                <Pressable key={subIndex} style={tailwind` relative border rounded-lg h-24 w-24 items-center justify-center mb-2 shadow-md`} onPress={() => handleClub(item)}>
                                    {item.avatar_url ? (
                                        <Image source={{ uri: item.avatar_url }} style={tailwind`h-20 w-20 rounded-full`} />
                                    ) : (
                                        <Text style={tailwind`text-black text-3xl font-bold`}>{item.club_name.charAt(0).toUpperCase()}</Text>
                                    )}
                                    <Text style={tailwind`text-sm text-center mt-2`}>{item.club_name}</Text>
                                </Pressable>
                            ))):(
                                <Pressable style={tailwind` relative border rounded-lg h-24 w-24 items-center justify-center mb-2 shadow-md`} onPress={() => handleClub(clubRow)}>
                                    {clubRow.avatar_url ? (
                                        <Image source={{ uri: clubRow.avatar_url }} style={tailwind`h-20 w-20 rounded-full`} />
                                    ) : (
                                        <Text style={tailwind`text-black text-3xl font-bold`}>{clubRow.club_name.charAt(0).toUpperCase()}</Text>
                                    )}
                                    <Text style={tailwind`text-sm text-center mt-2`}>{clubRow.club_name}</Text>
                                </Pressable>
                            )}
                        </View>
                    ))}
            </ScrollView>
        </View>
    );
}

export default Club;
