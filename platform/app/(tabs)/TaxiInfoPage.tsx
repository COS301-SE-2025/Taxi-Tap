import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import taxi from '../../assets/images/taxi.png';

export default function DriverProfile() {
  const { theme, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      shadowColor: theme.shadow,
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 4,
      marginBottom: 20,
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? theme.border : 'transparent',
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
      alignSelf: 'stretch',
      marginBottom: 12,
    },
    label: {
      fontWeight: 'bold',
      color: theme.text,
      width: 120,
    },
    value: {
      color: theme.text,
      flexShrink: 1,
    },
    image: {
      width: '100%',
      height: 200,
      marginTop: 10,
      borderRadius: 12,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Driver Information</Text>
      <View style={styles.card}>
        <Ionicons name="person-circle" size={64} color={theme.primary} style={{ marginBottom: 20 }} />
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>Tshepo Mthembu</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Experience:</Text>
          <Text style={styles.value}>5 years</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Taxi Information</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Vehicle type:</Text>
          <Text style={styles.value}>Toyota</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>License plate:</Text>
          <Text style={styles.value}>VV 78 98 GP</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total seats:</Text>
          <Text style={styles.value}>12</Text>
        </View>
        <Image source={taxi} resizeMode="contain" style={styles.image} />
      </View>
    </ScrollView>
  );
}