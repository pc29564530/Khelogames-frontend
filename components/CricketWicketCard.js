import React from 'react';
import { View, Text } from 'react-native';
import tailwind from 'twrnc';

const CricketWicketCard = ({
  wickets,
  convertBallToOvers,
}) => {
  return (
    <View style={[tailwind`rounded-lg overflow-hidden`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
      <View style={[tailwind`flex-row justify-between p-3`, {borderBottomWidth: 1, borderColor: '#334155'}]}>
        <Text style={[tailwind`text-sm`, {color: '#94a3b8'}]}>Wkt No.</Text>
        <Text style={[tailwind`text-sm`, {color: '#94a3b8'}]}>Player</Text>
        <Text style={[tailwind`text-sm`, {color: '#94a3b8'}]}>Score</Text>
        <Text style={[tailwind`text-sm`, {color: '#94a3b8'}]}>Over</Text>
      </View>
      {wickets?.map((item, index) => (
        <View
          key={index}
          style={[
            tailwind`flex-row justify-between p-3`,
            {backgroundColor: index % 2 === 0 ? '#1e293b' : '#0f172a', borderTopWidth: 1, borderColor: '#334155'}
          ]}
        >
          <Text style={[tailwind`text-sm`, {color: '#f1f5f9'}]}>{item.wicket_number}</Text>
          <Text style={[tailwind`text-sm`, {color: '#f1f5f9'}]}>{item?.batsman_player?.name}</Text>
          <Text style={[tailwind`text-sm`, {color: '#f1f5f9'}]}>
            {item.score}-{item.wicket_number}
          </Text>
          <Text style={[tailwind`text-sm`, {color: '#f1f5f9'}]}>
            {convertBallToOvers(item.ball_number)}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default CricketWicketCard;
