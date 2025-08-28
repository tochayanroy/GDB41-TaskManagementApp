import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const auth_token = await AsyncStorage.getItem('auth_token');
        
        const response = await axios.get(`http://192.168.0.105:5000/task/get-task/${id}`, {
          headers: {
            Authorization: `Bearer ${auth_token}`
          }
        });
        
        setTask(response.data.task);
      } catch (error) {
        console.error('Failed to fetch task details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Feather name="loader" size={24} color="#6200EE" />
        <Text style={styles.loadingText}>Loading task details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={24} color="#F44336" />
        <Text style={styles.errorText}>Error loading task</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            setTask(null);
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="inbox" size={24} color="#9E9E9E" />
        <Text style={styles.emptyText}>No task found</Text>
      </View>
    );
  }

  // Format dates for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
          <Text style={styles.statusText}>{task.status}</Text>
        </View>
      </View>

      <View style={styles.priorityContainer}>
        <MaterialIcons name="priority-high" size={20} color="#6200EE" />
        <Text style={styles.priorityText}>{task.priority} Priority</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {task.description || 'No description provided'}
        </Text>
      </View>

      <View style={styles.detailsSection}>
        <View style={styles.detailItem}>
          <MaterialIcons name="date-range" size={24} color="#6200EE" />
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailText}>{formatDate(task.createdDate)}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialIcons name="update" size={24} color="#6200EE" />
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>Last Updated</Text>
            <Text style={styles.detailText}>{formatDate(task.lastUpdateDate)}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialIcons name="event" size={24} color="#6200EE" />
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={[
              styles.detailText,
              new Date(task.dueDate) < new Date() && task.status !== 'Complete' ? styles.overdue : null
            ]}>
              {formatDate(task.dueDate)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return '#FFC107';
    case 'Ongoing': return '#2196F3';
    case 'Complete': return '#4CAF50';
    case 'Cancel': return '#F44336';
    default: return '#9E9E9E';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    color: '#F44336',
    fontWeight: 'bold',
  },
  errorDetail: {
    marginTop: 5,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 8,
    backgroundColor: '#EDE7F6',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  priorityText: {
    marginLeft: 5,
    color: '#5E35B1',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6200EE',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#424242',
  },
  detailsSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },
  detailText: {
    fontSize: 16,
    color: '#212121',
  },
  overdue: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#6200EE',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TaskDetailsScreen;