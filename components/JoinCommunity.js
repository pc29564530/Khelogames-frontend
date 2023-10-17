import React, { useState } from 'react';
import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import useAxiosInterceptor from './axios_config';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mainCommunities = ["Football", "Chess", "VolleyBall", "Hockey"];

function JoinCommunity() {
    const axiosInstance = useAxiosInterceptor();
    const navigation = useNavigation();
    
    const handleCommunity = async (item) => {
        try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            console.log('CommunityName: ', item)
            const response = await axiosInstance.post(`http://192.168.0.107:8080/joinUserCommunity/${item}`, null, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });
            console.log(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNextScreen = () => {
        navigation.navigate('Main');
    };

    return (
        <View style={styles.Container}>
            <View style={styles.HeaderContainer}>
                <Text style={styles.HeaderText} >Join Community</Text>
            </View>
            <ScrollView style={styles.SubContainer} >
                {mainCommunities.map((item, index) => (
                    <View key={index} style={styles.SingleContent}>
                        <View style={styles.ContentText}>
                            <Text style={styles.Text}>{item}</Text>
                        </View>
                        <View style={styles.ContentButton}>
                            <Pressable style={styles.JoinButton} onPress={() => handleCommunity(item)}>
                                <Text style={styles.JoinText}>Join</Text>
                            </Pressable>
                        </View>
                    </View>
                ))}
            </ScrollView>
            <View style={styles.NextButton } >
                <Pressable style={styles.JoinButton} onPress={() => handleNextScreen()}>
                    <Text style={styles.JoinText} >Next</Text>
                </Pressable>
            </View>
            
        </View>
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: 'lightgrey'
    },
    HeaderContainer: {
        height: 60,
        padding: 20,
        alignContent: 'center',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: 'grey'
    },
    HeaderText: {
        fontSize: 16,
        textAlign: 'center'
    },
    SubContainer: {
        padding: 10,
        margin:5,
        backgroundColor: 'white'
    },
    SingleContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        height: 60,
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
    },
    ContentText: {
        padding:10,
        justifyContent: 'flex-start',
    },
    ContentButton: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    JoinButton: {
        backgroundColor: 'lightblue',
        padding: 5,
        width: 60,
        alignItems: 'center'
    },
    JoinText: {
        color: 'white'
    },
    NextButton: {
        backgroundColor: 'white',
        padding: 10,
        width: '100%',
        alignItems: 'center'
    },
    NextText: {
        fontSize: 18,
        color: 'white'
    },
    Text: {
        fontSize: 16,
    }
});

export default JoinCommunity;
