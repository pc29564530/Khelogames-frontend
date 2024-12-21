import React, {useState} from 'react';
import {View, Pressable, Text} from 'react-native'
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import tailwind from 'twrnc';

const mainCommunities = ["Football", "Chess", "VolleyBall", "Hockey"];

function CreateCommunityType () {

    const navigation = useNavigation();
    const handleSelectCommunity = (communityType) => {
        navigation.navigate("CreateCommunity", {communityType: communityType})
    }

    navigation.setOptions({
        headerTitle: 'Community Type',
        headerStyle:{
            backgroundColor:tailwind.color('bg-red-400')
        },
        headerTintColor:'white'
    });

    return(
      <View style={tailwind`flex-1 bg-white`}>
        <View style={tailwind`mt-4`}>
          {mainCommunities.map((item, index) => (
            <Pressable key={index} style={tailwind`py-2 px-4`} onPress={() => handleSelectCommunity(item)}>
              <Text style={tailwind`text-black text-xl`}>{item}</Text>
              <View style={tailwind`h-0.4 w-full bg-gray-200`}></View>
            </Pressable>
          ))}
        </View>
      </View>
    );
}

export default CreateCommunityType;