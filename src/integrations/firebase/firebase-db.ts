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
export const getServicesCountByBarberEmail = async (email: string): Promise<number> => {
  console.log('getServicesCountByBarberEmail chamado com email:', email);
  const querySnapshot = await getDocs(collection(db, 'productionResults'));
  const productionResults = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ProductionResult[];
  const count = productionResults.filter(result => result.barberName === email && result.serviceName !== undefined).length;
  console.log('getServicesCountByBarberEmail retornando:', count);
  return count;
};

export const getProductsCountByBarberEmail = async (email: string): Promise<number> => {
  console.log('getProductsCountByBarberEmail chamado com email:', email);
  const querySnapshot = await getDocs(collection(db, 'productionResults'));
  const productionResults = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ProductionResult[];
  const count = productionResults.filter(result => result.barberName === email && result.productName !== undefined).length;
   console.log('getProductsCountByBarberEmail retornando:', count);
  return count;
};

export const getClientsCountByBarberEmail = async (email: string): Promise<number> => {
  console.log('getClientsCountByBarberEmail chamado com email:', email);
  const querySnapshot = await getDocs(collection(db, 'productionResults'));
  const productionResults = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ProductionResult[];
  const uniqueClients = new Set(productionResults.filter(result => result.barberName === email && result.clientName !== "").map(result => result.clientName));
  const count = uniqueClients.size;
  console.log('getClientsCountByBarberEmail retornando:', count);
  return count;
};

export const getTotalRevenueByBarberEmail = async (email: string): Promise<number> => {
   console.log('getTotalRevenueByBarberEmail chamado com email:', email);
  const querySnapshot = await getDocs(collection(db, 'productionResults'));
  const productionResults = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ProductionResult[];
  let total = 0;
  productionResults.filter(result => result.barberName === email).forEach(result => {
    if (result.price) {
      total += result.price;
    } else if (result.totalPrice) {
      total += result.totalPrice;
    }
  });
  console.log('getTotalRevenueByBarberEmail retornando:', total);
  return total;
};

export const getTotalRevenueByBarberEmailThisMonth = async (email: string): Promise<number> => {
   console.log('getTotalRevenueByBarberEmailThisMonth chamado com email:', email);
  const querySnapshot = await getDocs(collection(db, 'productionResults'));
  const productionResults = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ProductionResult[];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  let total = 0;
  productionResults.filter(result => {
    const resultDate = new Date(result.date);
    const resultMonth = resultDate.getMonth();
    const resultYear = resultDate.getFullYear();
    return result.barberName === email && resultMonth === currentMonth && resultYear === currentYear;
  }).forEach(result => {
    if (result.price) {
      total += result.price;
    } else if (result.totalPrice) {
      total += result.totalPrice;
    }
  });
  console.log('getTotalRevenueByBarberEmailThisMonth retornando:', total);
  return total;
};

export const getExtraServices = async (): Promise<Service[]> => {
  const querySnapshot = await getDocs(collection(db, 'extraservice'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Service[];
};

export const getBarberAchievements = async (barberEmail: string): Promise<string[]> => {
  try {
    const barber = await getBarberByEmail(barberEmail);
    if (!barber) {
      throw new Error(`Barber with email ${barberEmail} not found`);
    }
    return barber.achievements || [];
  } catch (error) {
    console.error('Error getting barber achievements: ', error);
    return [];
  }
};

export const updateBarberAchievements = async (barberEmail: string, achievements: string[]): Promise<void> => {
  try {
    const barber = await getBarberByEmail(barberEmail);
    if (!barber) {
      throw new Error(`Barber with email ${barberEmail} not found`);
    }
    const barberDocRef = doc(db, 'barbers', barber.id);
    await updateDoc(barberDocRef, { achievements });
    console.log('Barber achievements updated with ID: ', barber.id);
  } catch (error) {
    console.error('Error updating barber achievements: ', error);
    throw error;
  }
};
