export interface Service {
  id: string;
  name: string;
  price: number;
  barberName: string;
  clientName: string;
}

export interface Product {
  id: string;
  name: string;
  basePrice: number;
  stock: number;
  barberName: string;
}

export interface Barber {
  id: string;
  name: string;
  email: string;
  phone?: string;
  unit?: string;
  balance: number; // Assuming barbers have a balance
  profilePicture?: string;
  achievements?: string[];
}

export interface ProductionResult {
  id: string;
  barberName: string;
  serviceName: string;
  date: string; // Or Date type if you are using Date objects
  type: 'service' | 'product';
  revenue: number;
  clientName: string;
  productName?: string;
  productId?: string;
  quantity?: number;
  totalPrice?: number;
}

export interface ServiceType {
  id: string;
  name: string;
  price: number;
}
