import React, {useState} from 'react';
import {Text,Image, View,TextInput, StyleSheet, Button } from 'react-native';
// import {Input, Icon} from 'native-base';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Input, Icon } from '@rneui/themed';




function  SignUp() {
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOTP] = useState('');
    const navigation = useNavigation();
    const handleVerify = async () => {
        try {
            const verifyMobileNumber = {mobileNumber, otp}
            console.log(verifyMobileNumber.mobileNumber);
            console.log(verifyMobileNumber.otp);
            const response = await axios.post('http://localhost:8080/signup', verifyMobileNumber)
            // setIsAuthenticated(true);
            navigation.navigate('User')
            console.log(response.data)
        } catch (err) {
            console.error(err);
        }
    }

    const sendOTP = async () => {
      try {
        var data = {mobileNumber}
        console.log(data.mobileNumber)
        const response = await axios.post('http://localhost:8080/send_otp', data)
        console.log("Hello India what are you doing")
        console.log(response.data)
        
      } catch (err) {
        console.error("Unable to send the otp from ui: ", err);
      }
    }

    return (
      <View style={styles.Container}>
        <Image style={styles.ImageBox} source={require('/home/pawan/projects/golang-project/khelogames-app/assets/images/Khelogames.png')} />
        <View style={styles.Middle}>
          <Text style={styles.LoginText}>Sign Up</Text>
        </View>
        <View style={styles.singleTextContainer}>
          <View style={styles.inputContainer}>
            <Input style={styles.InputBox}
                leftIcon={ 
                  <AntDesign name="mobile1" size={24} color="black" />
                }
                keyboardType="number"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="Enter Mobile Number"
            /> 
            
          </View>
        </View >
          
        <View style={styles.signInButton} >
          <Button style={styles.button} onPress={sendOTP} title="Send" /> 
        </View>

        <View style={styles.singleTextContainer}>
          <View style={styles.inputContainer}>
          <Input style={styles.InputBox}
              leftIcon={ 
                <AntDesign name="lock" size={24} color="black" />
              }
              keyboardType="number"
              value={otp}
              onChangeText={setOTP}
              placeholder="Enter Otp"
           /> 
          </View>
        </View>
        
        <View style={styles.signInButton}>
          <Button style={styles.button} onPress={handleVerify} title="Verify" />
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
    Width: '40%',
    height: '30%'
  },
  InputBox: {
    outlineStyle: 'none',
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
  iconStyles: {
    padding: 10
  },
  singleTextContainer: {
    marginLeft:15,
    marginRight:15,
    paddingRight: 20
  },
  textInputBox: {
    flexDirection: "row",
  },
  inputContainer: {
    outlineStyle: 'none',
    marginTop:10,
    marginRight:5
  },
  button: {
    marginTop: 10,
    marginRight: 20,
    marginLeft: 20,
  },
  signInButton: {
    justifyContent: 'center',
    alignItems:'center',
    marginLeft: 20,
    width: '15%',
    height: '10%',
  },
});

export default SignUp;

