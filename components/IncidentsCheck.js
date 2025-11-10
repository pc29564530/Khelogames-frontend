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
      {/* {!incident && incident?.map((incident) => ( */}
        <View
          style={[
            tailwind`mb-2`,
            incident.team_id === matchData.homeTeam.id ? tailwind`justify-start` : tailwind`justify-end`
          ]}
        >
          {/* {console.log("Incident Line no 30: ", incident)} */}
          {incident.team_id === matchData.homeTeam.id ? (
            <View style={tailwind`flex-row incidents-center`}>
              {/* Incident for Home Team */}
              {/* Handle Substitution */}
              {incident.incident_type === 'substitutions' ? (
                <View style={tailwind`flex-row incidents-center`}>
                  <View style={tailwind`incidents-center p-1`}>
                    <Text style={tailwind`text-md`}>{incidentEmojis[incident.incident_type]}</Text>
                    <Text style={tailwind`font-bold text-sm`}>{incident.incident_time}'</Text>
                  </View>
                  <View style={tailwind`h-10 w-0.2 bg-gray-400 mx-2`} />
                  <View style={tailwind``}>
                    <View style={tailwind`flex-row`}>
                      <Text>In: </Text>
                      <Text style={tailwind`text-md font-bold`}>{incident?.player_in?.name}</Text>
                    </View>
                    <View style={tailwind`flex-row`}>
                      <Text>Out: </Text>
                      <Text style={tailwind`text-md`}>{incident?.player_out?.name}</Text>
                    </View>
                  </View>
                  <View style={tailwind`incidents-center p-2`}>
                    <Text style={tailwind`text-md`}>{incidentEmojis[incident.incident_type]}</Text>
                    <Text style={tailwind`font-bold text-lg`}>{ incident.incident_time}'</Text>
                  </View>
                </View>
              ) : (
                <View style={tailwind`flex-row incidents-center`}>
                  <View style={tailwind`incidents-center`}>
                    <Text style={tailwind`text-md`}>{incidentEmojis[incident.incident_type]}</Text>
                    <Text style={tailwind`font-bold text-md`}>{incident.incident_time}'</Text>
                  </View>
                  <View style={tailwind`h-10 w-0.2 bg-gray-400 mx-4`} />
                  {/* Handle Other Incident Types */}
                  <View style={tailwind`mx-4`}>
                    <Text style={tailwind`text-md`}>{incident?.player?.name}</Text>
                    <Text style={tailwind`text-md`}>{incident?.incident_type}</Text>
                  </View>
                  {incident.home_score && incident.away_score && (
                    <View style={tailwind`flex-row rounded-lg bg-gray-200 p-1`}>
                      <Text style={tailwind`text-lg`}>{incident.home_score.goals}</Text>
                      <Text style={tailwind`text-lg`}>-</Text>
                      <Text style={tailwind`text-lg`}>{incident.away_score.goals}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ) : (
            <View style={tailwind`flex-row incidents-center justify-end`}>
              {/* Incident for Away Team */}
              {incident.incident_type === 'substitutions' ? (
                <View style={tailwind`flex-row incidents-center`}>
                  {/* Handle Substitution */}
                  <View style={tailwind``}>
                    <View style={tailwind`flex-row`}>
                      <Text>In: </Text>
                      <Text style={tailwind`text-md`}>{incident.player_in.name}</Text>
                    </View>
                    <View style={tailwind`flex-row`}>
                      <Text>Out: </Text>
                      <Text style={tailwind`text-md`}>{incident.player_out.name}</Text>
                    </View>
                  </View>
                  <View style={tailwind`h-10 w-0.2 bg-gray-400 mx-4`} />
                  <View style={tailwind`incidents-center p-2`}>
                    <Text style={tailwind`text-md`}>{incidentEmojis[incident.incident_type]}</Text>
                    <Text style={tailwind`font-bold text-lg`}>{incident.incident_time}'</Text>
                  </View>
                </View>
              ) : (
                <View style={tailwind`flex-row incidents-center justify-end`}>
                  {/* Handle Other Incident Types */}
                  {incident.home_score && incident.away_score && (
                    <View style={tailwind`flex-row  rounded-lg bg-gray-200 p-1`}>
                      <Text style={tailwind`text-lg`}>{incident.home_score.goals}</Text>
                      <Text style={tailwind`text-lg`}>-</Text>
                      <Text style={tailwind`text-lg`}>{incident.away_score.goals}</Text>
                    </View>
                  )}
                  <View style={tailwind`mx-4`}>
                    <Text style={tailwind`text-md`}>{incident?.player?.name}</Text>
                    <Text style={tailwind`text-md`}>{incident.description}</Text>
                  </View>
                  <View style={tailwind`h-10 w-0.2 bg-gray-400 mx-4`} />
                  <View style={tailwind`incidents-center`}>
                    <Text style={tailwind`text-md`}>{incidentEmojis[incident.incident_type]}</Text>
                    <Text style={tailwind`font-bold text-lg`}>{incident.incident_time}'</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      {/* ))} */}
    </View>
  );
};

export default IncidentCheck;