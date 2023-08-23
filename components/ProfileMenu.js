import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Modal, StyleSheet, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';


function ProfileMenu({logout}) {
    const handleLogout =  () => {
        try {
            // await AsyncStorage.removeItem('AccessToken');
            // await AsyncStorage.removeItem('RefreshToken');
            // // const authToken = await AsyncStorage.getItem('AccessToken');
            // // if(authToken){
            // //  navigation.navigate('SignIn');
            // // }
            console.log("alble to log out");
            console.log(logout)
            logout();
            
        } catch (err) {
            console.log('Failed to logout', err);
        }
    }
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity onPress={() => handleLogout()} style={styles.logoutButton}>
                <Text style={styles.logout}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      color: 'grey',
      fontWeight: '500',
      marginTop: 30,
    },
    logout: {
      fontSize: 15,
      color: 'white',
      fontWeight: '500',
    },
    logoutButton: {
      backgroundColor: 'grey',
      padding: 12,
      borderRadius: 20,
      width: '90%',
      alignItems: 'center',
      marginBottom: 30,
    },
  });
  

export default ProfileMenu;