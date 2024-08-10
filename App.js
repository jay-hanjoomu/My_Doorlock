import React, { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, PanResponder, Animated, Dimensions, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

export default function App() {
  const [isOn, setIsOn] = useState(false);
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const buttonWidth = Dimensions.get('window').width * 0.8; // 80% of screen width
  const buttonSize = buttonWidth * 0.3; // 30% of button width

  const sendCommand = async (command) => {
    try {
      await axios.post(`http://10.0.14.239:3000/${command}`);
    } catch (error) {
      console.error('Error sending command:', error);
    }
  };

  const toggleSwitch = (direction) => {
    const newStatus = direction === 'right'; // Set to true if swiped right, false otherwise
    setIsOn(newStatus);
    sendCommand(newStatus ? 'unlock' : 'lock');

    Animated.spring(pan, {
      toValue: { x: direction === 'right' ? buttonWidth - buttonSize : 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (e, gestureState) => {
      const swipeDirection = gestureState.dx > buttonWidth / 2 ? 'right' : 'left';
      toggleSwitch(swipeDirection);
    },
  });

  return (
    <ImageBackground
      source={require('./assets/set.jpg')} // Replace with your image path
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.statusText}>
            {isOn ? 'Door is unlocked' : 'Door is Locked'}
          </Text>
        </View>
        
        <StatusBar style="auto" />
        
        <View style={styles.buttonContainer}>
          <Animated.View
            style={[styles.button, { transform: pan.getTranslateTransform() }]}
            {...panResponder.panHandlers}
          >
            <LinearGradient
              colors={['#000', '#fff']}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>
                {isOn ? 'Lock' : 'UnLock'}
              </Text>
            </LinearGradient>
          </Animated.View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  textContainer: {
    marginBottom: 20,
  },
  statusText: {
    fontSize: 24,
    color:'#fff',
    padding:20,
    textAlign: 'center',
    borderRadius:20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  buttonContainer: {
    width: '80%',
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    position: 'relative',
  },
  button: {
    width: '30%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    position: 'absolute',
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    lineHeight: 60,
  },
});
