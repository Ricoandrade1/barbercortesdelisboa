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
export const getServicesCountByBarberEmail = async (email: string, month?: string): Promise<number> => {
  const querySnapshot = await getDocs(collection(db, 'productionResults'));
  let productionResults = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ProductionResult[];

  if (month) {
    productionResults = productionResults.filter(result => {
      const resultDate = new Date(result.date);
      const resultMonth = `${resultDate.getFullYear()}-${String(resultDate.getMonth() + 1).padStart(2, '0')}`;
      return result.barberName === email && result.serviceName !== undefined && resultMonth === month;
    });
  } else {
    productionResults = productionResults.filter(result => result.barberName === email && result.serviceName !== undefined);
  }
  return productionResults.length;
};

export const getProductsCountByBarberEmail = async (email: string, month?: string): Promise<number> => {
  const querySnapshot = await getDocs(collection(db, 'productionResults'));
  let productionResults = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ProductionResult[];

  if (month) {
    productionResults = productionResults.filter(result => {
      const resultDate = new Date(result.date);
      const resultMonth = `${resultDate.getFullYear()}-${String(resultDate.getMonth() + 1).padStart(2, '0')}`;
      return result.barberName === email && result.productName !== undefined && resultMonth === month;
    });
  } else {
    productionResults = productionResults.filter(result => result.barberName === email && result.productName !== undefined);
  }
  return productionResults.length;
};

export const getClientsCountByBarberEmail = async (email: string, month?: string): Promise<number> => {
  const querySnapshot = await getDocs(collection(db, 'productionResults'));
  let productionResults = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ProductionResult[];

  if (month) {
    productionResults = productionResults.filter(result => {
      const resultDate = new Date(result.date);
      const resultMonth = `${resultDate.getFullYear()}-${String(resultDate.getMonth() + 1).padStart(2, '0')}`;
      return result.barberName === email && result.clientName !== "" && resultMonth === month;
    });
  } else {
    productionResults = productionResults.filter(result => result.barberName === email && result.clientName !== "");
  }
  const uniqueClients = new Set(productionResults.map(result => result.clientName));
  const count = uniqueClients.size;
  return count;
};

export const getTotalRevenueByBarberEmail = async (email: string, month?: string): Promise<number> => {
  const querySnapshot = await getDocs(collection(db, 'productionResults'));
  let productionResults = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ProductionResult[];

  if (month) {
    productionResults = productionResults.filter(result => {
      const resultDate = new Date(result.date);
      const resultMonth = `${resultDate.getFullYear()}-${String(resultDate.getMonth() + 1).padStart(2, '0')}`;
      return result.barberName === email && resultMonth === month;
    });
  } else {
    productionResults = productionResults.filter(result => result.barberName === email);
  }

  let total = 0;
  productionResults.forEach(result => {
    const price = typeof result.price === 'number' ? result.price : 0;
    const totalPrice = typeof result.totalPrice === 'number' ? result.totalPrice : 0;
    total += price + totalPrice;
  });
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
    console.log('Barber achievements updated with ID: ', barber.id, achievements);
  } catch (error) {
    console.error('Error updating barber achievements: ', error);
    throw error;
  }
};

export const getAverageServiceTimeByBarberEmail = async (email: string, month?: string): Promise<number> => {
  const querySnapshot = await getDocs(collection(db, 'productionResults'));
  let productionResults = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ProductionResult[];

  if (month) {
    productionResults = productionResults.filter(result => {
      const resultDate = new Date(result.date);
      const resultMonth = `${resultDate.getFullYear()}-${String(resultDate.getMonth() + 1).padStart(2, '0')}`;
      return result.barberName === email && result.serviceName !== undefined && resultMonth === month;
    });
  } else {
    productionResults = productionResults.filter(result => result.barberName === email && result.serviceName !== undefined);
  }

  if (productionResults.length < 2) {
    return 30; // Need at least two services to calculate an average time
  }

  // Sort services by date
  productionResults.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let totalTimeDifference = 0;
  for (let i = 1; i < productionResults.length; i++) {
    const previousServiceTime = new Date(productionResults[i - 1].date).getTime();
    const currentServiceTime = new Date(productionResults[i].date).getTime();
    let timeDifference = (currentServiceTime - previousServiceTime) / (60 * 1000); // Minutes

    // Adjust the time difference to be within 15 and 60 minutes
    timeDifference = Math.max(15, Math.min(timeDifference, 60));

    totalTimeDifference += timeDifference;
  }

  const averageTimeBetweenServices = totalTimeDifference / (productionResults.length - 1);
  return averageTimeBetweenServices;
};

export const getMonthlyRevenueByBarberEmail = async (email: string): Promise<{ [month: string]: number }> => {
  const querySnapshot = await getDocs(collection(db, 'productionResults'));
  const productionResults = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ProductionResult[];

  const filteredProductionResults = productionResults.filter(result => result.barberName === email);

  const monthlyRevenue: { [month: string]: number } = {};

  productionResults.filter(result => result.barberName && result.barberName === email).forEach(result => {
    const resultDate = new Date(result.date);
    const month = `${resultDate.getFullYear()}-${String(resultDate.getMonth() + 1).padStart(2, '0')}`;
    let revenue = 0;
    console.log('result.revenue:', result.revenue);
    console.log('result.totalPrice:', result.totalPrice);
    console.log('result.price:', result.price);
    if (result.revenue !== undefined && typeof result.revenue === 'number') {
      revenue += result.revenue;
    }
    if (result.totalPrice !== undefined && typeof result.totalPrice === 'number') {
      revenue += result.totalPrice;
    }
    if (result.price !== undefined && typeof result.price === 'number') {
      revenue += result.price;
    }

    if (monthlyRevenue[month]) {
      monthlyRevenue[month] += revenue;
    } else {
      monthlyRevenue[month] = revenue;
    }
  });

  return monthlyRevenue || {};
};

// MindMaps
export const addMindMap = async (mindMap: Omit<any, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'mapamind'), mindMap);
    console.log('MindMap written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding MindMap: ', e);
    throw e;
  }
};

export const getMindMaps = async (): Promise<any[]> => {
  const querySnapshot = await getDocs(collection(db, 'mapamind'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateMindMap = async (mindMapId: string, updates: Partial<any>): Promise<void> => {
  try {
    const mindMapDocRef = doc(db, 'mapamind', mindMapId);
    await updateDoc(mindMapDocRef, updates);
    console.log('MindMap updated with ID: ', mindMapId);
  } catch (error) {
    console.error('Error updating MindMap: ', error);
    throw error;
  }
};

export const deleteMindMap = async (mindMapId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'mapamind', mindMapId));
    console.log('MindMap deleted with ID: ', mindMapId);
  } catch (error) {
    console.error('Error deleting MindMap: ', error);
    throw error;
  }
};
