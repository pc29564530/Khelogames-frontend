import React from 'react';
import {View, Text} from 'react-native';
import tailwind from 'twrnc';

const Stats = () => {
    return (
        <View style={tailwind`justify-center, items-center mt-4 `}>
            <Text style={tailwind`text-lg`}>No Stats available at the moment.</Text>
        </View>
    );
}

export default Stats;