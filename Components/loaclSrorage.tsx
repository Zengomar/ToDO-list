import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchTasks = async () => {
    try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        return storedTasks ? JSON.parse(storedTasks) : [];
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
};

export const addTaskToStorage = async (tasks: any[], newTask: any) => {
    try {
        const updatedTasks = [...tasks, { ...newTask, id: Date.now().toString() }]; // Add unique ID for offline tasks
        await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
        return updatedTasks;
    } catch (error) {
        console.error('Error adding task:', error);
        return tasks;
    }
};

export const deleteTaskFromStorage = async (tasks: any[], taskToDelete: any) => {
    try {
        const updatedTasks = tasks.filter((task) => task.title !== taskToDelete.title || task.completionDate !== taskToDelete.completionDate || task.completionTime !== taskToDelete.completionTime);
        await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
        return updatedTasks;
    } catch (error) {
        console.error('Error deleting task:', error);
        return tasks;
    }
};

export const toggleTaskCompletionInStorage = async (tasks: any[], taskToCheck: any) => {
    try {
        const updatedTasks = tasks.map((task) =>
            task.title === taskToCheck.title ? { ...task, completed: !task.completed } : task
        );
        await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
        return updatedTasks;
    } catch (error) {
        console.error('Error toggling task completion:', error);
        return tasks;
    }
};


