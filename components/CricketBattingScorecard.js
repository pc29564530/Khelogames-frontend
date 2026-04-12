import React from 'react';
import { View, Text } from 'react-native';
import tailwind from 'twrnc';

const CricketBattingScorecard = ({ batting }) => {
    return (
        <View style={[tailwind`mb-4 rounded-lg overflow-hidden`, {backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155'}]}>
            <View style={[tailwind`flex-row justify-between px-6 py-2`, {borderBottomWidth: 1, borderColor: '#334155'}]}>
                <Text style={[tailwind`text-md`, {color: '#94a3b8'}]}>Batter</Text>
                <View style={tailwind`flex-row justify-between gap-4`}>
                    <Text style={[tailwind`text-md`, {color: '#94a3b8'}]}>R</Text>
                    <Text style={[tailwind`text-md`, {color: '#94a3b8'}]}>B</Text>
                    <Text style={[tailwind`text-md`, {color: '#94a3b8'}]}>4s</Text>
                    <Text style={[tailwind`text-md`, {color: '#94a3b8'}]}>6s</Text>
                    <Text style={[tailwind`text-md`, {color: '#94a3b8'}]}>S/R</Text>
                </View>
            </View>
            {/* Batting Data */}
            {batting?.map((item, index) => (
                <View
                    key={index}
                    style={[
                        tailwind`flex-row justify-between px-6 py-2`,
                        {backgroundColor: item.is_striker ? '#f8717120' : '#1e293b', borderTopWidth: index === 0 ? 0 : 1, borderColor: '#334155'}
                    ]}
                >
                    <View>
                        <View style={tailwind`flex-row`}>
                            <Text style={[tailwind`text-md`, {color: '#f1f5f9'}]}>{item?.player?.name}</Text>
                            {item.is_striker && <Text style={[tailwind`text-md font-bold ml-1`, {color: '#f87171'}]}>*</Text>}
                        </View>
                        {item.batting_status && !item.is_currently_batting && (
                            <View style={tailwind`flex-row`}>
                                {item.wicket_type ? (
                                    <View style={tailwind`flex-row`}>
                                        {item.wicket_type === "Run Out" ? (
                                            <Text style={[tailwind`text-sm`, {color: '#94a3b8'}]}>Run Out</Text>
                                        ) : (
                                            <Text style={[tailwind`text-sm`, {color: '#94a3b8'}]}>{item.wicket_type} b {item.bowler_name}</Text>
                                        )}
                                    </View>
                                ) : (
                                    <Text style={[tailwind`text-sm font-semibold`, {color: '#64748b'}]}>Not Out</Text>
                                )}
                            </View>
                        )}
                    </View>
                    <View style={tailwind`flex-row justify-between gap-4`}>
                        <Text style={[tailwind`text-md`, {color: '#f1f5f9'}]}>{item.runs_scored}</Text>
                        <Text style={[tailwind`text-md`, {color: '#f1f5f9'}]}>{item.balls_faced}</Text>
                        <Text style={[tailwind`text-md`, {color: '#f1f5f9'}]}>{item.fours}</Text>
                        <Text style={[tailwind`text-md`, {color: '#f1f5f9'}]}>{item.sixes}</Text>
                        <Text style={[tailwind`text-md`, {color: '#f1f5f9'}]}>
                            {item.balls_faced > 0 ? ((item.runs_scored / item.balls_faced) * 100.0).toFixed(1) : (0).toFixed(1)}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );
};

export default CricketBattingScorecard;
