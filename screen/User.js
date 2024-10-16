import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { setAuthenticated, setUser } from '../redux/actions/actions';
import tailwind from 'twrnc';
import { AUTH_URL, BASE_URL } from '../constants/ApiConstants';
import { useDispatch, useSelector } from 'react-redux';

const User = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const isMobileNumberVerified = useSelector((state) => state.auth.isMobileNumberVerified);
  
  const [username, setUsername] = useState('');
  const [refresh, setRefresh] = useState(null);
  const [access, setAccess] = useState(null);
  const [aexpire, setAExpire] = useState(null);
  const [rexpire, setRExpire] = useState(null);
  const { gmail, mobileNumber } = route.params;
  const [gmailA, setGmailA] = useState(gmail);
  const [mobileNumberA, setMobileNumberA] = useState(mobileNumber);

  useEffect(() => {
    if (gmail) {
      setGmailA(gmail);
    }
    if (mobileNumber) {
      setMobileNumberA(mobileNumber);
    }
  }, [gmail, mobileNumber]);

  const handleAccount = async () => {
      try {
        const newAccount = { username, mobile_number: mobileNumberA?mobileNumberA:null, role: 'user', gmail: gmailA?gmailA:null };
        const response = await axios.post(`${AUTH_URL}/users`, newAccount);
        dispatch(setAuthenticated(!isAuthenticated));
        dispatch(setUser (response.data.user));
        if (response.data) {
          if (response.data.access_token) {
            await AsyncStorage.setItem("AccessToken", response.data.access_token);
          }
          if (response.data.user && response.data.user.username) {
            await AsyncStorage.setItem("User ", response.data.user.username);
          }
          if (response.data.refresh_token) {
            await AsyncStorage.setItem("RefreshToken", response.data.refresh_token);
          }
          if (response.data.access_token_expires_at) {
            await AsyncStorage.setItem("AccessTokenExpiresAt", response.data.access_token_expires_at);
          }
          if (response.data.refresh_token_expires_at) {
            await AsyncStorage.setItem("RefreshTokenExpiresAt", response.data.refresh_token_expires_at);
          }
          console.log("ResponseData for Account Creation ", response.data);
          setRefresh(response.data.refresh_token);
          setAccess(response.data.access_token);
          setAExpire(response.data.access_token_expires_at);
          setRExpire(response.data.access_token_expires_at);
          navigation.navigate('JoinCommunity');
        } else {
          console.error('Invalid response data');
        }
      } catch (err) {
        console.error('Unable to create account', err);
      }
  };

  return (
    <View style={tailwind`flex-1 bg-black p-4`}>
      <View style={tailwind`h-30 items-center`}>
        <Text style={tailwind`text-white font-bold text-3xl`}>User  Details</Text>
      </View>
      <View style={tailwind`mt-10`}>
        <Text style={tailwind`text-white font-bold text-lg`}>Username</Text>
        <TextInput
          style={tailwind`text-white border border-b-2 border-white rounded-md mb-4 pl-4`}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
          placeholderTextColor="white"
        />
      </View>
      {mobileNumber ? (
      <View style={tailwind`mt-10`}>
        <Text style={tailwind`text-white font-bold text-lg`}>Mobile Number</Text>
        <TextInput
          style={tailwind`text-white border border-b-2 border-white rounded-md mb-4 pl-4`}
          value={mobileNumberA}
          editable={false}
          placeholderTextColor="white"
        />
      </View>
      ): (
      <View style={tailwind`mt-10`}>
        <Text style={tailwind`text-white font-bold text-lg`}>Gmail</Text>
        <TextInput
          style={tailwind`text-white border border-b-2 border-white rounded-md mb-4 pl-4`}
          value={gmailA}
          editable={false}
          placeholderTextColor="white"
        />
      </View>
      )}
      <View style={tailwind`mt-10`}>
        <Text style={tailwind`text-white font-bold text-lg`}>Role</Text>
        <TextInput
          style={tailwind`text-white border border-b-2 border-white rounded-md mb-4 pl-4`}
          value={"user"}
          editable={false}
          placeholderTextColor="white"
        />
      </View>
      <Pressable
        style={tailwind`bg-blue-500 hover:bg-blue-700 rounded-md py-3 px-4 mt- 10`}
        onPress={handleAccount}
      >
        <Text style={tailwind`text-white font-bold text-lg`}>Next</Text>
      </Pressable>
    </View>
  );
};

export default User;