import React, {useState, useEffect} from 'react';
import {View, TextInput, Button, StyleSheet, Image, Text, KeyboardAvoidingView} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addComments, setComments, setCommentText } from '../redux/actions/actions';
import { useSelector, useDispatch } from 'react-redux';
import useAxiosInterceptor from './axios_config';
const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');

function Comment({threadId}) {
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const comments = useSelector((state) => state.comments.comments)
    const commentText = useSelector((state) => state.comments.commentText)


    const handleReduxSubmit = async () => {
        try {
            const authToken =  await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.post(`http://192.168.0.107:8080/createComment/${threadId}`, {commentText}, {
                headers: { 
                    'Authorization': `Bearer ${authToken}`,
                    'content-type': 'application/json'
                }
            })
            dispatch(addComments(response.data));

        } catch (e) {
            console.error(e);
        }
    }

    //Implementing redux
    const fetchThreadComments = async () => {
          try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`http://192.168.0.107:8080/getComment/${threadId}`, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            });
      
            const commentsData = response.data;
            console.log(commentsData)
            if(commentsData === null || commentsData === undefined){
                dispatch(setComments([]));
            } else {
                dispatch(setComments(response.data));
            }
          } catch (error) {
            console.error('Error fetching comments:', error);
          }
      };
      

    useEffect(() => {
            fetchThreadComments();   
    }, []);

    return (
        <View style={styles.Container}>
            <View style={styles.SubcontainerDisplay}>
                {comments.map((item, i) => (
                    <View  style={styles.CommentBox} key={i}>
                        <View style={styles.CommentHeader}> 
                            <Image style={styles.UserAvatar} source={logoPath} />
                            <Text>{item.owner}</Text>
                        </View>
                        <View style={styles.Comment}>
                            <Text style={styles.CommentText}>{item.comment_text}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    CommentBox: {
        flex:1,
        padding: 10,
        margin:5,
        width: '100%',
        backgroundColor: 'lightgrey'

    },
    CommentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    Container: {
        flex:1,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'left',
        paddingTop: 10,
    },
    SubcontainerEdit: {
        position:'static',
      alignItems: 'left',
      paddingBottom: 20,
      paddingTop: 20,
      bottom: 0,
      width: '100%',
      height: 50, 
      zIndex: 10,  
    },
    SubcontainerDisplay:{
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        paddingBottom: 20,
        paddingTop: 20,
    },
    UserAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
    },
    CommentText: {
        fontSize: 16,
        color: 'black',
    }
    
  });

export default Comment;