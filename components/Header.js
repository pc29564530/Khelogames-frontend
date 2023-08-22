import React , {useState} from 'react';
import {Image,Text, View, TextInput, StyleSheet, Pressable, Button} from 'react-native';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigation,  } from '@react-navigation/native';
import ProfileMenu from './ProfileMenu';
import { ScrollView } from 'react-native-gesture-handler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import KhelogamesLogo from '../assets/images/Khelogames.jpg';
// import AsyncStorage from '@react-native-async-storage/async-storage';

function Header ({logout}) {

    // const [isProfileMenuVisible, setProfileMenuVisible] = useState(false);

    // const handleAccount = () => {
    //     setProfileMenuVisible(true);
    // }
    const handlelogout = () => {
        try {
            console.log(logout)
            logout();
        } catch (err) {
            console.error(err);
        }
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
                <AntDesign 
                    onPress={() => handlelogout()}
                    name="logout"
                    size={19}
                    color="black"
                    style={styles.iconStyles}
                />
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
        backgroundColor: 'lightgrey',
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
    // headerText: {
    //     fontSize: 20,
    //     height:30,
    //     width: 110,
    //     color: 'white',
    // },
    // iconStyles:{
    //     paddingHorizontal: 20,
    //     marginTop:1,
    // }
});

export default Header;