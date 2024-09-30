import React from 'react';
import { View, Text, Image } from 'react-native';
import tailwind from 'twrnc';


const incidentEmojis = {
    goal: '⚽',
    penalty: '🏅',
    missed: '🚫',
    foul: '❌',
    free_kick: '🚀',
    substitution: '🔁',
    yellow_card: '🟨',
    red_card: '🟥'
};

const incidentTypeCheck = (incidentType) => {
    switch (incidentType) {
        case 'goal':
            return incidentEmojis['goal'];
        case 'penalty':
            return incidentEmojis['penalty'];
        case 'penalty_miss':
            return incidentEmojis['missed'];
        case 'foul':
            return incidentEmojis['free_kick'];
        case 'substitution':
            return incidentEmojis['substitution'];
        case 'yellow_card':
            return incidentEmojis['yellow_card'];
        case 'red_card':
            return incidentEmojis['red_card'];
    }
}

const IncidentCheck = ({ incidents, matchData }) => {
    
  return (
    <View style={tailwind`flex-1`}>
      {incidents.map((item, index) => (
        <View
          key={index}
          style={[
            tailwind`p-4 border-b border-gray-200`,
            item.team_id === matchData.homeTeam.id ? tailwind`justify-start` : tailwind`justify-end`
          ]}
        >
          {item.team_id === matchData.homeTeam.id ? (
            <View style={tailwind`flex-row items-center`}>
              {/* Incident for Home Team */}
              {/* Handle Substitution */}
              {item.incident_type === 'substitutions' ? (
                <View style={tailwind`flex-row items-center`}>
                    <View style={tailwind`items-center p-2`}>
                        <Text style={tailwind`text-xl`}>{incidentTypeCheck(item.incident_type)}</Text>
                        <Text style={tailwind`font-bold text-lg`}>{item.incident_time}'</Text>
                  </View>
                  <View style={tailwind`h-10 w-0.2 bg-gray-400 mx-4`} />
                  <View style={tailwind``}>
                    <View style={tailwind`flex-row`}>
                      <Text>In: </Text>
                      <Text style={tailwind`text-xl`}>{item.player_in.name}</Text>
                    </View>
                    <View style={tailwind`flex-row`}>
                      <Text>Out: </Text>
                      <Text style={tailwind`text-xl`}>{item.player_out.name}</Text>
                    </View>
                  </View>
                  <View style={tailwind`items-center p-2`}>
                    <Text style={tailwind`text-xl`}>{incidentTypeCheck(item.incident_type)}</Text>
                    <Text style={tailwind`font-bold text-lg`}>{item.incident_time}'</Text>
                  </View>
                </View>
              ) : (
                <View style={tailwind`flex-row items-center`}>
                    <View style={tailwind`items-center`}>
                        <Text style={tailwind`text-xl`}>{incidentTypeCheck(item.incident_type)}</Text>
                        <Text style={tailwind`font-bold text-lg`}>{item.incident_time}'</Text>
                    </View>
                    <View style={tailwind`h-10 w-0.2 bg-gray-400 mx-4`} />
                  {/* Handle Other Incident Types */}
                  <View style={tailwind`mx-4`}>
                    <Text style={tailwind`text-xl`}>{item.player.name}</Text>
                    <Text style={tailwind`text-lg`}>{item.incident_type}</Text>
                  </View>
                  {item.home_score && item.away_score && (
                    <View style={tailwind`flex-row`}>
                      <Text style={tailwind`text-xl`}>{item.home_score.goals}</Text>
                      <Text style={tailwind`text-xl`}>-</Text>
                      <Text style={tailwind`text-xl`}>{item.away_score.goals}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ) : (
            <View style={tailwind`flex-row items-center justify-end`}>
              {/* Incident for Away Team */}
              {item.incident_type === 'substitutions' ? (
                <View style={tailwind`flex-row items-center`}>
                  {/* Handle Substitution */}
                  <View style={tailwind``}>
                    <View style={tailwind`flex-row`}>
                      <Text>In: </Text>
                      <Text style={tailwind`text-xl`}>{item.player_in.name}</Text>
                    </View>
                    <View style={tailwind`flex-row`}>
                      <Text>Out: </Text>
                      <Text style={tailwind`text-xl`}>{item.player_out.name}</Text>
                    </View>
                  </View>
                  <View style={tailwind`h-10 w-0.2 bg-gray-400 mx-4`} />
                  <View style={tailwind`items-center p-2`}>
                    <Text style={tailwind`text-xl`}>{incidentTypeCheck(item.incident_type)}</Text>
                    <Text style={tailwind`font-bold text-lg`}>{item.incident_time}'</Text>
                  </View>
                </View>
              ) : (
                <View style={tailwind`flex-row items-center justify-end`}>
                  {/* Handle Other Incident Types */}
                  {item.home_score && item.away_score && (
                    <View style={tailwind`flex-row`}>
                      <Text style={tailwind`text-xl`}>{item.home_score.goals}</Text>
                      <Text style={tailwind`text-xl`}>-</Text>
                      <Text style={tailwind`text-xl`}>{item.away_score.goals}</Text>
                    </View>
                  )}
                  <View style={tailwind`mx-4`}>
                    <Text style={tailwind`text-xl`}>{item.player.name}</Text>
                    <Text style={tailwind`text-lg`}>{item.description}</Text>
                  </View>
                  <View style={tailwind`h-10 w-0.2 bg-gray-400 mx-4`} />
                  <View style={tailwind`items-center`}>
                    <Text style={tailwind`text-xl`}>{incidentTypeCheck(item.incident_type)}</Text>
                    <Text style={tailwind`font-bold text-lg`}>{item.incident_time}'</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

export default IncidentCheck;
