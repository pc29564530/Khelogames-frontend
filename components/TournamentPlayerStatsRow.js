// components/PlayerStatRow.js
import React from 'react';
import { View, Text, Image } from 'react-native';
import tailwind from 'twrnc';

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

  const getRankColors = () => {
    switch(rank) {
      case 1:
        return { bg: '#854d0e20', text: '#fbbf24' };
      case 2:
        return { bg: '#33415530', text: '#94a3b8' };
      case 3:
        return { bg: '#9a340050', text: '#fb923c' };
      default:
        return { bg: '#334155', text: '#64748b' };
    }
  };

  const rankColors = getRankColors();

  return (
    <View
      key={player.id}
      style={[tailwind`flex-row justify-between items-center py-3`, { borderBottomWidth: 1, borderBottomColor: '#334155' }]}>
      <View style={tailwind`flex-row items-center flex-1`}>
        {rank && (
          <View style={[tailwind`w-6 h-6 rounded-full items-center justify-center mr-2`, { backgroundColor: rankColors.bg }]}>
            <Text style={[tailwind`text-xs font-bold`, { color: rankColors.text }]}>{rank}</Text>
          </View>
        )}
        <View style={[tailwind`w-10 h-10 rounded-full items-center justify-center mr-3`, { backgroundColor: '#334155' }]}>
          {player.image ? (
            <Image
              source={{ uri: player.image }}
              style={tailwind`w-10 h-10 rounded-full`}
            />
          ) : (
            <Text style={[tailwind`font-bold`, { color: '#94a3b8' }]}>
              {player.player_name?.charAt(0).toUpperCase() || '?'}
            </Text>
          )}
        </View>
        <View style={tailwind`flex-1`}>
          <Text style={[tailwind`font-semibold text-base`, { color: '#f1f5f9' }]} numberOfLines={1}>
            {player.player_name || 'Unknown Player'}
          </Text>
          <Text style={[tailwind`text-xs mt-0.5`, { color: '#64748b' }]} numberOfLines={1}>
            {player.team_name || 'No Team'}
          </Text>
        </View>
      </View>
      <Text style={[tailwind`text-base font-bold ml-2`, { color: '#f1f5f9' }]}>
        {getStatDisplay()}
      </Text>
    </View>
  );
};

export default TournamentPlayerStatsRow;