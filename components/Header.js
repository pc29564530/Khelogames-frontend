import React , {useState} from 'react';
import {Image,Text, View, TextInput, StyleSheet, Pressable, Button, TouchableOpacity} from 'react-native';
import { useNavigation,  } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign'
import KhelogamesLogo from '../assets/images/Khelogames.jpg';

function Header () {
    const navigation = useNavigation()
    const handleAccount = () => {
        navigation.navigate('ProfileMenu')
    }

    return (   
        
        <View style={styles.container}>
            <Image source={KhelogamesLogo} style={styles.kgLogoStyle} />
            
            <View style={styles.headerIcon}>
                <AntDesign  
                    name="search1"
                    size={19}
                    color="grey"
                    style={styles.iconStyles}
                />
                <AntDesign 
                    name="message1"
                    size={22}
                    color="grey"
                    style={styles.iconStyles}    
                />
                <TouchableOpacity style={styles.userAvatar}  onPress={handleAccount}>
                    <Image src='/home/pawan/' />
                </TouchableOpacity>
            </View>
        </View> 
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'black',
    },
    kgLogoStyle: {
        height: 25,
        width: 130,
    },
    iconStyles: {
        height: 35,
        width: 35,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    container: {
        backgroundColor: 'white',
        flexDirection: 'row',
        padding: 16,
        justifyContent: 'space-between',
    },
    headerIcon: {
        flexDirection: 'row',
    },
    userAvatar: {
        marginRight: 10,
        width: 35,
        height: 35,
        borderRadius: 50,
        backgroundColor: 'grey',
      },
});

export default Header;