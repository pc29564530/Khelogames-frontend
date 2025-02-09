import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tailwind from 'twrnc';

const CricketWicketCard = ({
  wickets,
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
      {wickets?.map((item, index) => (
        <View
          key={index}
          style={tailwind`flex-row justify-between p-3 ${
            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
          }`}
        >
          <Text style={tailwind`text-sm text-gray-800 `}>{item.wicket_number}</Text>
          <Text style={tailwind`text-sm text-gray-800 `}>{item?.batsman_player?.name}</Text>
          <Text style={tailwind`text-sm text-gray-800 `}>
            {item.score}-{item.wicket_number}
          </Text>
          <Text style={tailwind`text-sm text-gray-800 `}>
            {convertBallToOvers(item.ball_number)}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default CricketWicketCard;
