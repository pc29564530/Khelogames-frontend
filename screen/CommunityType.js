import React, {useState} from 'react';
import {View, Pressable, Text} from 'react-native'
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import tailwind from 'twrnc';

const mainCommunities = ["Football", "Chess", "VolleyBall", "Hockey"];

function CreateCommunityType () {
    const navigation = useNavigation()
    const handleClose = () => {
        navigation.navigate("CreateCommunity")
    }

    const handleSelectCommunity = (communityType) => {
        navigation.navigate("CreateCommunity", {communityType: communityType})
    }

    navigation.setOptions({
        headerTitle: 'Community Type',
        headerStyle:{
            backgroundColor:'black'
        },
        headerTintColor:'white'
    });

    return(
    <View style={tailwind`flex-1 bg-black`}>
      <View style={tailwind`mt-4`}>
        {mainCommunities.map((item, index) => (
          <Pressable key={index} style={tailwind`py-2 px-4`} onPress={() => handleSelectCommunity(item)}>
            <Text style={tailwind`text-white text-xl`}>{item}</Text>
          </Pressable>
        ))}
      </View>
    </View>
    );
}

export default CreateCommunityType;