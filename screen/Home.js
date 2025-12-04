import React, {useEffect} from 'react';
import {View, ScrollView, Pressable, Text} from 'react-native';
import Thread from './Thread';
import { useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };


    return (
    <>
      <ScrollView style={tailwind`flex-1`} testID="home-screen">
          <View style={tailwind`flex-row justify-evenly items-center bg-white `}>
            <Pressable style={tailwind`p-2 border border-white rounded-md bg-orange-200`}>
              <Text style={tailwind`text-white text-lg font-semibold`}>Explore</Text>
            </Pressable>
            <Pressable style={tailwind`p-2 border border-white rounded-md bg-orange-200`}>
              <Text style={tailwind`text-white text-lg font-semibold`}>Live</Text>
            </Pressable>
          </View>
          <Thread />
        {/* </View> */}
      </ScrollView>
      <View style={tailwind`absolute bottom-14 right-4`}>
          <Pressable style={tailwind`p-4 bg-red-400 rounded-full shadow-lg`} onPress={() => navigation.navigate("CreateThread")}>
              <MaterialIcons name="add" size={26} color="white" />
          </Pressable>
      </View>
    </>
    );  
}

export default Home;