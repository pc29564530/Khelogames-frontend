import React from 'react';
import {Text, View, TextInput, StyleSheet, Pressable, Button} from 'react-native';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
// import AsyncStorage from '@react-native-async-storage/async-storage';

function Header ({navigation}) {

    const handleLogout =   () => {
        localStorage.clear()
        console.log('User logged out');
        navigation.navigate('SignUp')
      }

    return (
        <View style={styles.header}>
            <View>
                <Text style={styles.headerText}><HomeIcon /></Text>
            </View>
            <View>
                <Text><SearchIcon /></Text>
            </View>
            <View>
                <Text style={styles.headerText} ><EmailIcon /></Text>
            </View>
            <View>
                <Text style={styles.headerText}><AccountCircleIcon /></Text>
            </View> 
            <View>
                <Button style={styles.headerText} onPress={handleLogout} >Logout</Button>
            </View>
        </View>
    )
}

export default Header;

const styles = StyleSheet.create({
    header: {
        position: 'relative',
        top: 20,
        left: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        padding: 10,
        marginBottom:0,
    },
    headerText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    serach: {

    }
});