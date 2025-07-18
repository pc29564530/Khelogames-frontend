import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tailwind from 'twrnc';

const CricketBowlingScorecard = ({
  bowling,
  convertBallToOvers,
}) => {
  return (
    <View style={tailwind`bg-white shadow-lg rounded-lg overflow-hidden`}>
      {/* Header */}
      <View style={tailwind`flex-row justify-between px-4 py-2`}>
        <Text style={tailwind`flex-1 text-md text-gray-700`}>Bowler</Text>
        <View style={tailwind`flex-row flex-[3] justify-between`}>
          <Text style={tailwind`w-8 text-md text-gray-700 text-center`}>O</Text>
          <Text style={tailwind`w-8 text-md text-gray-700 text-center`}>R</Text>
          <Text style={tailwind`w-8 text-md text-gray-700 text-center`}>W</Text>
          <Text style={tailwind`w-8 text-md text-gray-700 text-center`}>WD</Text>
          <Text style={tailwind`w-8 text-md text-gray-700 text-center`}>NB</Text>
        </View>
      </View>

      {/* Bowling Data */}
      {bowling?.map((item, index) => (
        <View
          key={index}
          style={tailwind`flex-row justify-between px-4 py-2  ${item.is_current_bowler ? 'bg-red-100' : 'bg-white'}`}
        >
            <View style={tailwind``}>
                <View style={tailwind`flex-row`}>
                  <Text style={tailwind`text-md text-gray-700`}>{item?.player?.name}</Text>
                  {item.is_current_bowler && <Text style={tailwind`text-md text-gray-700`}>*</Text>}
                </View>
            </View>
          <View style={tailwind`flex-row justify-between`}>
            <Text style={tailwind`w-8 text-md text-gray-800 text-center`}>
              {convertBallToOvers(item.ball)}
            </Text>
            <Text style={tailwind`w-8 text-md text-gray-800 text-center`}>{item.runs}</Text>
            <Text style={tailwind`w-8 text-md text-gray-800 text-center`}>{item.wickets}</Text>
            <Text style={tailwind`w-8 text-md text-gray-800 text-center`}>{item.wide}</Text>
            <Text style={tailwind`w-8 text-md text-gray-800 text-center`}>{item.no_ball}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default CricketBowlingScorecard;