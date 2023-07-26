import React, {useState} from 'react';
import {Text, View,TextInput, StyleSheet, Button } from 'react-native';
import axios from 'axios';


const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
    },
    label: {
      fontSize: 16,
      marginBottom: 5,
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 20,
    },
  });

function  SignUp({navigation}) {
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOTP] = useState('');

    const handleVerify = async () => {
        try {
            const verifyMobileNumber = {mobileNumber, otp}
            const response = await axios.post('http://localhost:8080/signup', verifyMobileNumber)
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
        <View style={styles.container}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput style={styles.input} type="number" value={mobileNumber} onChangeText={setMobileNumber} placeholder="Enter Mobile Number" />
            <Button onPress={sendOTP}>Send</Button>
            <Text style={styles.label}>Otp</Text>
            <TextInput style={styles.input} type="number" value={otp} onChangeText={setOTP} placeholder="Enter Otp number" />
            <Button onPress={handleVerify}>Verify</Button>
        </View>
    )
}

export default SignUp;