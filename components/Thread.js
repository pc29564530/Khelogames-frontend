import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, Image, Pressable, SafeAreaView, ScrollView} from 'react-native';
import axios from 'axios';
import AsyncStorage  from '@react-native-async-storage/async-storage'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ReplyIcon from '@mui/icons-material/Reply';
import Comment from './Comment';


const Thread = ({navigation}) => {
    const [data, setData] = useState([]);
    const [showComment, setShowComment] = useState({});

    const handleComment = (id) => {
    
        setShowComment(prevState => ({ ...prevState, [id]: !prevState[id]}));
    }

    const handleLikes = async (id) => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await fetch(`http://localhost:8080/update_like/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        } );
        const item = response.json();
        console.log(item);
      } catch (error) {
        console.error(error);
      }

    }

    const fetchData = async () => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await axios.get('http://localhost:8080/all_threads', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
  
        // const item = await response.json();
        const item = response.data;
        if(item.length == 0){
          navigation.replace('CreateThread');
        }
        console.log(item)
        setData(item);
      } catch (err) {
        console.error(err);
      }
    };
  
    useEffect(() => {
      fetchData();
    }, []);
  
    return (
      <View style={styles.threadContainer}>
        {/* <ScrollView> */}
        <View style={styles.subcontainer}>
            {data.map((item,i) => (
                <View key={i} style={styles.singleItem}>
                <View style={styles.threadHeader}>
                <Image style={styles.userAvatar} source='/home/pawan/Pictures' />
                <View style={styles.userInfo}>
                  <Text style={styles.username}>{item.username}</Text>
                  <Text style={styles.timestamp}>{item.timestamp}</Text>
                </View>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.content}>{item.content}</Text>
              {/* {item.media_url &&  */}
              <Image style={styles.threadImage} source={item.media_url}/>
              <View style={styles.actions}>
                <Pressable style={styles.likeButton} onPress={() => handleLikes(item.id)}>
                  <ThumbUpAltIcon style={styles.likeIcon} />
                  <Text style={styles.likeText}>{item.like_count} Likes</Text>
                </Pressable>
                <Pressable style={styles.likeButton} onPress={() => handleComment(item.id)}>
                    <ReplyIcon style={styles.likeIcon}/>  
                </Pressable>
                {/* Add more actions/buttons here */}
              </View>
              {showComment[item.id] &&  <Comment  threadId = {item.id} /> }
              </View>
              
              ))}
            {/* </ScrollView> */}
            
        </View>
          
      </View>
    );
  };
  

  const styles = StyleSheet.create({
    threadContainer: {
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 16,
      marginBottom: 16,
      elevation: 2,
    },
    singleItem: {
      backgroundColor:'whitesmoke',
      borderRadius: 10,
      padding: 16,
      marginBottom: 16,
      elevation: 5,
    },
    threadHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: 'grey',
    },
    userInfo: {
      flex: 1,
    },
    username: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    timestamp: {
      fontSize: 12,
      color: 'gray',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    content: {
      fontSize: 16,
      marginBottom: 8,
    },
    threadImage: {
      width: 40,
      height: 40,
      borderRadius: 8,
      marginBottom: 8,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    likeButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    likeIcon: {
      marginRight: 4,
    },
    likeText: {
      fontSize: 14,
      color: 'gray',
    },
  });

export default Thread;