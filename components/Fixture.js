import React from 'react';
import { View, Text } from 'react-native';
import tailwind from 'twrnc';

const Fixture = () => {
    return (
        <View style={tailwind`justify-center, items-center mt-4 `}>
            <Text style={tailwind`text-lg`}>No fixtures available at the moment.</Text>
        </View>
    );
}

export default Fixture;