import React, {useState, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {Text, View,TextInput, Pressable, StyleSheet, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {setAuthenticated, setUser} from '../redux/actions/actions';
const styles = StyleSheet.create({
    Container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
    },
    Label: {
      fontSize: 16,
      marginBottom: 5,
    },
    Input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 20,
    },
  });

// export const AllUser = () =>{

//   const [data, setData] = useState();

//   const fetchData = async () => {
//     try {
//       const authtoken = await AsyncStorage.getItem('AccessToken');
//       const response = await axios.get('http://192.168.0.105:8080/user_list', {
//         headers:{
//           'Authorization':`Bearer ${authtoken}`,
//           'Content-Type': 'application/json',
//         }
//       });
//       console.log(response.data);
//       setData(response.data);

//     } catch(err){
//       console.error(err);
//     }
//   }

//   useEffect(() => {
//     fetchData();
//   },[])

//   return (
//     <View>
//       {data.map((item,i) => (
//         <View key={i}>
//           <Text>{item.username}</Text>
//         </View>
//       ))}
//     </View>
//   );
// }
  

    const User = () => {
      const navigation = useNavigation();
      const dispatch=useDispatch();
      const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
      const user = useSelector((state) => state.auth.user);
      const isMobileNumberVerified = useSelector((state) => state.auth.isMobileNumberVerified);
      const [username, setUsername] = useState('');
      const [mobileNumber, setMobileNumber] = useState('');
      const [password, setPassword] = useState('');
      const [refresh, setRefresh] = useState(null);
      const [access, setAccess] = useState(null);
      const [aexpire, setAExpire] = useState(null);
      const [rexpire, setRExpire] = useState(null);


      const handleAccount = async () => {
        if(isMobileNumberVerified) {
          try {
            const newAccount = {username, mobileNumber, password};
            console.log(newAccount)
            const response = await axios.post('http://192.168.0.107:8080/users', newAccount)
            if (response.data) {
              if (response.data.access_token) {
                await AsyncStorage.setItem("AccessToken", response.data.access_token);
              }
              if (response.data.user && response.data.user.username) {
                await AsyncStorage.setItem("User", response.data.user.username);
              }
              if (response.data.refresh_token) {
                await AsyncStorage.setItem("RefreshToken", response.data.refresh_token);
              }
              if (response.data.access_token_expires_at) {
                await AsyncStorage.setItem("AccessTokenExpiresAt", response.data.access_token_expires_at);
              }
              if (response.data.refresh_token_expires_at) {
                await AsyncStorage.setItem("RefreshTokenExpiresAt", response.data.refresh_token_expires_at);
              }
              setRefresh(response.data.refresh_token);
              setAccess(response.data.access_token);
              setAExpire(response.data.access_token_expires_at);
              setRExpire(response.data.access_token_expires_at);
              dispatch(setAuthenticated(!isAuthenticated));
              dispatch(setUser(response.data.user));
              navigation.navigate('JoinCommunity');
              console.log(response.data);
            } else {
              console.error('Invalid response data');
            }
          } catch (err) {
            console.error('Unable to create account', err);
          }
        } else {
          console.error("Mobile number is not verified");
        }
      
    
    }

    return (
        <View style={styles.Container}>
            <Text style={styles.Label} >Username</Text>
            <TextInput style={styles.Input} value={username} onChangeText={setUsername} placeholder="Enter your username" />
            <Text style={styles.Label} >Mobile Number</Text>
            <TextInput style={styles.Input} value={mobileNumber} onChangeText={setMobileNumber} />
            <Text style={styles.Label} >Password</Text>
            <TextInput style={styles.Input} value={password} onChangeText={setPassword} placeholder="Enter your password" />
            <Pressable onPress={handleAccount}>
              <Text>Submit</Text>
            </Pressable>
        </View>
    )
};

export default User;

