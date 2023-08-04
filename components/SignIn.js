import React, {useState, useEffect} from 'react';
import {Pressable, Text, View, Button} from 'react-native';
import { TextInput, StyleSheet } from 'react-native-web';
import AsyncStorage  from '@react-native-async-storage/async-storage'
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

const SignIn = ({navigation}) => {
    const  [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState();
    const [refresh, setRefresh] = useState(null);
    const [access, setAccess] = useState(null);

    // useEffect(  () =>{
    //   const loggedInUser =  AsyncStorage.getItem("AccessToken")
    //   if(loggedInUser){
    //     const getUser = JSON.parse( JSON.stringify(loggedInUser));
    //     setUser(getUser);
    //   }
    // },[])

    const handleSignIn = async() => {
      try {
        const user = {username, password}
        const response = await axios.post('http://localhost:8080/login', user);
        setUser(response.data);
        console.log(response.data.access_token);
        await AsyncStorage.setItem("AccessToken", response.data.access_token);
        await AsyncStorage.setItem("RefreshToken", response.data.refresh_token);
        await navigation.replace('Home');  
        console.log(response.data);
      } catch (err) {
        console.error(err);
      }
    }
    

    return (
      <View style={styles.container}>
          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Enter the Username" />
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Enter the Password" />
          <Button onPress={handleSignIn}>Sign In</Button>
          <View>
              <Text>Don't have an account</Text>
              <Button onPress={()=> navigation.navigate('User')} title='User'/>
          </View>
      </View>
  );
}


export default SignIn;