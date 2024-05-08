import React, {useState} from 'react';
import {View, Text, Pressable} from 'react-native'
import tailwind from 'twrnc';

const FootballDetails = ({route}) => {
    const tournament = route.params;
    return (
        <View style={tailwind`flex-1`}>
            <View style={tailwind`flex-row space-between`}>
                <Text>Hello  Football Details</Text>
            </View>
        </View>
    );
}

export default FootballDetails;