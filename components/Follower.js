import React, { useEffect, useState } from 'react';
import {View, Text, Image, StyleSheet,ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import useAxiosInterceptor from './axios_config';

const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');

function Follower() {
    const axiosInstance = useAxiosInterceptor();
    const [follower, setFollower] = useState([]);

    const fetchFollower = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');
            const response = await axiosInstance.get(`http://192.168.0.107:8080/getFollower`, {
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

    useEffect(() => {
        fetchFollower();
    },[])

    return (
        <ScrollView>
            <View style={styles.Container}>
                {follower.map((item, i) => (
                    <View key={i} style={styles.Subcontainer}>
                        <Image style={styles.UserAvatar} source={logoPath}  />
                        <View  style={styles.ProfileData}>
                            {/* <Text>{item.name}</Text> */}
                            <Text>{item}</Text>
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