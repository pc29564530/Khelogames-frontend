import React, {useState} from 'react';
import {Text,Image, View,TextInput, StyleSheet, Button, Pressable } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Input, Icon } from '@rneui/themed';
import { useSelector, useDispatch } from 'react-redux';
import { sendOTP, verifyOTP } from '../redux/actions/actions';
import { setMobileNumber, setMobileNumberVerified } from '../redux/actions/actions'; 

const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');

function  SignUp() {
    const dispatch = useDispatch();
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOTP] = useState('');
    const navigation = useNavigation();
    const handleVerify = async () => {
        try {
            const verifyMobileNumber = {mobileNumber, otp}
            const response = await axios.post('http://192.168.0.107:8080/signup', verifyMobileNumber);
            dispatch(verifyOTP(response.data))
            dispatch(setMobileNumberVerified(true))
            navigation.navigate("User")
        } catch (err) {
            console.error('Failed to verify OTP:', err);
        }
    }

    const handleSendOTP = async () => {
      try {
        var data = {mobileNumber}
        const response = await axios.post('http://192.168.0.107:8080/send_otp', data)
        console.log(response.data)
        dispatch({type: 'SEND_OTP', payload:response.data})
      } catch (err) {
        console.error("Unable to send the otp from ui: ", err);
      }
    }

    return (
      <View style={styles.Container}>
        <Image style={styles.ImageBox} source={logoPath} />
        <View style={styles.Middle}>
          <Text style={styles.LoginText}>Sign Up</Text>
        </View>
        <View style={styles.SingleTextContainer}>
          <View style={styles.InputContainer}>
            <Input style={styles.InputBox}
                leftIcon={ 
                  <AntDesign name="mobile1" size={24} color="black" />
                }
                keyboardType="numeric"
                value={mobileNumber}
                onChangeText={(text) => setMobileNumber(text)}
                placeholder="Enter Mobile Number"
            /> 
            
          </View>
        </View >
          
        <View style={styles.SignInButton} >
          <Pressable style={styles.Button} onPress={handleSendOTP} >
            <Text style={styles.ButtonText} >Send</Text>
          </Pressable> 
        </View>

        <View style={styles.SingleTextContainer}>
          <View style={styles.InputContainer}>
          <Input style={styles.InputBox}
              leftIcon={ 
                <AntDesign name="lock" size={24} color="black" />
              }
              value={otp}
              onChangeText={(text) => setOTP(text)}
              placeholder="Enter Otp"
           /> 
          </View>
        </View>
        
        <View style={styles.SignInButton}>
          <Pressable onPress={handleVerify}>
              <Text style={styles.ButtonText}>Verify</Text>
          </Pressable>
        </View>
      </View>
    );
}




const styles = StyleSheet.create({
  ImageBox: {
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 30,
    marginRight:30,
    width: '40%',
    height: '30%'
  },
  InputBox: {
    // outlineStyle: 'none',
  },
  Container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  LoginText: {
    marginTop:20,
    fontSize:30,
    fontWeight:'bold',
  },
  Middle:{
    alignItems:'center',
    justifyContent:'center',
  },
  IconStyles: {
    padding: 10
  },
  SingleTextContainer: {
    marginLeft:15,
    marginRight:15,
    paddingRight: 20
  },
  TextInputBox: {
    flexDirection: "row",
  },
  InputContainer: {
    // outlineStyle: 'none',
    marginTop:10,
    marginRight:5
  },
  Button: {
    marginTop: 10,
    marginRight: 20,
    marginLeft: 20,
  },
  SignInButton: {
    width: 200,
    backgroundColor: "grey",
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
    padding: 15,
  },
  ButtonText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  }
});

export default SignUp;

