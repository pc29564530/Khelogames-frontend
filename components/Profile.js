import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Image, StyleSheet, Pressable, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';

function ProfilePage() {

    const route = useRoute();
    const navigation = useNavigation();
    // const [fullName, setFullName] = useState('');
    // const [bio, setBio] = useState();
    // const [followerCount, setFollowerCount] = useState();
    // const [followingCount, setFollowingCount] = useState();
    const [avatarUrl, setAvatarUrl] = useState('');
    const [profileData, setProfileData] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    const username = route.params?.name;
    console.log(username)
    const handleEditProfile = () => {
        console.log("Linte no 18")
      navigation.navigate('EditProfile') // Set the state to indicate that editing mode is active
      console.log("line no 20")
    };

    const updateAvatar =  async () => {

      try {
          const authToken = await AsyncStorage.getItem('AccessToken');
          const response = await axiosInstance.put('http://192.168.0.102:8080/updateAvatarUrl', {avatar_url: avatarUrl}, {
              headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
              }
          })

          let options = { 
              noData: true,
              mediaType: 'image',
          }
      
              launchImageLibrary(options, async (res) => {
              
                  if (res.didCancel) {
                      console.log('User cancelled photo picker');
                  } else if (res.error) {
                      console.log('ImagePicker Error: ', response.error);
                  } else {
                      const type = getMediaTypeFromURL(res.assets[0].uri);
                      
                      if(type === 'image') {
                      const base64File = await fileToBase64(res.assets[0].uri);
                      setMediaURL(base64File)
                      setMediaType(type);
                      } else {
                      console.log('unsupported media type:', type);
                      }
                  }
              });
      } catch (e) {
          console.error("unable to load image");
      }
      
  }

  useEffect(() => {
    const fetchData = async () => {
        try {
          const owner = await AsyncStorage.getItem('User')
          if (!owner) {
            console.log("User not found in AsyncStorage.");
            return;
        }
          console.log("User: ", owner)
          const response = await axios.get(`http://192.168.0.102:8080/getProfile/${owner}`)
          console.log(response.data)
          setProfileData(response.data);
        } catch(e) {
          console.error("unable to fetch the profile details", e)
        }
    }
    fetchData();
  }, [])

    return(
        <View style={styles.Container}>
            <View style={styles.SubContainer}>
                <View style={styles.UserDetailsLeft}>
                  <View>
                        <Image style={styles.UserAvatar}  source={profileData.avatar_url}/> 
                  </View>
                        <Text>{profileData.full_name}</Text>
                        <Text>{profileData.owner}</Text>
                        <Text>{profileData.bio}</Text>
                </View>
                <View style={styles.UserDetailsRight}>
                    <Pressable>
                        <Text>Follow</Text>
                    </Pressable>
                    <Pressable onPress={handleEditProfile}>
                        <Text style={styles.EditButton} >Edit Profile</Text>
                    </Pressable>
                </View>
            </View>
            
        </View>
    );
}
const styles = StyleSheet.create({
  Container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
},
SubContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
},
UserDetailsLeft: {
    flex: 1,
    alignItems: 'flex-start',
},
UserDetailsRight: {
    flex: 1,
    alignItems: 'flex-end',
},
UserAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 8,
    backgroundColor: 'orange'
},
Title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
},
Text: {
    fontSize: 20,
    marginBottom: 5,
},
EditButton: {
    fontSize: 18,
    color: 'blue',
},
UpdateAvatar: {
    flexDirection: 'row',
    alignItems: 'center',
},
AddAvatar: {
  margin: 5,
  position: "absolute",
  top: 0,
  left: 0,
  width: 25,
  height: 25,
  color: "grey",
  borderRadius:50,
  borderWidth:1,
  padding:5,
  backgroundColor: 'whitesmoke'
}
});

export default ProfilePage