import React, { useEffect } from 'react';
import {View} from 'react-native';
import useAxiosInterceptor from './axios_config';
import {useSelector, useDispatch} from 'react-redux';
import tailwind from 'twrnc';
import ThreadItem from '../components/ThreadItems';
import { handleLikes, handleThreadComment, handleUser } from '../utils/ThreadUtils';
import {getAllThreadServices} from '../services/threadsServices';

const Thread = () => {
    const dispatch = useDispatch();
    const threads = useSelector((state) => state.threads.threads)
    
    useEffect(() => {
      
      const fetchData = () => {
          getAllThreadServices({dispatch: dispatch})
      };
      fetchData();
    }, []); 

  
    return (
        <View style={tailwind`flex-1 bg-white`} vertical={true}>
            {threads.map((item) => (
              <ThreadItem
                key={item.public_id}
                item={item}
                handleUser={handleUser}
                handleLikes={handleLikes}
                handleThreadComment={handleThreadComment}
              />
            ))}
        </View>
    );
  };

export default Thread;
