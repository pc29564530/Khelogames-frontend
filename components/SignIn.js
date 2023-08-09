import React, {useState, useEffect} from 'react';
import {Pressable, Text, View, Button} from 'react-native';
import { TextInput, StyleSheet } from 'react-native-web';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import axios from 'axios';




const SignIn = ({navigation}) => {
    const  [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState();
    const [refresh, setRefresh] = useState(null);
    const [access, setAccess] = useState(null);

    const handleSignIn = async() => {
      try {
        const user = {username, password}
        const response = await axios.post('http://localhost:8080/login', user);
        setUser(response.data);
        await AsyncStorage.setItem("AccessToken", response.data.access_token);
        await AsyncStorage.setItem("User", response.data.user.username);
        await AsyncStorage.setItem("RefreshToken", response.data.refresh_token);
        setRefresh(response.data.refresh_token);
        setAccess(response.data.access_token);  
        await navigation.navigate('Home');
       
        // console.log(response.data);
      } catch (err) {
        console.error(err);
      }
    }
    

    return (
      <View style={styles.container}>
        <View style={styles.loginContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Enter the Username" />
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Enter the Password" />
            <Button style={styles.button} onPress={handleSignIn}>Sign In</Button>
        </View>
          
          <View style={styles.singupBox}>
              <Text>Don't have an account</Text>
              <Button onPress={()=> navigation.navigate('User')} title='User'/>
          </View>
      </View>
  );
}


export default SignIn;


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
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
  },
  singupBox: {
    flexDirection: 'row',
    justifyContent:'center',
  }
});