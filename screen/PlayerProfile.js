import React from 'react';
import { Text, View, Image } from 'react-native';
import tailwind from 'twrnc';

const PlayerProfile = ({ route }) => {
    const profileData = route.params.profileData.itm;
    const avatarStyle = profileData.profile && profileData.profile.player_avatar_url ?
        tailwind`w-30 h-30 rounded-full bg-yellow-500` :
        tailwind`w-30 h-30 rounded-full bg-white items-center justify-center`;

    return (
        <View style={tailwind`flex-1`}>
            <View style={tailwind`flex-row  mt-2 pt-6 pl-4 gap-3`}>
                {profileData.profile && profileData.profile.player_avatar_url ? (
                    <Image style={avatarStyle} source={{ uri: profileData.profile.avatar_url }} />
                ) : (
                    <View style={avatarStyle}>
                        <Text style={tailwind`text-red-500 text-6x3`}>
                            {profileData?.displayText}
                        </Text>
                    </View>
                )}
                <View style={tailwind`text-black p-2 mb-1`}>
                    <Text style={tailwind`text-black font-bold text-2xl `}>{profileData?.profile?.player_name}</Text>
                    <Text style={tailwind`text-black text-xl `}>{profileData?.profile.nation}</Text>
                </View>
            </View>
        </View>
    );
}

export default PlayerProfile;
