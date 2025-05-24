import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function FeedbackScreen() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbackList, setFeedbackList] = useState<
    { rating: number; comment: string; time: string }[]
  >([]);
  const router = useRouter();

  const handleSubmit = () => {
    if (!rating && !comment) {
      Alert.alert('Error', 'Please provide a rating or comment');
      return;
    }

    const newEntry = {
      rating,
      comment,
      time: new Date().toLocaleString(),
    };

    setFeedbackList([newEntry, ...feedbackList]);
    // Alert.alert('Feedback Submitted', `Rating: ${rating}, Comment: ${comment}`);
    setRating(0);
    setComment('');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 40 }}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      {/* User Info */}
      <View
        style={{
          backgroundColor: '#F5D9B2',
          borderRadius: 20,
          padding: 20,
          alignItems: 'center',
          marginBottom: 30,
        }}
      >
        <View
          style={{
            backgroundColor: '#000',
            borderRadius: 50,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <FontAwesome name="user" size={24} color="orange" />
        </View>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>
          Tshepo Mthembu
        </Text>
        <Text style={{ fontSize: 14, color: '#555', marginTop: 4 }}>
          Tuesday Morning to Menlyn Taxi Rank
        </Text>
      </View>

      {/* Rating */}
      <Text style={{ color: 'black', fontSize: 18, fontWeight: '500', marginBottom: 10 }}>
        Rating
      </Text>
      <View style={{ flexDirection: 'row', marginBottom: 30 }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isSelected = star <= rating;
          return (
            <TouchableOpacity
              key={star}
              onPress={() => {
                if (rating === star && rating === 1) {
                  setRating(0);
                } else {
                  setRating(star);
                }
              }}
            >
              <FontAwesome
                name={isSelected ? 'star' : 'star-o'}
                size={30}
                color="orange"
                style={{ marginRight: 8 }}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Comment */}
      <Text style={{ color: 'black', fontSize: 18, fontWeight: '500', marginBottom: 10 }}>
        Leave a comment
      </Text>
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Type your feedback here..."
        placeholderTextColor="#999"
        multiline
        style={{
          backgroundColor: '#F5D9B2',
          borderRadius: 20,
          padding: 16,
          height: 120,
          fontSize: 16,
          color: '#000',
          marginBottom: 30,
          textAlignVertical: 'top',
        }}
      />

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: '#f90',
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
          marginBottom: 30,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#232f3e' }}>
          Submit Response
        </Text>
      </TouchableOpacity>

      {/* Feedback History */}
      {feedbackList.length > 0 && (
        <View style={{ padding: 16, backgroundColor: '#F5D9B2', borderRadius: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#000' }}>
            Feedback History
          </Text>
          {feedbackList.map((entry, index) => (
            <View
              key={index}
              style={{
                marginBottom: 12,
                backgroundColor: '#fff',
                padding: 12,
                borderRadius: 8,
                elevation: 2,
              }}
            >
              {entry.rating > 0 && (
                <Text style={{ color: '#333', marginBottom: 4 }}>
                  <Text style={{ fontWeight: 'bold' }}>Rating:</Text> {entry.rating}
                </Text>
              )}
              {entry.comment ? (
                <Text style={{ color: '#333' }}>
                  <Text style={{ fontWeight: 'bold' }}>Comment:</Text> {entry.comment}
                </Text>
              ) : null}
              <Text style={{ color: '#333', marginBottom: 4, alignSelf: 'flex-end' }}>
                {entry.time}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}