import React, {useEffect, useState  } from 'react';
import {View, Pressable, Button, StyleSheet, ScrollView} from 'react-native'
// import Header from './Header';
// import Footer from './Footer';
import Thread from './Thread';
// import AddCommentIcon from '@mui/icons-material/AddComment';
import { useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


function Home() {

  const navigation = useNavigation();
  useEffect(() => {
    checkTokenExpiration();
  },[]);

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
      <>
      <ScrollView style={styles.Container}>
        <View style={styles.Content}>
          <Thread />
        </View>
      </ScrollView>
      </>
        
    );  
}

const styles = StyleSheet.create({
    Container: {
      flex: 1,
    },
    Content: {
      backgroundColor: '#ffffff',
      padding: 10,
    },
  });
  

export default Home;