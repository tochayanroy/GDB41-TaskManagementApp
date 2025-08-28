import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import TaskCard from '../src/components/TaskCard';
import { useRouter } from 'expo-router';

const TasksScreen = () => {
	const router = useRouter();
	const [tasks, setTasks] = useState([]);
	const [filteredTasks, setFilteredTasks] = useState([]);
	const [loading, setLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [filterModalVisible, setFilterModalVisible] = useState(false);
	const [editingTask, setEditingTask] = useState(null);
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		status: 'Pending',
		priority: 'Medium',
		createdDate: new Date(),
		lastUpdateDate: new Date(),
		dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
	});

	// Filter states
	const [selectedStatus, setSelectedStatus] = useState('All');
	const [selectedPriority, setSelectedPriority] = useState('All');
	const [selectedWeek, setSelectedWeek] = useState(null);
	const [showCalendar, setShowCalendar] = useState(false);
	const [showCreatedDatePicker, setShowCreatedDatePicker] = useState(false);
	const [showUpdateDatePicker, setShowUpdateDatePicker] = useState(false);
	const [showDueDatePicker, setShowDueDatePicker] = useState(false);
	const [shareEmail, setShareEmail] = useState('');
	const [shareAccess, setShareAccess] = useState('view');

	const statusOptions = ['All', 'Pending', 'Ongoing', 'Complete', 'Cancel'];
	const priorityOptions = ['All', 'Low', 'Medium', 'High', 'Emergency'];

	useEffect(() => {
		fetchTasks();
	}, []);

	useEffect(() => {
		applyFilters();
	}, [tasks, selectedStatus, selectedPriority, selectedWeek]);

	const fetchTasks = async () => {
		const auth_token = await AsyncStorage.getItem('auth_token');
		setLoading(true);
		try {
			const response = await axios.get('http://192.168.0.105:5000/task/get-all-task', {
				headers: {
					Authorization: `Bearer ${auth_token}`
				}
			});
			setTasks(response.data.tasks);
		} catch (error) {
			Alert.alert('Error', error.response?.data?.error || 'Failed to fetch tasks');
		} finally {
			setLoading(false);
		}
	};

	const applyFilters = () => {
		let result = [...tasks];

		// Status filter
		if (selectedStatus !== 'All') {
			result = result.filter(task => task.status === selectedStatus);
		}

		// Priority filter
		if (selectedPriority !== 'All') {
			result = result.filter(task => task.priority === selectedPriority);
		}

		// Week filter
		if (selectedWeek) {
			const startDate = new Date(selectedWeek.startDate);
			const endDate = new Date(selectedWeek.endDate);

			result = result.filter(task => {
				const taskDate = new Date(task.dueDate);
				return taskDate >= startDate && taskDate <= endDate;
			});
		}

		setFilteredTasks(result);
	};

	const handleCreateTask = async () => {
		const auth_token = await AsyncStorage.getItem('auth_token');

		if (!formData.title) {
			Alert.alert('Error', 'Title is required');
			return;
		}

		try {
			const response = await axios.post('http://192.168.0.105:5000/task/create-task', formData, {
				headers: {
					Authorization: `Bearer ${auth_token}`
				}
			});
			setTasks([response.data.task, ...tasks]);
			setModalVisible(false);
			resetForm();
		} catch (error) {
			Alert.alert('Error', error.response?.data?.error || 'Failed to create task');
		}
	};

	const handleUpdateTask = async () => {
		const auth_token = await AsyncStorage.getItem('auth_token');

		try {
			const updateData = {
				title: formData.title,
				description: formData.description,
				status: formData.status,
				priority: formData.priority,
				lastUpdateDate: new Date(),
				dueDate: formData.dueDate
			};

			const response = await axios.put(
				`http://192.168.0.105:5000/task/update-task/${editingTask._id}`,
				updateData,
				{
					headers: {
						Authorization: `Bearer ${auth_token}`
					}
				}
			);
			setTasks(tasks.map(task =>
				task._id === editingTask._id ? response.data.task : task
			));
			setModalVisible(false);
			resetForm();
		} catch (error) {
			Alert.alert('Error', error.response?.data?.error || 'Failed to update task');
		}
	};

	const handleDeleteTask = async (taskId) => {
		const auth_token = await AsyncStorage.getItem('auth_token');

		try {
			await axios.delete(`http://192.168.0.105:5000/task/delete-task/${taskId}`, {
				headers: {
					Authorization: `Bearer ${auth_token}`
				}
			});
			setTasks(tasks.filter(task => task._id !== taskId));
		} catch (error) {
			Alert.alert('Error', error.response?.data?.error || 'Failed to delete task');
		}
	};

	const handleShareTask = async () => {
		const auth_token = await AsyncStorage.getItem('auth_token');
		if (!shareEmail) {
			Alert.alert('Error', 'Please enter an email address');
			return;
		}

		try {
			await axios.post('http://192.168.0.105:5000/task/share-task', {
				taskId: editingTask?._id,
				email: shareEmail,
				access: shareAccess
			}, {
				headers: {
					Authorization: `Bearer ${auth_token}`
				}
			});
			Alert.alert('Success', 'Task shared successfully');
			setShareEmail('');
		} catch (error) {
			Alert.alert('Error', error.response?.data?.error || 'Failed to share task');
		}
	};

	const resetForm = () => {
		setFormData({
			title: '',
			description: '',
			status: 'Pending',
			priority: 'Medium',
			createdDate: new Date(),
			lastUpdateDate: new Date(),
			dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		});
		setEditingTask(null);
		setShareEmail('');
		setShareAccess('view');
	};

	const openEditModal = (task) => {
		setEditingTask(task);
		setFormData({
			title: task.title,
			description: task.description,
			status: task.status,
			priority: task.priority,
			createdDate: new Date(task.createdDate),
			lastUpdateDate: new Date(),
			dueDate: new Date(task.dueDate),
		});
		setModalVisible(true);
	};

	const handleDateChange = (dateType, event, selectedDate) => {
		if (dateType === 'created') {
			setShowCreatedDatePicker(false);
		} else if (dateType === 'updated') {
			setShowUpdateDatePicker(false);
		} else {
			setShowDueDatePicker(false);
		}

		if (selectedDate) {
			setFormData({
				...formData,
				...(dateType === 'created' && { createdDate: selectedDate }),
				...(dateType === 'updated' && { lastUpdateDate: selectedDate }),
				...(dateType === 'due' && { dueDate: selectedDate }),
			});
		}
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const handleWeekSelect = (day) => {
		const date = new Date(day.dateString);
		const dayOfWeek = date.getDay();
		const startDate = new Date(date);
		startDate.setDate(date.getDate() - dayOfWeek);

		const endDate = new Date(startDate);
		endDate.setDate(startDate.getDate() + 6);

		setSelectedWeek({
			startDate: startDate.toISOString().split('T')[0],
			endDate: endDate.toISOString().split('T')[0],
			label: `Week of ${formatShortDate(startDate)} to ${formatShortDate(endDate)}`
		});
		setShowCalendar(false);
	};

	const formatShortDate = (date) => {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	};

	const clearFilters = () => {
		setSelectedStatus('All');
		setSelectedPriority('All');
		setSelectedWeek(null);
		setFilterModalVisible(false);
	};


	return (
		<View style={styles.container}>
			{/* Filter Header */}
			<View style={styles.filterHeader}>
				<TouchableOpacity
					style={styles.filterButton}
					onPress={() => setFilterModalVisible(true)}
				>
					<MaterialIcons name="filter-list" size={24} color="#6200EE" />
					<Text style={styles.filterButtonText}>Filters</Text>
				</TouchableOpacity>

				{selectedWeek && (
					<View style={styles.weekIndicator}>
						<Text style={styles.weekIndicatorText}>{selectedWeek.label}</Text>
						<TouchableOpacity onPress={() => setSelectedWeek(null)}>
							<MaterialIcons name="close" size={18} color="#666" />
						</TouchableOpacity>
					</View>
				)}
			</View>

			{loading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#0000ff" />
				</View>
			) : (
				<FlatList
					data={filteredTasks}
					renderItem={({ item }) => (
						<TouchableOpacity
							onPress={() => router.push({
								pathname: '/task',
								params: { id: item._id }
							})}
						>
							<TaskCard
								item={item}
								openEditModal={openEditModal}
								handleDeleteTask={handleDeleteTask}
								formatDate={formatDate}
							/>
						</TouchableOpacity>
					)}
					keyExtractor={(item) => item._id}
					contentContainerStyle={styles.listContainer}
					ListEmptyComponent={
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyText}>No tasks found</Text>
							{selectedStatus !== 'All' || selectedPriority !== 'All' || selectedWeek ? (
								<TouchableOpacity onPress={clearFilters}>
									<Text style={styles.clearFiltersText}>Clear filters</Text>
								</TouchableOpacity>
							) : null}
						</View>
					}
				/>
			)}

			{/* Filter Modal */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={filterModalVisible}
				onRequestClose={() => setFilterModalVisible(false)}
			>
				<View style={styles.modalContainer}>
					<View style={styles.filterModalContent}>
						<Text style={styles.modalTitle}>Filter Tasks</Text>

						{/* Status Filter */}
						<View style={styles.filterSection}>
							<Text style={styles.filterLabel}>Status</Text>
							<View style={styles.filterOptions}>
								{statusOptions.map(status => (
									<TouchableOpacity
										key={status}
										style={[
											styles.filterOption,
											selectedStatus === status && styles.selectedFilterOption
										]}
										onPress={() => setSelectedStatus(status)}
									>
										<Text style={[
											styles.filterOptionText,
											selectedStatus === status && styles.selectedFilterOptionText
										]}>
											{status}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>

						{/* Priority Filter */}
						<View style={styles.filterSection}>
							<Text style={styles.filterLabel}>Priority</Text>
							<View style={styles.filterOptions}>
								{priorityOptions.map(priority => (
									<TouchableOpacity
										key={priority}
										style={[
											styles.filterOption,
											selectedPriority === priority && styles.selectedFilterOption
										]}
										onPress={() => setSelectedPriority(priority)}
									>
										<Text style={[
											styles.filterOptionText,
											selectedPriority === priority && styles.selectedFilterOptionText
										]}>
											{priority}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>

						{/* Week Selection */}
						<View style={styles.filterSection}>
							<Text style={styles.filterLabel}>Select Week</Text>
							<TouchableOpacity
								style={styles.weekSelector}
								onPress={() => setShowCalendar(true)}
							>
								<Text>
									{selectedWeek ? selectedWeek.label : 'Select a week...'}
								</Text>
								<MaterialIcons name="calendar-today" size={20} color="#6200EE" />
							</TouchableOpacity>

							{showCalendar && (
								<Calendar
									onDayPress={handleWeekSelect}
									markingType={'period'}
									markedDates={
										selectedWeek ? {
											[selectedWeek.startDate]: { startingDay: true, color: '#6200EE' },
											[selectedWeek.endDate]: { endingDay: true, color: '#6200EE' },
											...generateIntermediateDates(selectedWeek.startDate, selectedWeek.endDate)
										} : {}
									}
									theme={{
										calendarBackground: '#fff',
										selectedDayBackgroundColor: '#6200EE',
										selectedDayTextColor: '#fff',
										todayTextColor: '#6200EE',
										dayTextColor: '#2d4150',
										textDisabledColor: '#d9e1e8',
									}}
								/>
							)}
						</View>

						<View style={styles.filterModalButtons}>
							<TouchableOpacity
								style={[styles.modalButton, styles.clearButton]}
								onPress={clearFilters}
							>
								<Text style={styles.buttonText}>Clear All</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[styles.modalButton, styles.applyButton]}
								onPress={() => setFilterModalVisible(false)}
							>
								<Text style={[styles.buttonText, { color: 'white' }]}>Apply</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			{/* Task Creation/Edit Modal */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => {
					setModalVisible(false);
					resetForm();
				}}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>
							{editingTask ? 'Edit Task' : 'Create Task'}
						</Text>

						<TextInput
							style={styles.input}
							placeholder="Title*"
							value={formData.title}
							onChangeText={(text) => setFormData({ ...formData, title: text })}
						/>

						<TextInput
							style={[styles.input, styles.textArea]}
							placeholder="Description"
							multiline
							value={formData.description}
							onChangeText={(text) => setFormData({ ...formData, description: text })}
						/>

						{/* Show created date only when creating new task */}
						{!editingTask && (
							<TouchableOpacity
								style={styles.dateInput}
								onPress={() => {
									setShowCreatedDatePicker(true);
								}}
							>
								<Text>Created Date: {formatDate(formData.createdDate)}</Text>
								<MaterialIcons name="calendar-today" size={20} color="#6200EE" />
							</TouchableOpacity>
						)}
						{/* Due date */}
						<TouchableOpacity
							style={styles.dateInput}
							onPress={() => {
								setShowDueDatePicker(true);
							}}
						>
							<Text>Due Date: {formatDate(formData.dueDate)}</Text>
							<MaterialIcons name="calendar-today" size={20} color="#6200EE" />
						</TouchableOpacity>

						{showCreatedDatePicker && (
							<DateTimePicker
								value={formData.createdDate}
								mode="datetime"
								display="default"
								onChange={(event, date) => handleDateChange('created', event, date)}
							/>
						)}

						{showUpdateDatePicker && (
							<DateTimePicker
								value={formData.lastUpdateDate}
								mode="datetime"
								display="default"
								onChange={(event, date) => handleDateChange('updated', event, date)}
							/>
						)}

						{showDueDatePicker && (
							<DateTimePicker
								value={formData.dueDate}
								mode="datetime"
								display="default"
								onChange={(event, date) => handleDateChange('due', event, date)}
							/>
						)}

						<View style={styles.pickerContainer}>
							<Text style={styles.pickerLabel}>Status:</Text>
							<View style={styles.radioGroup}>
								{['Pending', 'Ongoing', 'Complete', 'Cancel'].map((status) => (
									<TouchableOpacity
										key={status}
										style={styles.radioButton}
										onPress={() => setFormData({ ...formData, status })}
									>
										<MaterialIcons
											name={formData.status === status ? 'radio-button-checked' : 'radio-button-unchecked'}
											size={24}
											color="#6200EE"
										/>
										<Text style={styles.radioLabel}>{status}</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>

						<View style={styles.pickerContainer}>
							<Text style={styles.pickerLabel}>Priority:</Text>
							<View style={styles.radioGroup}>
								{['Low', 'Medium', 'High', 'Emergency'].map((priority) => (
									<TouchableOpacity
										key={priority}
										style={styles.radioButton}
										onPress={() => setFormData({ ...formData, priority })}
									>
										<MaterialIcons
											name={formData.priority === priority ? 'radio-button-checked' : 'radio-button-unchecked'}
											size={24}
											color="#6200EE"
										/>
										<Text style={styles.radioLabel}>{priority}</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>

						{/* <View style={styles.shareOptions}>
							<TextInput
								style={styles.input}
								placeholder="Enter email address"
								value={shareEmail}
								onChangeText={setShareEmail}
								keyboardType="email-address"
								autoCapitalize="none"
							/>
							<View style={styles.shareInputArea}>
								<Picker
									selectedValue={shareAccess}
									onValueChange={(itemValue) => setShareAccess(itemValue)}
									style={styles.accessPicker}
								>
									<Picker.Item label="View Only" value="view" />
									<Picker.Item label="Can Edit" value="edit" />
								</Picker>
								<TouchableOpacity
									style={styles.shareButton}
									onPress={handleShareTask}
								>
									<MaterialIcons name="share" size={24} color="#2196F3" />
									<Text style={styles.shareButtonText}>Share Task</Text>
								</TouchableOpacity>
							</View>
						</View> */}

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={[styles.modalButton, styles.cancelButton]}
								onPress={() => {
									setModalVisible(false);
									resetForm();
								}}
							>
								<Text style={[styles.buttonText, { color: 'black' }]}>Cancel</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[styles.modalButton, styles.submitButton]}
								onPress={editingTask ? handleUpdateTask : handleCreateTask}
							>
								<Text style={[styles.buttonText, { color: 'white' }]}>
									{editingTask ? 'Update' : 'Create'}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			<TouchableOpacity
				style={styles.fab}
				onPress={() => {
					resetForm();
					setModalVisible(true);
				}}
			>
				<MaterialIcons name="add" size={28} color="white" />
			</TouchableOpacity>
		</View>
	);
};

// Helper function to generate intermediate dates for calendar marking
const generateIntermediateDates = (startDate, endDate) => {
	const dates = {};
	const start = new Date(startDate);
	const end = new Date(endDate);

	for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
		const dateStr = d.toISOString().split('T')[0];
		if (dateStr !== startDate && dateStr !== endDate) {
			dates[dateStr] = { color: '#6200EE', textColor: 'white' };
		}
	}

	return dates;
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	filterHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 15,
		backgroundColor: 'white',
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	filterButton: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 8,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: '#6200EE',
	},
	filterButtonText: {
		marginLeft: 5,
		color: '#6200EE',
		fontWeight: '500',
	},
	weekIndicator: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f0e9ff',
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 15,
	},
	weekIndicatorText: {
		color: '#6200EE',
		marginRight: 5,
		fontSize: 12,
	},
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	filterModalContent: {
		width: '90%',
		backgroundColor: 'white',
		borderRadius: 10,
		padding: 20,
		maxHeight: '80%',
	},
	modalContent: {
		width: '90%',
		backgroundColor: 'white',
		borderRadius: 10,
		padding: 20,
		maxHeight: '95%',
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 20,
		textAlign: 'center',
		color: '#6200EE',
	},
	filterSection: {
		marginBottom: 20,
	},
	filterLabel: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 10,
		color: '#333',
	},
	filterOptions: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	filterOption: {
		padding: 10,
		borderRadius: 5,
		borderWidth: 1,
		borderColor: '#ddd',
		marginBottom: 10,
		width: '48%',
		alignItems: 'center',
	},
	selectedFilterOption: {
		backgroundColor: '#6200EE',
		borderColor: '#6200EE',
	},
	filterOptionText: {
		color: '#666',
	},
	selectedFilterOptionText: {
		color: 'white',
	},
	weekSelector: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 5,
		padding: 15,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	filterModalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 20,
	},
	modalButton: {
		padding: 15,
		borderRadius: 5,
		width: '48%',
		alignItems: 'center',
	},
	clearButton: {
		backgroundColor: '#f5f5f5',
		borderWidth: 1,
		borderColor: '#ddd',
	},
	applyButton: {
		backgroundColor: '#6200EE',
	},
	buttonText: {
		fontWeight: 'bold',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 50,
	},
	emptyText: {
		fontSize: 16,
		color: '#666',
		marginBottom: 10,
	},
	clearFiltersText: {
		color: '#6200EE',
		textDecorationLine: 'underline',
	},
	fab: {
		position: 'absolute',
		width: 56,
		height: 56,
		alignItems: 'center',
		justifyContent: 'center',
		right: 20,
		bottom: 20,
		backgroundColor: '#6200EE',
		borderRadius: 28,
		elevation: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	listContainer: {
		paddingBottom: 20,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 5,
		padding: 10,
		marginBottom: 15,
	},
	textArea: {
		height: 100,
		textAlignVertical: 'top',
	},
	dateInput: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 5,
		padding: 10,
		marginBottom: 15,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	pickerContainer: {
		marginBottom: 15,
	},
	pickerLabel: {
		marginBottom: 5,
		fontWeight: 'bold',
	},
	radioGroup: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		flexWrap: 'wrap',
	},
	radioButton: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 5,
		width: '48%',
	},
	radioLabel: {
		marginLeft: 5,
	},
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
	},
	cancelButton: {
		backgroundColor: '#f5f5f5',
		borderWidth: 1,
		borderColor: '#ddd',
	},
	submitButton: {
		backgroundColor: '#6200EE',
	},
	shareButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 10,
		marginVertical: 10,
		borderWidth: 1,
		borderColor: '#2196F3',
		borderRadius: 5,
	},
	shareButtonText: {
		color: '#2196F3',
		marginLeft: 10,
		fontWeight: 'bold',
	},
	shareOptions: {
		marginTop: 10,
	},
	shareInputArea: {
		width: '100%',
		marginBottom: 10,
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	accessPicker: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 5,
		fontSize: 6,
	},
});

export default TasksScreen;