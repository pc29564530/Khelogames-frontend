import React, {useState, useEffect} from 'react';
import {Pressable, Text, View, Button, TouchableOpacity} from 'react-native';
import { TextInput, StyleSheet } from 'react-native-web';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import axios from 'axios';




const SignIn = ({navigation}) => {
    const  [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState();
    const [refresh, setRefresh] = useState(null);
    const [access, setAccess] = useState(null);
    const [expire, setExpire] = useState(null);

    const handleSignIn = async() => {
      try {
        const user = {username, password}
        const response = await axios.post('http://localhost:8080/login', user);
        console.log(response.data); 
        setUser(response.data);
        await AsyncStorage.setItem("AccessToken", response.data.access_token);
        await AsyncStorage.setItem("User", response.data.user.username);
        await AsyncStorage.setItem("RefreshToken", response.data.refresh_token);
        await AsyncStorage.setItem("AccessTokenExpiresAt", response.data.access_token_expires_at);
        setRefresh(response.data.refresh_token);
        setAccess(response.data.access_token);  
        setExpire(response.data.access_token_expires_at)
        await navigation.navigate('Home');
       
      } catch (err) {
        console.error(err);
      }
    }
    

    return (
      <View style={styles.container}>
        <View style={styles.subContainer}>
            <TextInput style={styles.inputBox} value={username} onChangeText={setUsername} placeholder="Enter the Username" />
            <TextInput style={styles.inputBox} value={password} onChangeText={setPassword} placeholder="Enter the Password" />
            <TouchableOpacity onPress={handleSignIn} style={styles.loginButton}>
              <Text style={styles.login}>Log in</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.newAccount} onPress={() => navigation.navigate("SignUp")}>
              <Text style={styles.newAccountText}>Create new account</Text>
            </TouchableOpacity>
        </View>
      </View>
  );
}


export default SignIn;


const styles = StyleSheet.create({
  logoStyle: {
    height: 50,
    width: 50,
    marginVertical: '20%',
  },
  container: {
    padding: 16,
  },
  subContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputBox: {
    borderWidth: 1,
    borderColor: 'borderGrey',
    padding: 10,
    borderRadius: 12,
    width: '95%',
    marginTop: 12,
  },
  loginButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 20,
    width: '95%',
    alignItems: 'center',
    marginTop: 12,
  },
  login: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  newAccount: {
    borderColor: 'lightgrey',
    borderWidth: 1,
    padding: 10,
    borderRadius: 18,
    width: '95%',
    alignItems: 'center',
    marginTop: '35%',
  },
  newAccountText: {
    color: 'lightgrey',
    fontSize: 14,
    fontWeight: '400',
  },
  metaLogoStyle: {
    height: 15,
    width: 70,
    marginTop: 15,
  },
});
