import React, {useState, useEffect} from 'react';
import {Image,KeyboardAvoidingView,StyleSheet,TextInput,Pressable, Text, View, Button, TouchableOpacity, SafeAreaView} from 'react-native';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import axios from 'axios';
import { useNavigation} from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {setAuthenticated, setUser} from '../redux/actions/actions';
<<<<<<< Updated upstream

=======
const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');
>>>>>>> Stashed changes

const api = axios.create({
  baseURL: 'http://192.168.0.105:8080', // Update with your backend URL
});


const SignIn = () => {
    
  const dispatch = useDispatch();

    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const user = useSelector((state) => state.auth.user);
    const navigation = useNavigation();
    const  [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // const [user, setUser] = useState();
    const [refresh, setRefresh] = useState(null);
    const [access, setAccess] = useState(null);
    const [aexpire, setAExpire] = useState(null);
    const [rexpire, setRExpire] = useState(null);

    const handleSignIn = async() => {
      try {
        const user = {username, password}
        console.log(user);
        const response = await axios.post('http://192.168.0.105:8080/login', user);
        console.log(response.data); 
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
        console.log("is login happen")
        navigation.navigate('Main')
       
      } catch (err) {
        console.error(err);
      }
    }
    

    return (
      <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', marginTop: 50}}>
        <View>
          <Image 
            style={{width: 150, height: 100, margin: 20}}
            source={require('/home/pawan/projects/Khelogames-frontend/assets/images/Khelogames.png')}
          />
        </View>
        <KeyboardAvoidingView >
            <View style={{alignItems: 'center', marginTop: 20}}>
              <Text 
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  marginTop: 12,
                  color: 'black',
                }}
              >
                  Login
              </Text>
            </View>
            <View style={{marginTop: 50}}> 
              <View 
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  backgroundColor: 'whitesmoke',
                  color: 'black',
                  paddingVertical: 5,
                  paddingLeft: 5,
                  borderRadius: 5,
                  marginTop: 30,
                }}
              >
                    <TextInput 
                      style={{
                        color: 'gray',
                        marginVertical: 10,
                        // outlineStyle: 'none',
                        width: 300,
                        fontSize: username ? 16 : 16,
                      }}
                      value={username} onChangeText={setUsername} placeholder="Enter the Username" />
              </View>   
            </View>
            <View style={{marginTop: 10}}>
              <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  backgroundColor: 'whitesmoke',
                  paddingVertical: 5,
                  paddingLeft: 5,
                  borderRadius: 5,
                  marginTop: 20,
                  marginBottom: 20
              }}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    style={{
                      // outlineStyle: 'none',
                      color: "gray",
                      marginVertical: 10,
                      width: 300,
                      fontSize: password ? 16 : 16,
                      
                    }}
                    placeholder="Enter your Password"
                  />

              </View>
            </View>


            <TouchableOpacity onPress={handleSignIn} style={{
                  width: 200,
                  backgroundColor: "grey",
                  borderRadius: 6,
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: "auto",
                  padding: 15,
            }}>
                <Text style={{
                  textAlign: "center",
                  color: "white",
                  fontSize: 16,
                  fontWeight: "bold",
                }}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{
                  width: 200,
                  backgroundColor: "grey",
                  borderRadius: 6,
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: 20,
                  padding: 15,
              }} onPress={() => navigation.navigate("SignUp")}>
              <Text style={{
                textAlign: "center",
                color: "white",
                fontSize: 16,
                fontWeight: "bold",
              }}>Create new account</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
  );
}


export default SignIn;