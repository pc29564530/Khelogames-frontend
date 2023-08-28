import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Image, ScrollView} from 'react-native';
// import {FollowingData} from '../data/following';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import axios from 'axios';

function Following() {
    const [following, setFollowing] = useState([]);

    const fetchFollowing = async () => {

        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axios.get('http://localhost:8080/getFollowing', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            })
            const item = response.data;
            console.log(item);
            setFollowing(item);
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        fetchFollowing();
    }, []);
    return (
        <ScrollView>
             <View style={styles.container}>
                {following.map((item, i) => (
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
        flexDirection:'row',
        justifyContent: 'left',
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

export default Following;