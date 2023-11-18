import React, {useEffect} from 'react';
import {View, ScrollView} from 'react-native';
import Thread from './Thread';
import { useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tailwind from 'twrnc';

function Home() {

  const navigation = useNavigation();
  useEffect(() => {
    checkTokenExpiration();
  },[]);

  const checkTokenExpiration = async () => {
      const authToken = await AsyncStorage.getItem('AccessToken');
      const expireTime = await AsyncStorage.getItem('AccessTokenExpirationTime');

      if(!authToken || !isTokenExpiration(expireTime)) {
          navigation.navigate('SignIn')
      }
  }

  const isTokenExpiration = async (expireTime) => {
      const now = Date.now()/1000;
      return now < expireTime
  }


    return (
      <>
        <ScrollView style={tailwind`flex-1 bg-black`}>
          <View style={tailwind`bg-black`}>
            <Thread />
          </View>
        </ScrollView>
      </>  
    );  
}

export default Home;