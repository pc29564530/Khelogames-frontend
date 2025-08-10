import React from 'react';
import {View, Text, Pressable, Image} from 'react-native';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';

const UserComponent = ({profile, handleUser}) => {
    const navigation = useNavigation();
    const displayText = !profile.avatar_url || profile.avatar_url === '' ? profile.username.charAt(0).toUpperCase() : '';
    return (
        <Pressable style={tailwind`flex-row items-center p-2`} onPress={() => handleUser({profilePublicID: profile.public_id, navigation})}>
            {profile.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={tailwind`w-12 h-12 aspect-w-1 aspect-h-1 rounded-full bg-white`} />
            ) : (
                <View style={tailwind`w-12 h-12 rounded-12 bg-white items-center justify-center`}>
                <Text style={tailwind`text-red-500 text-6x3`}>{displayText}</Text>
                </View>
            )}
            <View style={tailwind`ml-3`}>
                <Text style={tailwind`font-bold text-white`}>{profile.full_name}</Text>
                <Text style={tailwind`text-white`}>@{profile.username}</Text>
            </View>
        </Pressable>
    );
}

export default UserComponent;