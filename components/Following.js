import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Image, ScrollView} from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useSelector,useDispatch} from 'react-redux';
import {logout,setAuthenticated, setFollowUser, setUnFollowUser, getFollowingUser} from '../redux/actions/actions';

function Following() {
    const dispatch = useDispatch()
    const following = useSelector(state => state.user.following)

    const fetchFollowing = async () => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axios.get('http://192.168.0.105:8080/getFollowing', {
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
        <ScrollView>
             <View style={styles.Container}>
                {following.map((item, i) => (
                    <View key={i} style={styles.Subcontainer}>
                        <Image style={styles.UserAvatar} source={require('/home/pawan/projects/Khelogames-frontend/assets/images/Khelogames.png')}  />
                        <View  style={styles.ProfileData}>
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

    },
    Subcontainer: {
        width: '100%',
        height: 50,
        padding: 20,
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