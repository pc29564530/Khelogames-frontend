import { useState, useRef } from 'react';
import {
  View,
  Pressable,
  TouchableWithoutFeedback,
  Animated,
  StatusBar,
} from 'react-native';
import Video from 'react-native-video';
import tailwind from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const VideoPlayer = ({ route }) => {
  const { item } = route.params;
  const navigation = useNavigation();

  const [paused, setPaused] = useState(false);
  const controlsOpacity = useRef(new Animated.Value(1)).current;

  const fadeIn = () => {
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 400,
      delay: 1500,
      useNativeDriver: true,
    }).start();
  };

  const toggleControls = () => {
    fadeIn();
    fadeOut();
  };

  StatusBar.setHidden(true);

  return (
    <View style={tailwind`flex-1 bg-black`}>
      {/* Touchable to show/hide controls */}
      <TouchableWithoutFeedback
        onPress={() => {
          setPaused((p) => !p);
          toggleControls();
        }}
      >
        <View style={tailwind`flex-1`}>
          <Video
            source={{ uri: item.media_url }}
            style={tailwind`w-full h-full`}
            resizeMode="contain"
            paused={paused}
            controls={true}
            onPause={() => fadeIn()}
            onPlay={() => fadeOut()}
          />

          {/* OVERLAY CONTROLS */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                paddingTop: 20,
                paddingHorizontal: 20,
                opacity: controlsOpacity,
                zIndex: 10,
                flexDirection: 'row',
                justifyContent: 'flex-end',
              },
            ]}
          >
            {/* CLOSE BUTTON */}
            <Pressable
              onPress={() => navigation.goBack()}
              style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                padding: 8,
                borderRadius: 30,
              }}
            >
              <AntDesign name="close" size={28} color="white" />
            </Pressable>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default VideoPlayer;
