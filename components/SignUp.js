import React, {useState} from 'react';
import {Text, View,TextInput, StyleSheet, Button, Input } from 'react-native';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import axios from 'axios';




function  SignUp({navigation, setIsAuthentication}) {
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOTP] = useState('');

    const handleVerify = async () => {
        try {
            const verifyMobileNumber = {mobileNumber, otp}
            const response = await axios.post('http://localhost:8080/signup', verifyMobileNumber)
            setIsAuthenticated(true);
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
        // <View style={styles.container}>
        //     <View>
        //       <View style={styles.mobileBox}>
        //           <Text style={styles.label}>Mobile Number</Text>
        //           <TextInput style={styles.input} type="number" value={mobileNumber} onChangeText={setMobileNumber} placeholder="Enter Mobile Number" />
        //       </View>
        //       <View style={styles.otpBox}>
        //         <Text style={styles.label}>Otp</Text>
        //         <TextInput style={styles.input} type="number" value={otp} onChangeText={setOTP} placeholder="Enter Otp number" />
        //         <Button  style={styles.button} onPress={sendOTP}>Send</Button>
        //       </View>
        //       <View style={styles.signInButton}>
        //         <Button style={styles.button} onPress={handleVerify}>Verify</Button>
        //       </View> 
        //     </View>
        // </View>
        <View style={styles.container}>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            {/* <Text style={styles.label}>Mobile Number</Text> */}
            <View style={styles.textInputBox}>
              <PhoneAndroidIcon />
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="Enter Mobile Number"
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>OTP</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOTP}
              placeholder="Enter OTP number"
            />
            <Button style={styles.button} onPress={sendOTP} title="Send" />
          </View>
          <View style={styles.signInButton}>
            <Button style={styles.button} onPress={handleVerify} title="Verify" />
          </View>
        </View>
      </View>
    )
}

export default SignUp;


const styles = StyleSheet.create({
  textInputBox: {
    flexDirection: "row",
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#007bff',
    color: 'white',
  },
  signInButton: {
    marginTop: 20,
  },
});

