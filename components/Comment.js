import React, {useEffect} from 'react';
import {View, Image, Text} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '../screen/axios_config';
import tailwind from 'twrnc';
import { getThreadComment } from '../services/commentServices';

function Comment({thread}) {
    
    const dispatch = useDispatch();
    const comments = useSelector((state) => state.comments.comments);
    //Implementing redux
    const fetchThreadComments = async () => {
        await getThreadComment({dispatch: dispatch, threadPublicID: thread.public_id})
    };

    useEffect(() => {
        fetchThreadComments();   
    }, []);

    return (
        <View style={tailwind`flex-1 bg-white`}>
            <View style={tailwind`flex-1 items-center p-1`}>
                {comments.length > 0 ? comments?.map((item, i) => (
                    <View  style={tailwind`p-2 m-0.5 w-full`} key={i}>
                        <View style={tailwind`flex-row`}>
                            {item.profile && item.profile.avatar_url ? (
                                <Image  style={tailwind`w-10 h-10 rounded-full mr-2 bg-red-400`} source={{uri: item.profile.avatar_url}} />
                            ): (
                                <View style={tailwind`w-10 h-10 rounded-12 bg-red-400 items-center justify-center`}>
                                    <Text style={tailwind`text-black text-6x3`}>
                                    {item.displayText}
                                    </Text>
                              </View>
                            )}
                            <View style={tailwind`px-2 w-75`}>
                                <Text style={tailwind`text-black font-bold text-4x2`}>{item.profile?.full_name}</Text>
                                <Text style={tailwind`text-black font-bold`}>@{item.profile.username}</Text>
                                <Text style={tailwind`text-base text-black mt-4`}>{item.comment_text}</Text>
                                <View style={tailwind`border-b border-white mt-2 w-100`}></View>
                            </View>
                        </View>                        
                    </View>
                )) : (
                    <View style={tailwind`flex-1 items-center p-1`}>
                        <Text style={tailwind`text-xl text-gray`}>No Comment</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

export default Comment;