import React, {useState} from 'react';
import {Text, View,TextInput, Pressable, StyleSheet, Button } from 'react-native';
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


  

const User = ({navigation}) => {
    const [username, setUsername] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');

    const handleAccount = async () => {
      try {
        const newAccount = {username, mobileNumber, password};
        const response = await axios.post('http://localhost:8080/users', newAccount)
        navigation.navigate('Home');
        console.log(response.data);
      } catch (err) {
        console.error('Unable to create account', err);
      }
    
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label} >Username</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Enter your username" />
            <Text style={styles.label} >Mobile Number</Text>
            <TextInput style={styles.input} value={mobileNumber} onChangeText={setMobileNumber} placeholder="Enter your mobile number" />
            <Text style={styles.label} >Password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Enter your password" />
           <Button onPress={handleAccount}>Submit</Button>
        </View>
    )
};

export default User;