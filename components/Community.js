import React, {useState, useEffect} from 'react';
import {Pressable, View, Text, Image, Input, TextInput, Button, StyleSheet, Touchable, ScrollView, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import useAxiosInterceptor from './axios_config';
const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');
import ModalDropdown from 'react-native-modal-dropdown';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import CreateCommunity from './CreateCommunity';
import Header from './Header'
const mainCommunities = ["Football", "Chess", "VolleyBall", "Hockey"];


function Community () {

    const [data, setData] = useState([]);
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();
    const [createCommunityScreen, setCreateCommunityScreen] = useState(false);

    const fetchData = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');
            console.log(user);
            const response = await axiosInstance.get(`http://192.168.0.103:8080/get_all_communities/${user}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            })
            const item = await response.data;
            if(item == null) {
                setData([]);
            } else {
                setData(item);
            }
            console.log(item);
        } catch (err) {
            console.error(err);
        }
        
    }
    useEffect(() => {
        // if(data.length > 0) {
            fetchData();
        // }
    },[]);

    //community list by community type 

    return (
      <>
         
        <ScrollView  style={tailwind`flex-1 bg-black`}>
          {createCommunityScreen ? (
            <CreateCommunity />
          ):(
            <>
            <View style={tailwind`mt-1 mb-5 bg-gray-800 rounded-md h-70`}>
                <View style={tailwind`m-5`}>
                    <Text style={tailwind`text-xl text-white`} >Create a New Community</Text>
                    <Text style={tailwind`mb-5 text-white`}>This is place where a people with similar field area connect with each other.</Text>
                </View>
                <Pressable onPress={() => {navigation.navigate('CreateCommunity')}} style={tailwind` bg-blue-500 h-10 items-center ml-10 mr-10 rounded-md pt-2`}>
                  <Text style={tailwind`font-bold text-white`}>Getting Start</Text> 
                </Pressable>
            </View>
            <View style={tailwind`w-full  rounded-md`}>
                {data.map((item,i) => (
                    <View style={tailwind`flex-row bg-gray-800 mb-1 p-1 rounded-md h-20`} key={i}>
                        <Image style={tailwind`w-10 h-10 rounded-md bg-red-500 p-8`} source={logoPath} />
                        <View style={tailwind`w-4/5 pl-3`}>
                            <Text style={tailwind`font-bold text-base text-white`}>{item.communities_name}</Text>
                            <Text style={tailwind`text-base text-white`}>{item.description}</Text>
                            <Text style={tailwind`text-base`}>{item.community_type}</Text>
                        </View>
                    </View>
                ))}
            </View>
            </>
          )}
            
        </ScrollView>
      </>
    );
}

export default Community;