import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from './config';
import { Product, Service, Barber, ProductionResult } from './types';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firestore
export const db = getFirestore(app);
const storage = getStorage(app);

// Products
export const addProduct = async (product: Omit<Product, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), product);
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw e;
  }
};

export const getProducts = async (): Promise<Product[]> => {
  const querySnapshot = await getDocs(collection(db, 'products'));
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      basePrice: data.basePrice || 0,
      ...data
    }
  }) as Product[];
};

export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'products', productId));
    console.log('Document deleted with ID: ', productId);
  } catch (error) {
    console.error('Error deleting document: ', error);
    throw error;
  }
};

export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<void> => {
  try {
    const productDocRef = doc(db, 'products', productId);
    await updateDoc(productDocRef, updates);
    console.log('Document updated with ID: ', productId);
  } catch (error) {
    console.error('Error updating document: ', error);
    throw error;
  }
};


// Services
export const addService = async (service: Omit<Service, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'services'), service);
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw e;
  }
};

export const getServices = async (): Promise<Service[]> => {
  const querySnapshot = await getDocs(collection(db, 'services'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Service[];
};

export const deleteService = async (serviceId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'services', serviceId));
    console.log('Document deleted with ID: ', serviceId);
  } catch (error) {
    console.error('Error deleting document: ', error);
    throw error;
  }
};

// Barbers
export const addBarber = async (barber: Omit<Barber, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'barbers'), barber);
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw e;
  }
};

export const getBarbers = async (): Promise<Barber[]> => {
  const querySnapshot = await getDocs(collection(db, 'barbers'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Barber[];
};

export const getBarberByEmail = async (email: string): Promise<Barber | null> => {
  const querySnapshot = await getDocs(collection(db, 'barbers'));
  const barbers = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Barber[];
  return barbers.find(barber => {
    console.log("Database email:", barber.email);
    return barber.email && barber.email.trim().toLowerCase() === email.trim().toLowerCase()
  }) || null;
};

export const updateBarber = async (barberEmail: string, updates: Partial<Barber>): Promise<void> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'barbers'));
    const barbers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Barber[];
    const barber = barbers.find(barber => barber.email === barberEmail);
    if (!barber) {
      throw new Error(`Barber with email ${barberEmail} not found`);
    }
    const barberDocRef = doc(db, 'barbers', barber.id);
    await updateDoc(barberDocRef, updates);
    console.log('Document updated with ID: ', barber.id);
  } catch (error) {
    console.error('Error updating document: ', error);
    throw error;
  }
};


// Production Results
export const addProductionResult = async (result: Omit<ProductionResult, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'productionResults'), result);
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw e;
  }
};

export const getProductionResults = async (): Promise<ProductionResult[]> => {
  const querySnapshot = await getDocs(collection(db, 'productionResults'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ProductionResult[];
};

export const uploadProfilePicture = async (file: File, barberEmail: string): Promise<string> => {
  try {
    const storageRef = ref(storage, `profilePictures/${barberEmail}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

// Fetches extra services from the 'extraservice' collection in Firebase
export const getExtraServices = async (): Promise<Service[]> => {
  const querySnapshot = await getDocs(collection(db, 'extraservice'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Service[];
};
