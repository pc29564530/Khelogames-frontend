import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState} from 'react';
import {View, Text, Pressable, Modal, StyleSheet} from 'react-native';
import { useNavigation,  } from '@react-navigation/native';


function ProfileMenu ({isVisible, onClose}) {
    const navigation = useNavigation();
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('AccessToken');
            await AsyncStorage.removeItem("RefreshToken");
            navigation.navigate('SignIn');

        } catch (err) {
            console.error(err);
        }
    }
    return (
        <View style={styles.centeredView}>
            <Modal 
                animationType='slide'
                transparent={true}
                visible={isVisible}
            >
            <View style={styles.modalView}>
                <Pressable>Profile</Pressable>
                <Pressable onPress={handleLogout}>Logout</Pressable>
                <Pressable onPress={onClose}>Close</Pressable>
            </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
      },
      modalView: {
        marginTop: 70,
        marginLeft: 30,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      },
});

export default ProfileMenu;