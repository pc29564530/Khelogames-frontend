import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import { BASE_URL } from '../constants/ApiConstants';
import useAxiosInterceptor from '../screen/axios_config';
import tailwind from 'twrnc';


const Members = ({clubName}) => {
    const axiosInstance = useAxiosInterceptor();
    const [member, setMember] = useState([]);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const authToken = await AsyncStorage.getItem('AcessToken');
                console.log("Club Name: ", clubName)
                const response = await axiosInstance.get(`${BASE_URL}/getClubMember/${clubName}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                console.log("Member: ", response.data)
                setMember(response.data)
            } catch(err) {
                console.error("unable to fetch all member of team/club ", err)
            }
        }
        fetchMembers();
    }, []);
    return (
        <View style={tailwind`flex-1 mt-4`}>
            {member?.map((item,index) => (
                <View key={index} style={tailwind` h-20 bg-red-300 p-2`}>
                    <Text style={tailwind`text-black text-2xl`}>{item.club_member}</Text>
                </View>
            ))}
        </View>
    );
}

export default Members;