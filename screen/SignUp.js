import React, { useEffect, useState } from 'react';
import { Text, Image, View, TextInput, StyleSheet, Button, Pressable, FlatList, Modal } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Input, Icon } from '@rneui/themed';
import { useSelector, useDispatch } from 'react-redux';
import { sendOTP, setUser, verifyOTP } from '../redux/actions/actions';
import { setMobileNumber, setMobileNumberVerified } from '../redux/actions/actions';
import tailwind from 'twrnc';
import { AUTH_URL } from '../constants/ApiConstants';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
const logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Google } from '@mui/icons-material';




function SignUp() {
    const dispatch = useDispatch();
    const [mobileNumber, setMobileNumber] = useState('');
    const [userInfo, setUserInfo] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [otp, setOTP] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
      GoogleSignin.configure({
        scopes: ['profile', 'email'],
        offlineAccess:false,
        webClientId: process.env("WEB_CLIENT_ID")
      });
    }, [])

    const handleVerify = async () => {
        try {
            const verifyMobileNumber = {mobile_number: mobileNumber, otp: otp}
            const response = await axios.post(`${AUTH_URL}/signup`, verifyMobileNumber);
            dispatch(verifyOTP(response.data))
            dispatch(setMobileNumberVerified(true))
            navigation.navigate("User")
        } catch (err) {
            console.error('Failed to verify OTP:', err);
        }
    }

    const handleSendOTP = async () => {
      try {
        const response = await axios.post(`${AUTH_URL}/send_otp`, {mobile_number: mobileNumber})
        dispatch({type: 'SEND_OTP', payload:response.data})
      } catch (err) {
        console.error("Unable to send the otp from ui: ", err);
      }
    }
    const handleNavigateLogin = () => {
      navigation.navigate('SignIn')
    }
    const handleMailSignUp = async () => {
      try {
        await GoogleSignin.hasPlayServices()
        const user = await GoogleSignin.signIn()
      
        setUserInfo(user.data);
        setModalVisible(true);
      } catch (err) {
        console.error("unable to redirect to google sign in page: ", err)
      }
    }

    const handleGoogleSignUp = async (item) => {
      try {
        const tokens = await GoogleSignin.getTokens();
        if (tokens === null || tokens === undefined) {
          console.error("Tokens are undefined");
          return;
        }
        const data = {
          idToken: tokens.idToken,
          accessToken: tokens.accessToken,
        };
        const response = await axios.post(`${AUTH_URL}/google/handleGoogleCallback`,{
          code: item.idToken
        } )
      } catch (err) {
        console.error("unable to signup using gmail: ", err)
      }
    }
    
  return (
    <View style={tailwind`flex-1 justify-evenly bg-black`}>
      <View style={tailwind``}>
        <Pressable onPress={handleNavigateLogin}>
          <FontAwesome
            name="close"
            size={24}
            style={{ marginLeft: 10, color: 'white' }}
          />
        </Pressable>       
      </View>
      <Image style={tailwind`mt-5 mb-20 ml-30 mr-30 w-40 h-30`} source={logoPath} />
      <View style={tailwind`items-center justify-evenly bg-black`}>
        <Text style={tailwind`text-3xl font-bold text-white `}>Sign Up</Text>
      </View>
      <View style={tailwind`ml-15 mr-10`}>
        <View style={tailwind`mt-10`}>
          <Input
            style={tailwind`w-full text-white`}
            leftIcon={<AntDesign name="mobile1" size={24} color="white"/>}
            keyboardType="numeric"
            value={mobileNumber}
            onChangeText={(text) => setMobileNumber(text)}
            placeholder="Enter Mobile Number"
          />
        </View>
      </View>
      <View style={tailwind`mt-10 mr-20 ml-20`}>
        <Pressable style={tailwind`bg-blue-500 hover:bg-blue-500 rounded-md py-3`} onPress={handleSendOTP}>
          <Text style={tailwind`text-white text-center font-bold`}>Send</Text>
        </Pressable>
      </View>
      <View style={tailwind`ml-15 mr-10`}>
        <View style={tailwind`mt-10`}>
          <Input
            style={tailwind`w-full text-white`}
            leftIcon={<AntDesign name="lock" size={24} color="white" />}
            value={otp}
            onChangeText={(text) => setOTP(text)}
            placeholder="Enter Otp"
          />
        </View>
      </View>
      <View style={tailwind`mt-10 mr-20 ml-20`}>
        <Pressable onPress={handleVerify} style={tailwind`bg-blue-500 hover:bg-blue-700 rounded-md py-3 px-4`}>
          <Text style={tailwind`text-white text-center font-bold`}>Verify</Text>
        </Pressable>
      </View>

      <View style={tailwind`mt-10 mr-20 ml-20 flex-row`}>
        <Pressable onPress={() => handleMailSignUp()} style={tailwind`bg-blue-500 hover:bg-blue-700 rounded-md py-3 px-4`}>
            <Text style={tailwind`text-white text-center font-bold`}>Mail</Text>
        </Pressable>
      </View>
      {modalVisible && (
        <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <View style={tailwind`flex-1 justify-center items-center bg-white`}>
            <View style={tailwind`w-11/12 mt-10`}>
              <Text style={tailwind`text-2xl font-bold`}>Select an account</Text>
            </View>
            {userInfo && userInfo.user && (
              <View style={tailwind`w-11/12 mt-5`}>
                <Pressable onPress={() => { handleGoogleSignUp(userInfo); setModalVisible(false) }} style={tailwind`flex-row items-center`}>
                  <Image source={{ uri: userInfo.user.photo }} style={tailwind`w-10 h-10 rounded-full`} />
                  <View style={tailwind`ml-5`}>
                    <Text style={tailwind`text-lg font-bold`}>{userInfo.user.name}</Text>
                    <Text style={tailwind`text-gray-500`}>{userInfo.user.email}</Text>
                  </View>
                </Pressable>
              </View>
            )}
            <View style={tailwind`w-11/12 mt-5`}>
              <Button title="Add another account" onPress={() => { handleMailSignUp(); }} style={tailwind`bg-gray-200 hover:bg-gray-300 rounded-md py-3 px-4`}/>
            </View>
            <View style={tailwind`w-11/12 mt-5`}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} style={tailwind`bg-gray-200 hover:bg-gray-300 rounded-md py-3 px-4`}/>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

export default SignUp;