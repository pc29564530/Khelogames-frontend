import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet} from 'react-native';

function Comment({threadId}) {
    const [commentText, setCommentText] = useState('');
    const handleSubmit = () => {
        try {
            
        } catch (e) {
            console.error(e);
        }
    }
    return (
        <View style={styles.container}>
            <View>
                <TextInput 
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder="Write a comment..."
                />
                <Button title="Submit" onPress={handleSubmit}/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      paddingTop: '10px',
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    
  });

export default Comment;