import React from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import FootballTeamLineUp from '../components/FootballTeamLineups';

const TeamLineUp = ({ teamData, game, parentScrollY, headerHeight, collapsedHeader }) => {
  const gameState = useSelector(state => state.sportReducers.game);
  const gameName  = game?.name || gameState?.name;

  if (gameName === 'football') {
    return (
      <FootballTeamLineUp
        teamData={teamData}
        parentScrollY={parentScrollY}
        collapsedHeader={collapsedHeader}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#64748b', fontSize: 14 }}>Lineups not available for this sport yet.</Text>
    </View>
  );
};

export default TeamLineUp;
