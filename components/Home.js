import React, {useEffect, useState  } from 'react';
import {View, Pressable, Button, StyleSheet, ScrollView} from 'react-native'
// import Header from './Header';
// import Footer from './Footer';
import Thread from './Thread';
// import AddCommentIcon from '@mui/icons-material/AddComment';
import { useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import ProfileMenu from './ProfileMenu';


function Home() {

  // const [isProfileMenuVisible, setProfileMenuVisible] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    checkTokenExpiration();
  },[]);

  // const handleAccount = () => {
  //     setProfileMenuVisible(true);
  // }

  const checkTokenExpiration = async () => {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const expireTime = await AsyncStorage.getItem('AccessTokenExpirationTime');

      if(!authToken || !isTokenExpiration(expireTime)) {
        console.log("Home line 23")
          navigation.navigate('SignIn')
      }
  }

  const isTokenExpiration = async (expireTime) => {
      const now = Date.now()/1000;
      return now < expireTime
  }

    
    return (
        <ScrollView vertical={true} style={styles.Container}>
            {/* <View style={styles.header}> <Header /></View> */}
            <View style={styles.Content}>
                {/* <Pressable onPress={()=>navigation.navigate('CreateThread')}><AddCommentIcon /></Pressable> */}
                <Thread />
                {/* <ProfileMenu
                    isVisible={isProfileMenuVisible}
                    onClose={() => setProfileMenuVisible(false)}
                /> */}
            </View>
            {/* <View style={styles.footer}> <Footer /> </View> */}
            {/* <Button onPress={handleLogout}></Button> */}
            
        </ScrollView>
    );  
}

const styles = StyleSheet.create({
    Container: {
      flex: 1,
    },
    // header: {
    //   backgroundColor: '#f0f0f0',
    //   padding: 10,
    // },
    // headerText: {
    //   fontSize: 20,
    //   fontWeight: 'bold',
    // },
    Content: {
      backgroundColor: '#ffffff',
      padding: 10,
    },
    // footer: {
    //   backgroundColor: '#f0f0f0',
    //   padding: 10,
    //   justifyContent: 'flex-end',
    // },
    // footerText: {
    //   fontSize: 16,
    // },
  });
  

export default Home;