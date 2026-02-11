import React, {useEffect} from 'react';
import {View, ScrollView, Pressable, Text} from 'react-native';
import Thread from './Thread';
import { useNavigation} from '@react-navigation/native';
import tailwind from 'twrnc';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

function Home() {
  const navigation = useNavigation();
  return (
    <>
      <ScrollView style={tailwind`flex-1 bg-gray-50`}>
          {/* <View style={tailwind`flex-row px-4 py-3 bg-white border-b border-gray-100`}>
            <Pressable style={tailwind`px-5 py-2 bg-red-500 rounded-full mr-3`}>
              <Text style={tailwind`text-white text-sm font-semibold`}>Explore</Text>
            </Pressable>
            <Pressable style={tailwind`px-5 py-2 bg-gray-100 rounded-full`}>
              <Text style={tailwind`text-gray-600 text-sm font-semibold`}>Live</Text>
            </Pressable>
          </View> */}
          <Thread />
      </ScrollView>
      <View style={tailwind`absolute bottom-14 right-5`}>
          <Pressable
            style={[tailwind`p-3.5 bg-red-400 rounded-2xl`, {shadowColor: '#f87171', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6}]}
            onPress={() => navigation.navigate("CreateThread")}
          >
              <MaterialIcons name="add" size={24} color="white" />
          </Pressable>
      </View>
    </>
    );  
}

export default Home;