import React, { useEffect, useState } from 'react';
import {View, Text, Image, StyleSheet,ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';

const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');

function Follower() {
    const axiosInstance = useAxiosInterceptor();
    const [follower, setFollower] = useState([]);

    const fetchFollower = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');
            const response = await axiosInstance.get(`http://192.168.0.101:8080/getFollower`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            })

            const item = response.data;
            if(item === null){
                return null;
            }
            console.log(item);
            setFollower(item);

        } catch (e) {
            console.error(e);
        }
    }

    //add the status of button in the follower
    //add the profile avatar image

    useEffect(() => {
        fetchFollower();
    },[])

    return (
        <ScrollView style={tailwind`bg-black`}>
            <View style={tailwind`flex-1 bg-black pl-5`}>
                {follower.map((item, i) => (
                    <View key={i} style={tailwind`bg-black flex-row items-center p-1 h-15`}>
                        <Image style={tailwind`w-10 h-10 rounded-full`} source={logoPath}  />
                        <View  style={tailwind`text-white p-1 mb-1`}>
                            <Text style={tailwind`text-white font-bold text-xl`}>{item}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    ProfileData: {
        fontSize: 16
    },
    Subcontainer: {
        width: '100%',
        height: 45,
        padding: 10,
        justifyContent: 'left',
        flexDirection: 'row',
        alignItems: 'left',
        alignContent: 'center',
        backgroundColor: 'white',
        marginBottom: '4'
      },
    UserAvatar: {
        marginRight: 10,
        width: 20,
        height: 20,
        borderRadius: 20,
        backgroundColor: 'grey',
      },
    Container: {
        flex: 1,
        justifyContent: 'left',
        alignItems: 'left',
      },
      
  });

export default Follower;