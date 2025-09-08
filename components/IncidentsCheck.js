import React from 'react';
import { View, Text, Image } from 'react-native';
import tailwind from 'twrnc';

const incidentEmojis = {
  goal: '⚽',
  penalty: '🏅',
  penalty_miss: '🚫',
  foul: '❌',
  free_kick: '🚀',
  substitution: '🔁',
  yellow_card: '🟨',
  red_card: '🟥'
};

const IncidentCheck = ({ incident, matchData }) => {
  if (!incident || !matchData) {
    return null;
  }

  return (
    <View style={tailwind``}>
      {incident.map((item) => (
        <View
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
                    <Text style={tailwind`text-md`}>{incidentEmojis[item.incident_type]}</Text>
                    <Text style={tailwind`font-bold text-lg`}>{item.incident_time}'</Text>
                  </View>
                  <View style={tailwind`h-10 w-0.2 bg-gray-400 mx-4`} />
                  <View style={tailwind``}>
                    <View style={tailwind`flex-row`}>
                      <Text>In: </Text>
                      <Text style={tailwind`text-lg`}>{item?.player_in?.name}</Text>
                    </View>
                    <View style={tailwind`flex-row`}>
                      <Text>Out: </Text>
                      <Text style={tailwind`text-md`}>{item?.player_out?.name}</Text>
                    </View>
                  </View>
                  <View style={tailwind`items-center p-2`}>
                    <Text style={tailwind`text-md`}>{incidentEmojis[item.incident_type]}</Text>
                    <Text style={tailwind`font-bold text-lg`}>{ item.incident_time}'</Text>
                  </View>
                </View>
              ) : (
                <View style={tailwind`flex-row items-center`}>
                  <View style={tailwind`items-center`}>
                    <Text style={tailwind`text-md`}>{incidentEmojis[item.incident_type]}</Text>
                    <Text style={tailwind`font-bold text-lg`}>{item.incident_time}'</Text>
                  </View>
                  <View style={tailwind`h-10 w-0.2 bg-gray-400 mx-4`} />
                  {/* Handle Other Incident Types */}
                  <View style={tailwind`mx-4`}>
                    <Text style={tailwind`text-lg`}>{item?.player?.name}</Text>
                    <Text style={tailwind`text-md`}>{item?.incident_type}</Text>
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
                      <Text style={tailwind`text-lg`}>{item.player_in.name}</Text>
                    </View>
                    <View style={tailwind`flex-row`}>
                      <Text>Out: </Text>
                      <Text style={tailwind`text-md`}>{item.player_out.name}</Text>
                    </View>
                  </View>
                  <View style={tailwind`h-10 w-0.2 bg-gray-400 mx-4`} />
                  <View style={tailwind`items-center p-2`}>
                    <Text style={tailwind`text-lg`}>{incidentEmojis[item.incident_type]}</Text>
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
                    <Text style={tailwind`text-lg`}>{item?.player?.name}</Text>
                    <Text style={tailwind`text-md`}>{item.description}</Text>
                  </View>
                  <View style={tailwind`h-10 w-0.2 bg-gray-400 mx-4`} />
                  <View style={tailwind`items-center`}>
                    <Text style={tailwind`text-md`}>{incidentEmojis[item.incident_type]}</Text>
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