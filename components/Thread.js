import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import axios from 'axios';
import AsyncStorage  from '@react-native-async-storage/async-storage'


const Thread = ({navigation}) => {
    const [data, setData] = useState([]);
  
    const fetchData = async () => {
      try {
        const authToken = await AsyncStorage.getItem('AccessToken');
        const response = await fetch('http://localhost:8080/all_threads', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
  
        const item = await response.json();
        if(item.length == 0){
          navigation.replace('CreateThread');
        }
        setData(item);
      } catch (err) {
        console.error(err);
      }
    };
  
    useEffect(() => {
      fetchData();
    }, []);
  
    return (
      <View>
        <Text>Hello Threads </Text>
        {data.map((item, i) => (
          <View key={i} style={styles.threadBox}>
            <Text style={styles.titleHead}>{item.title}</Text>
            <Text style={styles.bodyBox}>{item.content}</Text>
            <Image style={styles.imageBox} source={item.media_url} />
          </View>   
        ))}
      </View>
    );
  };
  

const styles = StyleSheet.create({
    threadBox: {
     margin: 20,
     borderRadius: 5,
     borderColor: 'black',
    },
    titleHead: {
      padding: 20,
      fontSize: 16,
    },
    bodyBox: {
        fontSize: 14,
    },
    imageBox: {
      width:40,
      height:40,
    }
  });

export default Thread;