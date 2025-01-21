import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tailwind from 'twrnc';

const CricketWicketCard = ({
  wicketsData,
  convertBallToOvers,
}) => {
  return (
    <View style={tailwind`bg-white shadow-md rounded-lg overflow-hidden `}>
      <View style={tailwind`flex-row justify-between p-3`}>
        <Text style={tailwind`text-sm  text-gray-700`}>Wkt No.</Text>
        <Text style={tailwind`text-sm text-gray-700`}>Player</Text>
        <Text style={tailwind`text-sm  text-gray-700`}>Score</Text>
        <Text style={tailwind`text-sm  text-gray-700`}>Over</Text>
      </View>
      {wicketsData?.map((item, index) => (
        <View
          key={index}
          style={tailwind`flex-row justify-between p-3 ${
            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
          }`}
        >
          <Text style={tailwind`text-sm text-gray-800 `}>{item.wicketNumber}</Text>
          <Text style={tailwind`text-sm text-gray-800 `}>{item.batsman.name}</Text>
          <Text style={tailwind`text-sm text-gray-800 `}>
            {item.score}-{item.wicketNumber}
          </Text>
          <Text style={tailwind`text-sm text-gray-800 `}>
            {convertBallToOvers(item.Overs)}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default CricketWicketCard;
