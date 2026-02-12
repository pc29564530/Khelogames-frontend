// components/PlayerStatRow.js
import React from 'react';
import { View, Text, Image } from 'react-native';
import tailwind from 'twrnc';
import TournamentPlayerStatsModal from './modals/cricket/TournamentStats';

const TournamentPlayerStatsRow = ({ player, type, rank }) => {
  const getStatDisplay = () => {
    const value = player.stat_value;
    switch(type) {
      case 'mostRuns':
        return `${value} Runs`; 
      case 'highestRuns':
        return `${value} Runs`;
      case 'battingStrike':
        return `${value} SR`;
      case 'battingAverage':
        return `${value} Avg`;
      case 'bowlingEconomy':
        return `${value} Econ`;
      case 'bowlingAverage':
        return `${value} Avg`;
      case 'bowlingStrike':
        return `${value} SR`;
      case 'fiveWicketsHaul':
        return `${value} 5W Hauls`;
      case 'mostWickets':
        return `${value} Wickets`;
      case 'mostGoals':
        return `${value} Goals`;
      case 'mostSixes':
        return `${value} Sixes`;
      case 'mostFours':
        return `${value} Fours`;
      case 'mostFifties':
        return `${value} Fifties`;
      case 'mostHundreds':
        return `${value} Hundreds`;
      case 'mostYellowCards':
        return value;
      case 'mostRedCards':
        return value;
      default:
        return value;
    }
  };

  const getRankStyle = () => {
    switch(rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-700';
      case 2:
        return 'bg-gray-200 text-gray-700';
      case 3:
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <View
      key={player.id}
      style={tailwind`flex-row justify-between items-center py-3 border-b border-gray-100 last:border-b-0`}>
      <View style={tailwind`flex-row items-center flex-1`}>
        {rank && (
          <View style={tailwind`w-6 h-6 rounded-full ${getRankStyle()} items-center justify-center mr-2`}>
            <Text style={tailwind`text-xs font-bold`}>{rank}</Text>
          </View>
        )}
        <View style={tailwind`w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3`}>
          {player.image ? (
            <Image
              source={{ uri: player.image }}
              style={tailwind`w-10 h-10 rounded-full`}
            />
          ) : (
            <Text style={tailwind`text-gray-600 font-bold`}>
              {player.player_name?.charAt(0).toUpperCase() || '?'}
            </Text>
          )}
        </View>
        <View style={tailwind`flex-1`}>
          <Text style={tailwind`font-semibold text-base text-gray-900`} numberOfLines={1}>
            {player.player_name || 'Unknown Player'}
          </Text>
          <Text style={tailwind`text-xs text-gray-500 mt-0.5`} numberOfLines={1}>
            {player.team_name || 'No Team'}
          </Text>
        </View>
      </View>
      <Text style={tailwind`text-base font-bold text-gray-900 ml-2`}>
        {getStatDisplay()}
      </Text>
    </View>
  );
};

export default TournamentPlayerStatsRow;
