import React, {useState} from 'react';
import {Text,Image, View,TextInput, StyleSheet, Button } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Input, Icon } from '@rneui/themed';
import { useSelector, useDispatch } from 'react-redux';
import { sendOTP, verifyOTP } from '../redux/actions/actions';
import { setMobileNumber } from '../redux/actions/actions';
import logoPath from '~/Khelogames/assets/images/Khelogames.png';


function  SignUp() {
    const dispatch = useDispatch();
    const [mobileNumber, setMobileNumber] = useState('');
    // const mobileNumber = useSelector((state) => state.mobileNumber);
    const [otp, setOTP] = useState('');
    const navigation = useNavigation();
    const handleVerify = async () => {
        try {
            const verifyMobileNumber = {mobileNumber, otp}
            console.log(verifyMobileNumber.mobileNumber);
            console.log(verifyMobileNumber.otp);
            const response = await axios.post('http://192.168.0.105:8080/signup', verifyMobileNumber);
            dispatch({type: 'VERIFY_OTP', payload:response.data})
            console.log("line no 23")
            // setMobileNumber(verifyMobileNumber.mobileNumber)
            // dispatch(setMobileNumber(verifyMobileNumber.mobileNumber))
            dispatch({ type: 'SET_MOBILE_NUMBER_VERIFIED', payload: true });
            navigation.navigate('User')
        } catch (err) {
            console.error('Failed to verify OTP:', err);
        }
    }

    const handleSendOTP = async () => {
      try {
        var data = {mobileNumber}
        console.log(data.mobileNumber)
        const response = await axios.post('http://192.168.0.105:8080/send_otp', data)
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
                keyboardType="number"
                value={mobileNumber}
                onChangeText={(text) => setMobileNumber(text)}
                placeholder="Enter Mobile Number"
            /> 
            
          </View>
        </View >
          
        <View style={styles.SignInButton} >
          <Button style={styles.Button} onPress={handleSendOTP} title="Send" /> 
        </View>

        <View style={styles.SingleTextContainer}>
          <View style={styles.InputContainer}>
          <Input style={styles.InputBox}
              leftIcon={ 
                <AntDesign name="lock" size={24} color="black" />
              }
              keyboardType="number"
              value={otp}
              onChangeText={(text) => setOTP(text)}
              placeholder="Enter Otp"
           /> 
          </View>
        </View>
        
        <View style={styles.SignInButton}>
          <Button style={styles.Button} onPress={handleVerify} title="Verify" />
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
    justifyContent: 'center',
    alignItems:'center',
    marginLeft: 20,
    width: '15%',
    height: '10%',
  },
});

export default SignUp;

