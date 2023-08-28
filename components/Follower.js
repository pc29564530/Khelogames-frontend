import React, { useEffect, useState } from 'react';
import {View, Text, Image, StyleSheet,ScrollView } from 'react-native';
import {FollowerData} from '../data/follwer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';




function Follower() {

    const [follower, setFollower] = useState([]);

    const fetchFollower = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const user = await AsyncStorage.getItem('User');
            const response = await axios.get(`http://localhost:8080/getFollower`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            })

            const item = response.data;
            console.log(item);
            setFollower(item);

        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        fetchFollower();
    },[])

    // console.log("follower are created")
    // console.log(FollowerData)
    return (
        <ScrollView>
            <View style={styles.container}>
                {follower.map((item, i) => (
                    <View key={i} style={styles.subcontainer}>
                        <Image style={styles.userAvatar} source={'/home/pawan'}  />
                        <View  style={styles.profileData}>
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
    subcontainer: {
        margin: 20,
        justifyContent: 'left',
        flexDirection: 'row',
        alignItems: 'left',
      },
    userAvatar: {
        width: 20,
        height: 20,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: 'grey',
      },
    container: {
        paddingTop: '10px',
        flex: 1,
        justifyContent: 'left',
        alignItems: 'left',
      },
      
  });

export default Follower;