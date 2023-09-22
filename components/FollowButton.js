import React, {useState} from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const FollowButton = ({isFollowing, onPress}) => {
    const buttonText = isFollowing ? 'UnFollow' : 'Follow';
    const buttonColor = isFollowing ? 'red' : 'green';

    return (
        <TouchableOpacity onPress={onPress} style={[styles.button, {backgroundColor: buttonColor}]}>
            <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
      padding: 12,
      borderRadius: 20,
      alignItems: 'center',
      width: '34%',
    },
    buttonText: {
      fontSize: 15,
      color: 'white',
      fontWeight: '500',
    },
  });

export default FollowButton;