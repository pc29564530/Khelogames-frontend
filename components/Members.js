import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Image} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';


const Members = ({clubName}) => {
    const axiosInstance = useAxiosInterceptor();
    const [member, setMember] = useState([]);
    const navigation = useNavigation();
    console.log("Member ClubName: ", clubName)
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AcessToken');
                const response = await axiosInstance.get(`${BASE_URL}/getClubMember/${clubName}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                
                const responseWithProfile = await response.data.map( async (item, index) => {
                    try {
                        if(item && item !== null) {
                            const profileData = await axiosInstance.get(`${BASE_URL}/getProfile/${item.club_member}`);
                            let displayText = '';
                            if (!profileData.data.avatar_url || profileData.data.avatar_url === '') {
                                const usernameInitial = profileData.data.owner ? profileData.data.owner.charAt(0) : '';
                                displayText = usernameInitial.toUpperCase();
                            }
                            

                            return {...item, profile: profileData.data, displayText}
                        }
                    } catch (err) {
                        console.error("unable to get the profile of user ", err)
                    }
                })
                
                
                const clubMemberWithProfile = await Promise.all(responseWithProfile);
                setMember(clubMemberWithProfile)
            } catch(err) {
                console.error("unable to fetch all member of team/club ", err)
            }
        }
        fetchMembers();
    }, []);

    const handleProfile = (username) => {
        navigation.navigate('Profile', {username:username} )
    }

    return (
        <View style={tailwind`flex-1 mt-4`}>
            {member?.map((item,index) => (
                 <Pressable key={index} style={tailwind`  p-1 h-15 mt-1`} onPress={() => handleProfile({username: item.profile?.owner})}>
                        <View style={tailwind`flex-row items-center`}>
                            {!item.profile && !item.profile?.avatar_url ?(
                                <View style={tailwind`w-12 h-12 rounded-12 bg-white items-center justify-center`}>
                                    <Text style={tailwind`text-red-500 text-6x3`}>
                                        {item.displayText}
                                    </Text>
                                </View>
                            ) : (
                                <Image style={tailwind`w-10 h-10 rounded-full bg-yellow-500`} source={{uri: item.profile.avatar_url}}  />
                            )}
                            <View  style={tailwind`text-black p-2 mb-1`}>
                                <Text style={tailwind`text-black font-bold text-xl `}>{item.profile?.full_name}</Text>
                            </View>
                        </View>
                        <View style={tailwind`border-b border-white mt-2`}></View>
                </Pressable>
            ))}
        </View>
    );
}

export default Members;