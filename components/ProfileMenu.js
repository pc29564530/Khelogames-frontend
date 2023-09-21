// import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, Modal, StyleSheet, TouchableOpacity, Image} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import useAxiosInterceptor from './axios_config';
import axios from 'axios';
import FollowButton from './FollowButton';
import {useDispatch} from 'react-redux';
import {logout,setAuthenticated} from '../redux/actions/actions';
// import { Avatar } from '@mui/material';


function ProfileMenu(){
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [follow, setFollow] = useState(false);
  // const axiosInstance = useAxiosInterceptor();

    const [showLogoutButton, setShowLogoutButton] = useState(false)
    const [currentUser, setCurrentUser] = useState('');
    
    const route = useRoute();
    const user  = route.params?.username
    const handleLogout =  () => {
        try {
            dispatch(logout());
            navigation.navigate('SignIn');
            
        } catch (err) {
            console.log('Failed to logout', err);
        }
    }

    const handleFollow = async () => {
      try {
        console.log('Starting server')
        const authToken = await AsyncStorage.getItem('AccessToken');
        //when connection exists there is no button 
        const response = await axios.post(`http://localhost:8080/create_follow/${user}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })
        setFollow(true);
        console.log(response.data)
      } catch (err) {
        console.error(err)
      }
    }

    const handleUnFollow = async () => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axiosInstance.delete(`http://localhost:8080/unFollow/${user}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })
        setFollow(false);
        console.log(response.data);

      } catch (err) {
        console.error(err);
      }
    }

    useEffect(() =>{     
        const verifyUser = async () => {
        const authUser = await AsyncStorage.getItem("User");
        if(user===undefined) {
          setShowLogoutButton(true);
          setCurrentUser(authUser);
        } else {
          setCurrentUser(user);
        }
      }
      verifyUser();
    }, [user])

    
    return (
        <View style={styles.container}>
              <View style={styles.profileHeader}>
                <Image style={styles.userAvatar} source='/home/pawan/Pictures' />
                <Text style={styles.fullName}>{currentUser}</Text>
                <Text style={styles.username}>@{currentUser}</Text>
                <View style={styles.followRow}>
                  <Text style={styles.followRowText}>0 Followers</Text>
                  <Text style={styles.followRowText}> | </Text>
                  <Text style={styles.followRowText}>0  Following</Text>
                  <Text style={{
                      borderBottomColor: 'black',
                      borderBottomWidth: 'StyleSheet.hairlineWidth',
                    }}
                  />
                </View>
              </View>
              { showLogoutButton?(
                <TouchableOpacity onPress={() => handleLogout()} style={styles.logoutButton}>
                  <Text style={styles.logout}>Logout</Text>
                </TouchableOpacity>
                 ):(
                  <FollowButton isFollowing={follow} onPress={follow ? handleUnFollow : handleFollow} />
                )
              } 
        </View>
    );
}

const styles = StyleSheet.create({
    fullName: {
      paddingTop: 20,
      fontSize: 24, 
      fontWeight: 'bold',
    },
    username: {
      fontSize: 20,
      paddingBottom: 20
    },
    profileHeader: {
      paddingBotton: 20,
      marginBottom: 20
    },
    followRowText: {
      fontSize: 16
    },
    profileHeaderText: {
      fontSize: 20
    },
    followRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignContent: 'center',
      alignItems: 'center',

    },
    container: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      color: 'grey',
      fontWeight: '500',
      marginTop: 30,
    },
    logout: {
      fontSize: 15,
      color: 'white',
      fontWeight: '500',
    },
    logoutButton: {
      backgroundColor: 'grey',
      padding: 12,
      borderRadius: 20,
      width: '90%',
      alignItems: 'center',
      marginBottom: 30,
    },
    followButton: {
      backgroundColor: 'grey',
      padding: 12,
      borderRadius: 20,
      width: '34%',
      alignItems: 'center',
      // marginBottom: 30,
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: 'grey',
    },
  });
  

export default ProfileMenu;