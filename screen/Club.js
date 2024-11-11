import React, {useState, useEffect} from 'react';
import { View, Text, Pressable, ScrollView, Dimensions, Image } from 'react-native';
import { useRef } from 'react';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
import { BASE_URL } from '../constants/ApiConstants';
import { useDispatch, useSelector } from 'react-redux';
import { getClub, setGames, setGame } from '../redux/actions/actions';
import { sportsServices } from '../services/sportsServices';


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
    const [currentRole, setCurrentRole] = useState('');
    const [selectedSport, setSelectedSport] = useState("football");
    const dispatch = useDispatch();
    const games = useSelector(state => state.sportReducers.games);
    const game = useSelector(state => state.sportReducers.game);
    const clubs = useSelector((state) => state.clubReducers.clubs);

    useEffect(() => {
        const defaultSport = { id: 1, name: 'football', min_players: 11};
        dispatch(setGame(defaultSport));
    }, []);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await sportsServices({axiosInstance});
                dispatch(setGames(data));
            } catch (error) {
                console.error("unable to fetch games data: ", error)
            }
        };
        fetchData();
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
                const response = await axiosInstance.get(`${BASE_URL}/${game.name}/getTeamsBySport/${game.id}`,{
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                
                const item = response.data;
                console.log("team: ", item.teams)
                if(!item || item === null) {
                    dispatch(getClub([]));
                } else {
                    dispatch(getClub(item.teams))
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
        navigation.navigate('CreateClub', {games: games});
    }

    const scrollRight = () => {
        scrollViewRef.current.scrollTo({x:100, animated:true})
    }

    const handleClub = (item) => {
        navigation.navigate('ClubPage', {teamData: item, game: game})
    }

    const handleSport = (item) => {
        setSelectedSport(item.name)
        dispatch(setGame(item));
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
                {/* {currentRole === "admin" && ( */}
                    <Pressable style={tailwind`relative p-2 bg-white items-center justify-center rounded-lg shadow-lg mr-4`} onPress={() => handleAddClub()}>
                        <MaterialIcons name="add" size={24} color="black"/>
                    </Pressable>
                {/* )} */}
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
                    {games?.map((item, index) => (
                        <Pressable key={index} style={[tailwind`border rounded-md p-1.5 mr-2 ml-2`, selectedSport===item.name?tailwind`bg-orange-400`:tailwind`bg-orange-200`]} onPress={() => handleSport(item)}>
                            <Text style={tailwind`text-black`}>{item.name}</Text>
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
                                    {item.media_url ? (
                                        <Image source={{ uri: item.media_url }} style={tailwind`h-20 w-20 rounded-full`} />
                                    ) : (
                                        <Text style={tailwind`text-black text-3xl font-bold`}>{item.name.charAt(0).toUpperCase()}</Text>
                                    )}
                                    <Text style={tailwind`text-sm text-center mt-2`}>{item.name}</Text>
                                </Pressable>
                            ))):(
                                <Pressable style={tailwind` relative border rounded-lg h-24 w-24 items-center justify-center mb-2 shadow-md`} onPress={() => handleClub(clubRow)}>
                                    {clubRow.media_url ? (
                                        <Image source={{ uri: clubRow.media_url }} style={tailwind`h-20 w-20 rounded-full`} />
                                    ) : (
                                        <Text style={tailwind`text-black text-3xl font-bold`}>{clubRow.name.charAt(0).toUpperCase()}</Text>
                                    )}
                                    <Text style={tailwind`text-sm text-center mt-2`}>{clubRow.name}</Text>
                                </Pressable>
                            )}
                        </View>
                ))}
            </ScrollView>
        </View>
    );
}

export default Club;
