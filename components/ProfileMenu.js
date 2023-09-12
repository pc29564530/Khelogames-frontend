import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Modal, StyleSheet, TouchableOpacity, Image} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Avatar } from '@mui/material';


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
              <View style={styles.profileHeader}>
                <Image style={styles.userAvatar} source='/home/pawan/Pictures' />
                <Text style={styles.fullName}>Deepak Kumar</Text>
                <Text style={styles.username}>@deepak</Text>
                <View style={styles.followRow}>
                  <Text style={styles.followRowText}>0 Followers</Text>
                  <Text style={styles.followRowText}> | </Text>
                  <Text style={styles.followRowText}>0  Following</Text>
                  <Text style={{
                      borderBottomColor: 'black',
                      borderBottomWidth: 'StyleSheet.hairlineWidth',
                    }}
                  />
                </View>
              </View>
                <TouchableOpacity onPress={() => handleLogout()} style={styles.logoutButton}>
                  <Text style={styles.logout}>Logout</Text>
              </TouchableOpacity>
            
        </View>
    );
}

const styles = StyleSheet.create({
    fullName: {
      paddingTop: 20,
      fontSize: 24, 
      fontWeight: 'bold',
    },
    username: {
      fontSize: 20,
      paddingBottom: 20
    },
    profileHeader: {
      paddingBotton: 20,
      marginBottom: 20
    },
    followRowText: {
      fontSize: 16
    },
    profileHeaderText: {
      fontSize: 20
    },
    followRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignContent: 'center',
      alignItems: 'center',

    },
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
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: 'grey',
    },
  });
  

export default ProfileMenu;