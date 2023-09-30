import React, {useState, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {Text, View,TextInput, Pressable, StyleSheet, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  

    const User = ({navigation, setIsAuthenticated}) => {
    const isMobileNumberVerified = useSelector((state) => state.auth.isMobileNumberVerified);
    const [username, setUsername] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');

    const handleAccount = async () => {
      if(isMobileNumberVerified) {
        try {
          const newAccount = {username, mobileNumber, password};
          console.log(newAccount)
          const response = await axios.post('http://192.168.0.105:8080/users', newAccount)
          setIsAuthenticated(true);
          navigation.navigate('Home');
          console.log(response.data);
        } catch (err) {
          console.error('Unable to create account', err);
        }
      } else {
        console.error("Mobile number is not verified");
      }
      
    
    }

    // useEffect(() => {
    //   setMobileNumber(mobileNumberFromRedux);
    // },[mobileNumberFromRedux]);

    return (
        <View style={styles.Container}>
            <Text style={styles.Label} >Username</Text>
            <TextInput style={styles.Input} value={username} onChangeText={setUsername} placeholder="Enter your username" />
            <Text style={styles.Label} >Mobile Number</Text>
            <TextInput style={styles.Input} value={mobileNumber} onChangeText={setMobileNumber} />
            <Text style={styles.Label} >Password</Text>
            <TextInput style={styles.Input} value={password} onChangeText={setPassword} placeholder="Enter your password" />
           <Button onPress={handleAccount}>Submit</Button>
        </View>
    )
};

export default User;

