import React , {useState} from 'react';
import {Image,Text, View, TextInput, StyleSheet, Pressable, Button, TouchableOpacity} from 'react-native';
import { useNavigation,  } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import KhelogamesLogo from '../assets/images/Khelogames.jpg';

function Header () {
    const navigation = useNavigation()
    const handleAccount = () => {
        navigation.navigate('ProfileMenu')
    }
    const iconSize = 25

    return (   
        
        <View style={styles.Container}>
            <Image source={KhelogamesLogo} style={styles.KgLogoStyle} />
            
            <View style={styles.HeaderIcon}>
                <FontAwesome  
                    name="search"
                    size={iconSize}
                    color="grey"
                    style={styles.IconStyles}
                />
                <MaterialIcons 
                    name="message"
                    size={iconSize}
                    color="grey"
                    style={styles.IconStyles}    
                />
                <TouchableOpacity style={styles.UserAvatar}  onPress={handleAccount}>
                    <Image style={styles.UserAvatar}    source={require('/home/pawan/projects/Khelogames-frontend/assets/images/Khelogames.png')} />
                </TouchableOpacity>
            </View>
        </View> 
    )
}

const styles = StyleSheet.create({
    Button: {
        backgroundColor: 'black',
    },
    KgLogoStyle: {
        height: 25,
        width: 130,
    },
    IconStyles: {
        height: 35,
        width: 35,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    Container: {
        backgroundColor: 'white',
        flexDirection: 'row',
        padding: 16,
        justifyContent: 'space-between',
    },
    HeaderIcon: {
        flexDirection: 'row',
    },
    UserAvatar: {
        marginRight: 10,
        width: 35,
        height: 35,
        borderRadius: 50,
        backgroundColor: 'grey',
      },
});

export default Header;