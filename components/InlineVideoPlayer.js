import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Image, Pressable,
  Animated, TouchableWithoutFeedback,
} from 'react-native';
import Video from 'react-native-video';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createThumbnail } from 'react-native-create-thumbnail';
import { useNavigation } from '@react-navigation/native';

// Starts paused + muted. Shows a real thumbnail poster frame.
// Tap anywhere → toggle play/pause. Controls auto-hide while playing.
// Bottom bar: progress bar, time, mute/unmute, fullscreen.
const InlineVideoPlayer = ({ item }) => {
  const navigation = useNavigation();
  const [paused,    setPaused]    = useState(true);
  const [muted,     setMuted]     = useState(true);
  const [progress,  setProgress]  = useState(0);
  const [duration,  setDuration]  = useState(0);
  const [ended,     setEnded]     = useState(false);
  const [thumbnail, setThumbnail] = useState(null);

  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const hideTimer       = useRef(null);

  // Generate thumbnail from the first second of the video
  useEffect(() => {
    if (!item?.media_url) return;
    createThumbnail({ url: item.media_url, timeStamp: 1000 })
      .then(res => setThumbnail(res.path))
      .catch(() => {/* silently fall back to black bg */});
    return () => clearTimeout(hideTimer.current);
  }, [item?.media_url]);

  // Control visibility helpers 
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

  // Interactions
  const handleScreenTap = () => {
    showControls();
    if (!paused) scheduleHide();
  };

  const togglePause = () => {
    if (ended) {
      // Replay
      setEnded(false);
      setProgress(0);
      setPaused(false);
    } else {
      setPaused(p => !p);
    }
    showControls();
    if (paused) scheduleHide();
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

  const formatTime = secs => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const centerIcon = ended ? 'replay' : paused ? 'play-arrow' : 'pause';

  return (
    <TouchableWithoutFeedback onPress={handleScreenTap}>
      <View style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' }}>

        {/* Thumbnail poster (shown before first play) */}
        {thumbnail && paused && progress === 0 ? (
          <Image
            source={{ uri: thumbnail }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            resizeMode="cover"
          />
        ) : null}

        {/* Video */}
        <Video
          source={{ uri: item.media_url }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          resizeMode="cover"
          paused={paused}
          muted={muted}
          controls={false}
          onProgress={handleProgress}
          onEnd={handleEnd}
          repeat={false}
        />

        {/* Controls overlay (fades in / out) */}
        <Animated.View
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            opacity: controlsOpacity,
          }}
          pointerEvents="box-none"
        >
          {/* Centre play / pause / replay */}
          <Pressable
            onPress={togglePause}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <View style={{
              backgroundColor: 'rgba(0,0,0,0.55)',
              borderRadius: 40, padding: 12,
            }}>
              <MaterialIcons name={centerIcon} size={40} color="#fff" />
            </View>
          </Pressable>

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
                width: `${pct}%`, height: '100%',
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

              {/* Right: fullscreen */}
              {navigation ? (
                <Pressable
                  onPress={() => navigation.navigate('VideoPlayer', { item, formatTime,  })}
                  hitSlop={8}
                >
                  <MaterialIcons name="fullscreen" size={24} color="#fff" />
                </Pressable>
              ) : null}
            </View>
          </View>
        </Animated.View>

      </View>
    </TouchableWithoutFeedback>
  );
};

export default InlineVideoPlayer;
