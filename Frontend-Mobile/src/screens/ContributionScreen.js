import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';

const ContributionScreen = () => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await axios.get(`${process.env.EXPO_PUBLIC_DOMAIN}api/contributions`);
      setContributions(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load contributions');
      setLoading(false);
    }
  };

  const renderContributionItem = ({ item }) => (
    <View style={styles.contributionItem}>
      <Image 
        source={{ uri: item.image }} 
        style={styles.contributionImage}
        defaultSource={require('../assets/food-placeholder.png')}
      />
      <View style={styles.contributionDetails}>
        <Text style={styles.contributionTitle}>{item.name_recipe}</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.contributionStatus(item.status)}>
            {item.status === 'approved' ? 'Approved' : 'Pending Review'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ee4d2d" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchContributions} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>My Contributions</Text>
      <FlatList
        data={contributions}
        renderItem={renderContributionItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No contributions yet</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    textAlign: 'center',
  },
  contributionItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    padding: 12,
    elevation: 2,
  },
  contributionImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  contributionDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  contributionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  contributionStatus: (status) => ({
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: status === 'approved' ? '#4CAF50' : '#FFC107',
    color: 'white',
  }),
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ee4d2d',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ContributionScreen;