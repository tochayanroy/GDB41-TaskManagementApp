import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const TaskCard = ({ item, openEditModal, handleDeleteTask, formatDate}) => {

    const truncateText = (text, maxLength = 100) => {
		if (text && text.length > maxLength) {
			return text.substring(0, maxLength) + '...';
		}
		return text;
	};


  return (
    <View style={styles.taskCard}>
			<View style={styles.taskHeader}>
				<Text style={styles.taskTitle} numberOfLines={1} ellipsizeMode="tail">
					{truncateText(item.title, 50)}
				</Text>
				<View style={styles.taskActions}>
					<TouchableOpacity onPress={() => openEditModal(item)}>
						<MaterialIcons name="edit" size={24} color="#4CAF50" />
					</TouchableOpacity>
					<TouchableOpacity onPress={() => handleDeleteTask(item._id)}>
						<MaterialIcons name="delete" size={24} color="#F44336" />
					</TouchableOpacity>
				</View>
			</View>
			<Text style={styles.taskDescription} numberOfLines={3} ellipsizeMode="tail">
				{truncateText(item.description)}
			</Text>
			<View style={styles.taskDates}>
				<Text style={styles.dateText}>Created: {formatDate(item.createdDate)}</Text>
				<Text style={styles.dateText}>Due: {formatDate(item.dueDate)}</Text>
			</View>
			<View style={styles.taskFooter}>
				<Text style={[styles.taskStatus, {
					color: item.status === 'Complete' ? '#4CAF50' :
						item.status === 'Cancel' ? '#F44336' : '#FF9800'
				}]}>
					{item.status.toUpperCase()}
				</Text>
				<Text style={[styles.taskPriority, {
					color: item.priority === 'Emergency' ? '#FF0000' :
						item.priority === 'High' ? '#F44336' :
							item.priority === 'Medium' ? '#FF9800' : '#4CAF50'
				}]}>
					{item.priority.toUpperCase()}
				</Text>
			</View>
		</View>
  )
}

export default TaskCard

const styles = StyleSheet.create({
    taskCard: {
		backgroundColor: 'white',
		borderRadius: 8,
		padding: 15,
		marginBottom: 10,
		elevation: 2,
	},
	taskHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	taskTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		flex: 1,
	},
	taskActions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	taskDescription: {
		color: '#666',
		marginBottom: 10,
	},
	taskDates: {
		marginBottom: 10,
        flexDirection:'row',
        justifyContent: 'space-between',
	},
	dateText: {
		fontSize: 12,
		color: '#888',
		marginBottom: 3,
	},
	taskFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	taskStatus: {
		fontWeight: 'bold',
	},
	taskPriority: {
		fontWeight: 'bold',
	},
})
