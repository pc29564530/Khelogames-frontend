import React, {useState, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {Text, View,TextInput, Pressable, StyleSheet, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {setAuthenticated, setUser} from '../redux/actions/actions';
import tailwind from 'twrnc';
import { BASE_URL } from '../constants/ApiConstants';

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
            const newAccount = {username, mobile_number: mobileNumber, password};
            console.log("new Account: ", newAccount)
            const response = await axios.post(`${BASE_URL}/users`, newAccount)
            dispatch(setAuthenticated(!isAuthenticated));
            dispatch(setUser(response.data.user));
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
              console.log("ResponseData for Account Creation ", response.data)
              setRefresh(response.data.refresh_token);
              setAccess(response.data.access_token);
              setAExpire(response.data.access_token_expires_at);
              setRExpire(response.data.access_token_expires_at);
              // dispatch(setMobileNumber(response.data.user.mobile_number))
              navigation.navigate('JoinCommunity');
              
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
        <View style={tailwind`flex-1 bg-black p-4`}>
            <View style={tailwind`h-30 items-center `}>
              <Text style={tailwind`text-white font-bold text-xl `}>User Details</Text>
            </View>
            <Text style={tailwind`text-white font-bold text-lg pb-4`} >Username</Text>
            <TextInput style={tailwind`text-white border border-b-2 border-white rounded-md mb-4 pl-4`} value={username} onChangeText={setUsername} placeholder="Enter your username" placeholderTextColor="white" />
            <Text style={tailwind`text-white font-bold text-lg pb-4`} >Mobile Number</Text>
            <TextInput style={tailwind`text-white border border-b-2 border-white rounded-md mb-4 pl-4`} value={mobileNumber} onChangeText={setMobileNumber} placeholder="Enter the Mobile Number" placeholderTextColor="white"  />
            <Text style={tailwind`text-white font-bold text-lg pb-4`} >Password</Text>
            <TextInput style={tailwind`text-white border border-b-2 border-white rounded-md mb-4 pl-4`} value={password} onChangeText={setPassword} placeholder="Enter your password" placeholderTextColor="white"/>
            <Pressable  style={tailwind`border border-b-2 border-white items-center ml-55 p-2 rounded-md mt-42`} onPress={handleAccount}>
              <Text style={tailwind`text-white font-bold text-xl`}>Next</Text>
            </Pressable>
        </View>
    )
};

export default User;

