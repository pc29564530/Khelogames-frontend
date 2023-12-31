import React, {useState, useEffect} from 'react';
import {View, TextInput, Button, StyleSheet, Image, Text, KeyboardAvoidingView} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setComments, setCommentText } from '../redux/actions/actions';
import { useSelector, useDispatch } from 'react-redux';
import useAxiosInterceptor from './axios_config';
import tailwind from 'twrnc';

function Comment({thread}) {
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const comments = useSelector((state) => state.comments.comments)
    const [commentWithProfile, setCommentWithProfile] = useState([]);
    const [displayText, setDisplayText] = useState('');


    //Implementing redux
    const fetchThreadComments = async () => {
          try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axiosInstance.get(`http://10.0.2.2:8080/getComment/${thread.id}`, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            });

            const threadComment = response.data;
            const itemComment = threadComment.map(async (item,index) => {
                const profileResponse = await axiosInstance.get(`http://10.0.2.2:8080/getProfile/${item.owner}`);
                if (!profileResponse.data.avatar_url || profileResponse.data.avatar_url === '') {
                    const usernameInitial = profileResponse.data.owner ? profileResponse.data.owner.charAt(0) : '';
                        setDisplayText(usernameInitial.toUpperCase());
                    } else {
                        setDisplayText(''); // Reset displayText if the avatar is present
                    }
                    return {...item, profile: profileResponse.data}
                })
            
            const commentData = await Promise.all(itemComment)

            if(commentData === null || commentData === undefined){
                setCommentWithProfile([]);
                dispatch(setComments([]));
            } else {
                setCommentWithProfile(commentData)
                dispatch(setComments(commentData));
                dispatch(setCommentText(''))
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
                {comments?.map((item, i) => (
                    <View  style={tailwind`p-4 m-2 w-full bg-black`} key={i}>
                        <View style={tailwind`flex-row items-center`}>
                            {item.profile && item.profile.avatar_url ? (
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