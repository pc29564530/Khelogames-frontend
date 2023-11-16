import React, {useState, useEffect} from 'react';
import {View, TextInput, Button, StyleSheet, Image, Text, KeyboardAvoidingView} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addComments, setComments, setCommentText } from '../redux/actions/actions';
import { useSelector, useDispatch } from 'react-redux';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';
const  logoPath = require('/Users/pawan/project/Khelogames-frontend/assets/images/Khelogames.png');

function Comment({thread}) {
    console.log("Thread ID: ", thread)
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const comments = useSelector((state) => state.comments.comments)
    const commentText = useSelector((state) => state.comments.commentText)
    const [commentWithProfile, setCommentWithProfile] = useState([]);
    const [displayText, setDisplayText] = useState('');


    //Implementing redux
    const fetchThreadComments = async () => {
          try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            console.log("Line no 38 ", authToken)
            console.log("Thread: ", thread);
            console.log("ThreadId Line no 42: ", thread.id)
            const response = await axiosInstance.get(`http://192.168.0.103:8080/getComment/${thread.id}`, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            });
            console.log("Comment: ", response.data)

            const threadComment = response.data;
            const itemComment = threadComment.map(async (item,index) => {
                console.log("Line no 52: ", item)
                const profileResponse = await axiosInstance.get(`http://192.168.0.103:8080/getProfile/${item.owner}`);
                if (!profileResponse.data.avatar_url || profileResponse.data.avatar_url === '') {
                    const usernameInitial = profileResponse.data.owner ? profileResponse.data.owner.charAt(0) : '';
                        setDisplayText(usernameInitial.toUpperCase());
                    } else {
                        setDisplayText(''); // Reset displayText if the avatar is present
                    }
                    return {...item, profile: profileResponse.data}
                })
            
            const commentData = await Promise.all(itemComment)
      
            // const commentsData = response.data;
            console.log(commentData)
            if(commentData === null || commentData === undefined){
                setCommentWithProfile([]);
                dispatch(setComments([]));
            } else {
                setCommentWithProfile(commentData)
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
        <View style={tailwind`flex-1 bg-black`}>
            <View style={tailwind`flex-1 items-center p-1`}>
                {commentWithProfile?.map((item, i) => (
                    <View  style={tailwind`p-4 m-2 w-full bg-black`} key={i}>
                        <View style={tailwind`flex-row items-center`}>
                            {item.profile.avatar_url ? (
                                <Image  style={tailwind`w-12 h-12 rounded-full mr-2 bg-white`} source={{uri: item.profile.avatar_url}} />
                            ): (
                                <View style={tailwind`w-12 h-12 rounded-12 bg-white items-center justify-center`}>
                                    <Text style={tailwind`text-red-500 text-6x3`}>
                                    {displayText}
                                    </Text>
                              </View>
                            )}
                            <Text style={tailwind`text-white font-bold`}>@{item.owner}</Text>
                        </View>
                        <View style={tailwind`p-2 pl-10`}>
                            <Text style={tailwind`text-base text-white`}>{item.comment_text}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default Comment;