import React from 'react';
import { View, Text } from 'react-native';
import tailwind from 'twrnc';

const CricketBowlingScorecard = ({
  bowling,
  convertBallToOvers,
}) => {
  return (
    <View style={[tailwind`rounded-lg overflow-hidden`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
      {/* Header */}
      <View style={[tailwind`flex-row justify-between px-4 py-2`, {borderBottomWidth: 1, borderColor: '#334155'}]}>
        <Text style={[tailwind`flex-1 text-md`, {color: '#94a3b8'}]}>Bowler</Text>
        <View style={tailwind`flex-row flex-[3] justify-between`}>
          <Text style={[tailwind`w-8 text-md text-center`, {color: '#94a3b8'}]}>O</Text>
          <Text style={[tailwind`w-8 text-md text-center`, {color: '#94a3b8'}]}>R</Text>
          <Text style={[tailwind`w-8 text-md text-center`, {color: '#94a3b8'}]}>W</Text>
          <Text style={[tailwind`w-8 text-md text-center`, {color: '#94a3b8'}]}>WD</Text>
          <Text style={[tailwind`w-8 text-md text-center`, {color: '#94a3b8'}]}>NB</Text>
        </View>
      </View>

      {/* Bowling Data */}
      {bowling?.map((item, index) => (
        <View
          key={index}
          style={[
            tailwind`flex-row justify-between px-4 py-2`,
            {backgroundColor: item.is_current_bowler ? '#f8717120' : '#1e293b', borderTopWidth: index === 0 ? 0 : 1, borderColor: '#334155'}
          ]}
        >
          <View style={tailwind`flex-1`}>
            <View style={tailwind`flex-row`}>
              <Text style={[tailwind`text-md`, {color: '#f1f5f9'}]}>{item?.player?.name}</Text>
              {item.is_current_bowler && <Text style={[tailwind`text-md font-bold ml-1`, {color: '#f87171'}]}>*</Text>}
            </View>
          </View>
          <View style={tailwind`flex-row flex-[3] justify-between`}>
            <Text style={[tailwind`w-8 text-md text-center`, {color: '#f1f5f9'}]}>
              {convertBallToOvers(item.ball_number)}
            </Text>
            <Text style={[tailwind`w-8 text-md text-center`, {color: '#f1f5f9'}]}>{item.runs}</Text>
            <Text style={[tailwind`w-8 text-md text-center`, {color: '#f1f5f9'}]}>{item.wickets}</Text>
            <Text style={[tailwind`w-8 text-md text-center`, {color: '#f1f5f9'}]}>{item.wide}</Text>
            <Text style={[tailwind`w-8 text-md text-center`, {color: '#f1f5f9'}]}>{item.no_ball}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default CricketBowlingScorecard;
