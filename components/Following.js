import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Image, ScrollView} from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useSelector,useDispatch} from 'react-redux';
import {logout,setAuthenticated, setFollowUser, setUnFollowUser, getFollowingUser} from '../redux/actions/actions';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';

const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');

function Following() {
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch()
    const following = useSelector(state => state.user.following)

    const fetchFollowing = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get('http://192.168.0.101:8080/getFollowing', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            })
            const item = response.data;
            if(item === null) {
               dispatch(getFollowingUser([]));
            } else {
                dispatch(getFollowingUser(item));
            }
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        fetchFollowing();
    }, []);
    return (
        <ScrollView style={tailwind`bg-black`}>
             <View style={tailwind`flex-1 pl-5`}>
                {following.map((item, i) => (
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
        flex:1,
        width: '100%',
        height: 45,
        padding: 10,
        justifyContent: 'left',
        flexDirection: 'row',
        alignItems: 'left',
        alignContent: 'center',
        backgroundColor: 'white',
        marginBottom: 4
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

export default Following;