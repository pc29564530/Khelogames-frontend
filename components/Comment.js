import React, {useState, useEffect} from 'react';
import {View, TextInput, Button, StyleSheet, Image, Text} from 'react-native-web';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addComments, setComments } from '../redux/actions/actions';
import { useSelector, useDispatch } from 'react-redux';

function Comment({threadId}) {
    const dispatch = useDispatch();
    const [commentText, setCommentText] = useState('');
    // const [threadComment, setThreadComment] = useState([]);
    const comments = useSelector((state) => state.comments.comments)
    // console.log(comments)
    const handleSubmit = async () => {
        try {

            const text = {
                commentText: commentText,
            }
            const authToken =  await AsyncStorage.getItem('AccessToken');
            const response = await axios.post(`http://localhost:8080/createComment/${threadId}`,text, {
                headers: { 
                    'Authorization': `Bearer ${authToken}`,
                    'content-type': 'application/json'
                }
            })
            setCommentText(response.data.comment_text);
        } catch (e) {
            console.error(e);
        }
    }

    const handleReduxSubmit = async () => {
        try {
            const text = comments.comment_text;
            const authToken =  await AsyncStorage.getItem('AccessToken');
            const response = await axios.post(`http://localhost:8080/createComment/${threadId}`,text, {
                headers: { 
                    'Authorization': `Bearer ${authToken}`,
                    'content-type': 'application/json'
                }
            })
            dispatch(addComments(response.data))

        } catch (e) {
            console.error(e);
        }
    }

    // const fetchThreadComment = async () => {
    //     try {
    //         const authToken = await AsyncStorage.getItem('AccessToken');
    //         const response = await axios.get(`http://localhost:8080/getComment/${threadId}`, {
    //             headers: {
    //                 'Authorization': `Bearer ${authToken}`,
    //                 'Content-Type': 'application/json'
    //             }
    //         })
    //         if(response.data === null) {
    //             setThreadComment([]);
    //         } else {
    //             setThreadComment(response.data);
    //         }
            
    //     } catch (e) {
    //         console.error(e);
    //     }
    // }

    //Implementing redux
    const fetchThreadComments = async () => {
          try {
            const authToken = await AsyncStorage.getItem('AccessToken');
            const response = await axios.get(`http://localhost:8080/getComment/${threadId}`, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            });
      
            const commentsData = response.data;
            if(commentsData === null || commentsData === undefined){
                return null;
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
        <View style={styles.container}>
            <View style={styles.subcontainerEdit}>
                <TextInput 
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder="Write a comment..."
                />
                <Button title="Submit" onPress={handleReduxSubmit}/>
            </View>
            <View style={styles.subcontainerDisplay}>
                {comments.map((item, i) => (
                    <View  style={styles.commentBox} key={i}>
                        <View style={styles.commentHeader}> 
                            <Image style={styles.userAvatar} source='/home/pawan/Pictures' />
                            <Text>{item.owner}</Text>
                        </View>
                        <View style={styles.comment}>
                            <Text style={styles.commentText}>{item.comment_text}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    commentBox: {
        padding: 10,

    },
    commentHeader: {
        flexDirection: 'column',
        justifyContent: 'space-between'
    },

    container: {
      paddingTop: '10px',
      width: '100%',
      aspectRatio: 10/3,
      justifyContent: 'space-between',
      alignItems: 'left',
    },
    subcontainerEdit: {
        paddingTop: '20px',
        alignItems: 'left',
        paddingBottom: '20px',
    },
    subcontainerDisplay:{
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        paddingBottom: '20px',
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: 'grey',
      },
    
  });

export default Comment;