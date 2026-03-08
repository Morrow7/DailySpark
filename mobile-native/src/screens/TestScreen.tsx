import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎉 项目重构成功！</Text>
      <Text style={styles.subtext}>如果看到这段文字，说明应用正常运行</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D5016',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subtext: {
    fontSize: 16,
    color: '#AED581',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
