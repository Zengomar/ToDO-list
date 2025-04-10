import React from 'react';
import { View, Text, StyleSheet, Button, TextInput, StatusBar } from 'react-native';
import { useState, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker
import { fetchTasks as fetchTasksFromStorage, addTaskToStorage, deleteTaskFromStorage, toggleTaskCompletionInStorage } from '@/Components/loaclSrorage';
import { setupNotifications , scheduleNotification } from '@/utils/notifications'; // Import the notification utility

interface Task {
    id?: string;
    title: string;
    completed?: boolean;
    completionDate?: string; // Existing field for completion date
    completionTime?: string; // New field for completion time
}

const Index = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [localTasks, setLocalTasks] = useState<Task[]>([]); // To store offline tasks
    const [showForm, setShowForm] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskCompletionDate, setNewTaskCompletionDate] = useState(''); // New state for completion date
    const [newTaskCompletionTime, setNewTaskCompletionTime] = useState(''); // New state for completion time
    const [showDatePicker, setShowDatePicker] = useState(false); // State to toggle date picker
    const [showTimePicker, setShowTimePicker] = useState(false); // State to toggle time picker

    useEffect(() => {
        setupNotifications(); // اطلب الإذن أول ما التطبيق يفتح
      }, []);

    useEffect(() => {
        // Fetch tasks from local storage on component mount
        const fetchTasks = async () => {
            try {
            const storedTasks = await fetchTasksFromStorage();
            setLocalTasks(storedTasks); // Set local tasks from storage
            setTasks(storedTasks); // Set tasks for rendering
            }
            catch (error) {
                console.error('Error fetching tasks from local storage:', error);
            }
        };
    }, []);

    const handleAddTask = async (newTask: Task) => {
        if (!newTask.title.trim()) {
            alert('Task title is required');
        }
            const updatedTasks = await addTaskToStorage(tasks, newTask);
            setTasks(updatedTasks);
            setLocalTasks(prevLocalTasks => [...prevLocalTasks, newTask]);
            await scheduleNotification(
                'Task Reminder',
                `Don't forget to complete: ${newTask.title}`,
                new Date(newTask.completionDate || ''), // Use the selected date
                new Date(newTask.completionTime || '') // Use the selected time
              );
    };

    const handleDeleteTask = async (task: Task) => {
            try {
                const updatedTasks = await deleteTaskFromStorage(tasks, task);
                setTasks(updatedTasks);
                setLocalTasks(prevLocalTasks => prevLocalTasks.filter(t => t.id !== task.id));
            } catch (error) {
                console.error('Error deleting task from local storage:', error);
            }
    };


    const handleCheckTask = async (task: Task) => {
            const updatedTasks = await toggleTaskCompletionInStorage(tasks, task);
            setTasks(updatedTasks);
            setLocalTasks(localTasks.map(t => (t.id === task.id ? { ...t, completed: !t.completed } : t)));
    };

    const handleAddButtonPress = () => {
        setShowForm(!showForm);
    };

    const handleAddTaskSubmit = async () => {
        if (newTaskTitle.trim()) { // Ensure title is not empty
            const newTask: Task = {
                title: newTaskTitle,
                completionDate: newTaskCompletionDate || '', // Provide default values if empty
                completionTime: newTaskCompletionTime || '',
            };
            await handleAddTask(newTask); // Add the task
            setNewTaskTitle(''); // Reset input fields
            setNewTaskCompletionDate('');
            setNewTaskCompletionTime('');
            setShowForm(false); // Close the form
        } else {
            alert('Task title is required'); // Notify user if title is empty
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setNewTaskCompletionDate(selectedDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            const hours = selectedTime.getHours().toString().padStart(2, '0');
            const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
            setNewTaskCompletionTime(`${hours}:${minutes}`); // Format as HH:MM
        }
    };

    const TaskCard = ({ task }: { task: Task }) => {
        const handleDelete = () => {
            handleDeleteTask(task);
        };

        const handleCheck = () => {
            handleCheckTask(task);
        };

        return (
            <View style={styles.card}>
                <FontAwesome
                    name={task.completed ? 'check-circle' : 'circle-thin'}
                    size={24}
                    color="#4CAF50"
                    onPress={handleCheck}
                    style={styles.icon}
                />
                <Text style={[styles.cardText, task.completed && styles.completedText]}>
                    {task.title}
                </Text>
                <Text style={styles.cardText}>
                    {task.completionDate ? `Due: ${task.completionDate}` : ''}
                    {task.completionTime ? ` at ${task.completionTime}` : ''}
                </Text>
                {task.completed && (
                    <FontAwesome
                        name="star"
                        size={20}
                        color="#FFD700"
                        style={styles.icon}
                    />
                )}
                <FontAwesome
                    name="trash"
                    size={24}
                    color="#F44336"
                    onPress={handleDelete}
                    style={styles.icon}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#794141" />
            <Text style={styles.text}>To-Do App</Text>
            {tasks.length > 0 ? (
                <View style={styles.taskList}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id || task.title} task={task} /> // Use task.id or fallback to title
                    ))}
                    <Button
                        title="Add Task"
                        onPress={handleAddButtonPress}
                        color="#4F1B1B"
                    />
                    {showForm && (
                        <View>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter task title"
                                value={newTaskTitle}
                                onChangeText={setNewTaskTitle}
                            />
                            <Button
                                title={newTaskCompletionDate ? `Date: ${newTaskCompletionDate}` : 'Select Date'}
                                onPress={() => setShowDatePicker(true)}
                                color="#4F1B1B"
                            />
                            {showDatePicker && (
                                <DateTimePicker
                                    value={new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={handleDateChange}
                                />
                            )}
                            <Button
                                title={newTaskCompletionTime ? `Time: ${newTaskCompletionTime}` : 'Select Time'}
                                onPress={() => setShowTimePicker(true)}
                                color="#4F1B1B"
                            />
                            {showTimePicker && (
                                <DateTimePicker
                                    value={new Date()}
                                    mode="time"
                                    display="default"
                                    onChange={handleTimeChange}
                                />
                            )}
                            <Button
                                title="Submit"
                                onPress={handleAddTaskSubmit}
                                color="#4F1B1B"
                            />
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.noTasks}>
                    <Text style={styles.text}>No tasks available</Text>
                    <Button
                        title="Add Task"
                        onPress={handleAddButtonPress}
                        color="#4F1B1B"
                    />
                    {showForm && (
                        <View>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter task title"
                                value={newTaskTitle}
                                onChangeText={setNewTaskTitle}
                            />
                            <Button
                                title={newTaskCompletionDate ? `Date: ${newTaskCompletionDate}` : 'Select Date'}
                                onPress={() => setShowDatePicker(true)}
                                color="#4F1B1B"
                            />
                            {showDatePicker && (
                                <DateTimePicker
                                    value={new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={handleDateChange}
                                />
                            )}
                            <Button
                                title={newTaskCompletionTime ? `Time: ${newTaskCompletionTime}` : 'Select Time'}
                                onPress={() => setShowTimePicker(true)}
                                color="#4F1B1B"
                            />
                            {showTimePicker && (
                                <DateTimePicker
                                    value={new Date()}
                                    mode="time"
                                    display="default"
                                    onChange={handleTimeChange}
                                />
                            )}
                            <Button
                                title="Submit"
                                onPress={handleAddTaskSubmit}
                                color="#4F1B1B"
                            />
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#794141',
        paddingTop: StatusBar.currentHeight || 0,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    taskList: {
        flex: 1,
        width: '100%',
        padding: 20,
    },
    noTasks: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#DFB6B6',
        padding: 10,
        marginVertical: 10,
        borderRadius: 10,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardText: {
        fontSize: 18,
        color: '#000000',
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#888',
    },
    check: {
        backgroundColor: '#ffffff',
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    remove: {
        backgroundColor: '#F44336',
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    button: {
        backgroundColor: '#4F1B1B',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: '100%',
        backgroundColor: '#fff',
    },
    addTaskButton: {
        backgroundColor: '#4F1B1B',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    addTaskButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    icon: {
        marginHorizontal: 10,
    },
});

export default Index;