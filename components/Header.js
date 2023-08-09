import React , {useState} from 'react';
import {Text, View, TextInput, StyleSheet, Pressable, Button} from 'react-native';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigation,  } from '@react-navigation/native';
import ProfileMenu from './ProfileMenu';

// import AsyncStorage from '@react-native-async-storage/async-storage';

function Header () {

    const [isProfileMenuVisible, setProfileMenuVisible] = useState(false);

    const handleAccount = () => {
        setProfileMenuVisible(true);
    }

    return (    
        <View style={styles.header}>
            {/* <View>
                <Text style={styles.headerText}>Khelogames</Text>
            </View> */}
            <View>
                <Text><SearchIcon /></Text>
            </View>
            <View>
                <Text style={styles.headerText} ><EmailIcon /></Text>
            </View>
            <View>
                <Pressable style={styles.headerText} onPress={handleAccount}><AccountCircleIcon /></Pressable>
            </View> 
            <ProfileMenu
        isVisible={isProfileMenuVisible}
        onClose={() => setProfileMenuVisible(false)}
      />
            {/* <View>
                <Button style={styles.headerText}  >Logout</Button>
            </View> */}
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