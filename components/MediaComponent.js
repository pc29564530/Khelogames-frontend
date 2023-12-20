import React from 'react';
import {Image} from 'react-native';
import Video from 'react-native-video';
import tailwind from 'twrnc';

const MediaComponent = ({mediaType, mediaUrl}) => {

    return (
        <>
            {mediaType === 'image' && <Image style={tailwind`w-full h-80 aspect-w-1 aspect-h-1`} source={{ uri: mediaUrl }} />}
            {mediaType === 'video' && <Video style={tailwind`w-full h-80 aspect-w-1 aspect-h-1`} source={{ uri: mediaUrl }} controls={true} />}
        </>
    );
}

export default MediaComponent;