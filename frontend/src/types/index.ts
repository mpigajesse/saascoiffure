// Horaires avancés par jour
export interface SalonOpeningHour {
  id: number;
  salon: number;
  day_of_week: number;
  day_of_week_display: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}
// Types pour l'application SalonPro

export interface TenantTheme {
  primaryColor?: string; // Couleur principale (ex: #15 70% 45%)
  secondaryColor?: string; // Couleur secondaire
  accentColor?: string; // Couleur d'accent
  backgroundColor?: string; // Couleur de fond
  textColor?: string; // Couleur du texte
  buttonColor?: string; // Couleur des boutons
  linkColor?: string; // Couleur des liens
}

export interface Salon {
  id: string | number;
  name: string;
  slug?: string;
  address: string;
  phone: string;
  email: string;
  opening_hours: string;
  currency: string;
  timezone: string;
  logo?: string;
  primary_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  heroImage?: string; // Image hero personnalisée (optionnel, utilise Unsplash par défaut)
  theme?: TenantTheme; // Thème personnalisé du tenant
}

export type EmployeeRole = 'admin' | 'coiffeur' | 'receptionniste';

export interface Employee {
  id: string;
  salonId: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  avatar?: string;
  color: string;
  isActive: boolean;
}

export interface Client {
  id: string;
  salonId: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  preferences?: string;
  notes?: string;
  createdAt: string;
  lastVisit?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  color: string;
}

export interface ServiceImage {
  id: number;
  image: string;
  alt_text?: string;
  is_primary: boolean;
  order: number;
}

export type ServiceTarget = 'homme' | 'femme' | 'enfant_fille' | 'enfant_garcon';

export interface Service {
  id: string | number;
  name: string;
  description?: string;
  duration: number; // en minutes
  duration_display?: string;
  price: number;
  category?: ServiceCategory | { id: string | number; name: string };
  category_name?: string;
  categoryId?: string;
  target?: ServiceTarget; // Cible du service
  target_display?: string; // Libellé de la cible
  is_active?: boolean;
  isActive?: boolean;
  is_published?: boolean; // Statut de publication
  isPublished?: boolean; // Ancien format
  image?: string; // URL de l'image du service
  images?: ServiceImage[]; // Galerie d'images
  main_image_url?: string; // URL de l'image principale via property backend
  salon?: number; // ID du salon (API)
  salonId?: string; // ID du salon (Frontend legacy/contexte)
  created_at?: string;
  updated_at?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';

export type CancellationReason = 
  | 'client_request'
  | 'salon_unavailable'
  | 'weather'
  | 'emergency'
  | 'other';

export type RescheduleReason = 
  | 'client_request'
  | 'salon_unavailable'
  | 'conflict'
  | 'preference'
  | 'other';

export type BookingSource = 'website' | 'whatsapp' | 'phone' | 'walk_in';

export interface Appointment {
  id: string;
  salonId: string;
  clientId: string;
  employeeId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  source?: BookingSource; // Source de la réservation
  cancellationReason?: CancellationReason;
  cancellationNotes?: string;
  rescheduleReason?: RescheduleReason;
  rescheduleNotes?: string;
  originalDate?: string; // Date originale si reporté
  originalStartTime?: string; // Heure originale si reporté
  createdAt: string;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile' | 'online' | 'airtel_money' | 'cash_on_arrival';
export type PaymentStatus = 'pending' | 'completed' | 'refunded';

export interface Payment {
  id: string;
  salonId: string;
  appointmentId?: string;
  clientId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
}

export interface Product {
  id: string;
  salonId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  minStock: number;
  category: string;
}

export interface DashboardStats {
  todayAppointments: number;
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  totalClients: number;
  newClientsThisMonth: number;
}
