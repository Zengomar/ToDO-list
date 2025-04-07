import {
collection,
addDoc,
getDocs,
doc,
deleteDoc,
updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig"; // Adjust the import path as necessary

export const markTaskAsCompleted = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, { completed: true });
    console.log("Task marked as completed with ID: ", id);
  } catch (e) {
    console.error("Error marking task as completed: ", e);
    throw e;
  }
};
// Firestore functions
export const addItem = async (collectionName: string, data: any) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            completionDate: data.completionDate,
            completionTime: data.completionTime,
        });
        console.log("Document written with ID: ", docRef.id);
        return { id: docRef.id, ...data }; // Ensure returned task includes ID
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

export const getItems = async (collectionName: string) => {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            completionDate: doc.data().completionDate || '',
            completionTime: doc.data().completionTime || '',
        }));
    } catch (error) {
        console.error('Error fetching Firestore data:', error);
        throw error;
    }
};


export const deleteItem = async (collectionName: string, id: string) => {
try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    console.log("Document deleted with ID: ", id);
} catch (e) {
    console.error("Error deleting document: ", e);
    throw e;
}
};