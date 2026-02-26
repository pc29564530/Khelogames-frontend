import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Pressable,
  TouchableWithoutFeedback,
  Animated, StatusBar,
} from 'react-native';
import Video from 'react-native-video';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const VideoPlayer = ({ route }) => {
  const navigation = useNavigation();
  const { item } = route.params;
  const [paused,   setPaused]   = useState(false);
  const [muted,    setMuted]    = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ended,    setEnded]    = useState(false);

  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const hideTimer = useRef(null);

  // Hide status bar on mount, restore on unmount
  useEffect(() => {
    StatusBar.setHidden(true, 'fade');
    return () => {
      StatusBar.setHidden(false, 'fade');
      clearTimeout(hideTimer.current);
    };
  }, []);

  const showControls = () => {
    clearTimeout(hideTimer.current);
    Animated.timing(controlsOpacity, {
      toValue: 1, duration: 200, useNativeDriver: true,
    }).start();
  };

  const scheduleHide = () => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      Animated.timing(controlsOpacity, {
        toValue: 0, duration: 400, useNativeDriver: true,
      }).start();
    }, 3000);
  };

  const handleScreenTap = () => {
    showControls();
    if (!paused) scheduleHide();
  };

  const pct = duration > 0 ?  (progress/duration) * 100 : 0;

  const togglePause = () => {
    if (ended) {
      setEnded(false);
      setProgress(0);
      setPaused(false);
    } else {
      setPaused(p => !p);
    }
    showControls();
    scheduleHide();
  };

  const handleProgress = ({ currentTime, seekableDuration }) => {
    setProgress(currentTime);
    setDuration(seekableDuration || 0);
  };

  const handleEnd = () => {
    setEnded(true);
    setPaused(true);
    showControls();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  // Icon: replay when ended, else play/pause
  const centerIcon = ended ? 'replay' : paused ? 'play-arrow' : 'pause';

  const handleCloseVideo = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const handleLoad = (data) => {
    setDuration(data.duration)
  }

  return (
  <View style={{ flex: 1, backgroundColor: '#000' }}>

    {/* VIDEO */}
    <Video
      source={{ uri: item.media_url }}
      style={{ flex: 1 }}
      resizeMode="contain"
      paused={paused}
      muted={muted}
      controls={false}
      onProgress={handleProgress}
      onLoad={handleLoad}
      onEnd={handleEnd}
      repeat={false}
    />

    {/* CONTROLS OVERLAY */}
    <Pressable
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onPress={handleScreenTap}
    >

      <Animated.View
        style={{
          flex: 1,
          opacity: controlsOpacity,
        }}
        pointerEvents="box-none"
      >

        {/* TOP BAR */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            paddingTop: 48,
            paddingHorizontal: 16,
          }}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={handleCloseVideo}
            style={{
              backgroundColor: 'rgba(0,0,0,0.45)',
              borderRadius: 30,
              padding: 8,
            }}
          >
            <MaterialIcons name="close" size={26} color="white" />
          </Pressable>
        </View>

        {/* CENTER PLAY BUTTON */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={togglePause}
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 50,
              padding: 16,
            }}
          >
            <MaterialIcons name={centerIcon} size={54} color="white" />
          </Pressable>
        </View>
        {/* Bottom bar */}
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          paddingBottom: 8,
        }}>
          {/* Progress bar */}
          <View style={{
            height: 3,
            backgroundColor: 'rgba(255,255,255,0.25)',
            marginBottom: 7,
          }}>
            <View style={{
              width: `${progressPercent}%`, height: '100%',
              backgroundColor: '#f87171',
            }} />
          </View>

          {/* Time + Mute + Fullscreen row */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 12,
          }}>
            {/* Left: mute + time */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable
                onPress={() => setMuted(m => !m)}
                hitSlop={8}
                style={{ marginRight: 10 }}
              >
                <MaterialIcons
                  name={muted ? 'volume-off' : 'volume-up'}
                  size={20} color="#fff"
                />
              </Pressable>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>
                {formatTime(progress)}
                <Text style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {' / '}{formatTime(duration)}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  </View>
);
};

export default VideoPlayer;
