import React, { useState } from 'react';
import { Text, Image, View, TextInput, StyleSheet, Button, Pressable } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Input, Icon } from '@rneui/themed';
import { useSelector, useDispatch } from 'react-redux';
import { sendOTP, verifyOTP } from '../redux/actions/actions';
import { setMobileNumber, setMobileNumberVerified } from '../redux/actions/actions';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
const logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');


function SignUp() {
    const dispatch = useDispatch();
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOTP] = useState('');
    const navigation = useNavigation();
    const handleVerify = async () => {
        try {
            const verifyMobileNumber = {mobile_number: mobileNumber, otp: otp}
            const response = await axios.post(`${BASE_URL}/signup`, verifyMobileNumber);
            dispatch(verifyOTP(response.data))
            dispatch(setMobileNumberVerified(true))
            navigation.navigate("User")
        } catch (err) {
            console.error('Failed to verify OTP:', err);
        }
    }

    const handleSendOTP = async () => {
      console.log("Otp mobile Number: ", mobileNumber)
      try {
        console.log("MobileNumber: ", mobileNumber)
        const response = await axios.post(`${BASE_URL}/send_otp`, {mobile_number: mobileNumber})
        console.log("Response: ", response.data)
        dispatch({type: 'SEND_OTP', payload:response.data})
      } catch (err) {
        console.error("Unable to send the otp from ui: ", err);
      }
    }
    const handleNavigateLogin = () => {
      navigation.navigate('SignIn')
    }

  return (
    <View style={tailwind`flex-1 justify-center bg-black`}>
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
      <View style={tailwind`items-center justify-center bg-black`}>
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
    </View>
  );
}

export default SignUp;