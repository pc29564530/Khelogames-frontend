import React, {useState, useEffect} from 'react';
import {Image,KeyboardAvoidingView,StyleSheet,TextInput,Pressable, Text, View, Button, TouchableOpacity, SafeAreaView, Touchable} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation} from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {setAuthenticated, setUser} from '../redux/actions/actions';
import tailwind from 'twrnc';
import { Input, Icon } from '@rneui/themed';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');


const SignIn = () => {
    
  const dispatch = useDispatch();

    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const user = useSelector((state) => state.auth.user);
    const navigation = useNavigation();
    const  [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [refresh, setRefresh] = useState(null);
    const [access, setAccess] = useState(null);
    const [aexpire, setAExpire] = useState(null);
    const [rexpire, setRExpire] = useState(null);

    const handleSignIn = async() => {
      try {
        const user = {username, password}
        const response = await axios.post('http://10.0.2.2:8080/login', user);
        await AsyncStorage.setItem("AccessToken", response.data.access_token);
        await AsyncStorage.setItem("User", response.data.user.username);
        await AsyncStorage.setItem("RefreshToken", response.data.refresh_token);
        await AsyncStorage.setItem("AccessTokenExpiresAt", response.data.access_token_expires_at);
        await AsyncStorage.setItem("RefreshTokenExpiresAt", response.data.refresh_token_expires_at);
        setRefresh(response.data.refresh_token);
        setAccess(response.data.access_token);  
        setAExpire(response.data.access_token_expires_at)
        setRExpire(response.data.access_token_expires_at)
        dispatch(setAuthenticated(!isAuthenticated));
        dispatch(setUser(response.data.user));
        navigation.navigate('Main')
       
      } catch (err) {
        console.error(err);
      }
    }
    

    return (
      <View style={tailwind`flex-1 justify-center bg-black`}>
          <Image 
            style={tailwind`mt-5 mb-5 ml-30 mr-30 w-40 h-30`}
            source={logoPath}	
          />
          <View  style={tailwind`items-center justify-center bg-black`}>
            <Text style={tailwind`text-3xl font-bold text-white `}>Login</Text>
          </View>
          <View style={tailwind`ml-15 mr-10`}>
            <View style={tailwind`mt-10`}>
              <Input
                style={tailwind`w-full text-white`}
                leftIcon={<FontAwesome name="user" size={24} color="white"/>}
                value={username} onChangeText={setUsername} placeholder="Enter the Username" 
              />
            </View>
          </View>
          <View style={tailwind`mt-10 mr-10 ml-15`} >
            <View style={tailwind`mt-10`}>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  style={tailwind`w-full text-white`}
                  leftIcon={<FontAwesome name="lock" size={24} color="white" />}
                  placeholder="Enter your Password"
                />
            </View>
          </View>

          <View style={tailwind`mt-10 mr-20 ml-20`}>
            <Pressable onPress={handleSignIn} style={tailwind`bg-blue-500 hover:bg-blue-700 rounded-md py-3 px-4`}>
              <Text style={tailwind`text-white text-center font-bold`}>Login</Text>
            </Pressable>
          </View>
          <View style={tailwind`mt-10 mr-20 ml-20`}>
            <Pressable onPress={() => navigation.navigate("SignUp")} style={tailwind`bg-blue-500 hover:bg-blue-700 rounded-md py-3 px-4`}>
              <Text style={tailwind`text-white text-center font-bold`}>Create New Account</Text>
            </Pressable>
          </View>
    </View>
  );
}

export default SignIn;
