// components/PlayerStatRow.js
import React from 'react';
import { View, Text, Image } from 'react-native';
import tailwind from 'twrnc';
import TournamentPlayerStatsModal from './modals/cricket/TournamentStats';

const TournamentPlayerStatsRow = ({ player, type }) => {
  return (
    <View
      key={player.id}
      style={tailwind`flex-row justify-between players-center py-3 border-b border-gray-200`}>
      <View style={tailwind`flex-row players-center`}>
        <Image
          source={{ uri: player.image || 'https://via.placeholder.com/40' }}
          style={tailwind`h-10 w-10 rounded-full bg-gray-200 mr-3`}
        />
        <View>
          <Text style={tailwind`font-semibold text-base text-black`}>
            {player.player_name}
          </Text>
          <Text style={tailwind`text-xs text-gray-500`}>{player.team_name}</Text>
        </View>
      </View>
      <Text style={tailwind`text-base font-bold text-black`}>
            {type === 'mostRuns' && `${player.total_runs} Runs`}
            {type === 'highestRuns' && `${player.highest_runs} Runs`}
            {type === 'mostSixes' && `${player.most_sixes} Sixes`}
        </Text>
    </View>
  );
};

export default TournamentPlayerStatsRow;
