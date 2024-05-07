import React, { useEffect } from 'react';
import {View} from 'react-native';
import useAxiosInterceptor from './axios_config';
import {useSelector, useDispatch} from 'react-redux';
import tailwind from 'twrnc';
import ThreadItem from '../components/ThreadItems';
import { handleLikes, handleThreadComment, handleUser } from '../utils/ThreadUtils';
import {getAllThreadServices} from '../services/threadsServices';

const Thread = () => {
    const axiosInstance = useAxiosInterceptor();
    const dispatch = useDispatch();
    const threads = useSelector((state) => state.threads.threads)
    const likesCount = useSelector((state) => state.Like)
    
    useEffect(() => {
      
      const fetchData = () => {
          getAllThreadServices({dispatch: dispatch, axiosInstance: axiosInstance})
      };
      fetchData();
    }, []); 

  
    return (
        <View style={tailwind`flex-1 bg-black`} vertical={true}>
            {threads.map((item,i) => (
              <ThreadItem
                key={i}
                item={item}
                handleUser={handleUser}
                handleLikes={handleLikes}
                handleThreadComment={handleThreadComment}
                axiosInstance={axiosInstance}
              />
            ))}
        </View>
    );
  };

export default Thread;
