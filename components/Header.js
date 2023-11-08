import React , {useState, useEffect} from 'react';
import {Image, View, TouchableOpacity} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import KhelogamesLogo from '../assets/images/Khelogames.jpg';
import tailwind from 'twrnc';
import ProfileMenu from './ProfileMenu';

const logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');

function Header () {
    const navigation = useNavigation();
    const handleAccount = () => {
        navigation.navigate('ProfileMenu');
      };

    //   useEffect(() => {
    //     navigation.navigate('ProfileMenu');
    //   }, []);

    return (   
        <View style={tailwind`bg-white h-15 flex-row items-center justify-between px-4 bg-black`}>
            <Image source={KhelogamesLogo} style={tailwind`h-30 w-25`} />
            
            <View style={ tailwind`flex-row items-center`}>
                <FontAwesome  
                    name="search"
                    size={24}
                    color="white"
                />
                <MaterialIcons 
                    name="message"
                    size={24}
                    color="white"   
                />
                <TouchableOpacity  onPress={handleAccount}>
                    <FontAwesome name="bars" color="white" size={24} />
                </TouchableOpacity>
            </View>
        </View> 
    )
}

export default Header;