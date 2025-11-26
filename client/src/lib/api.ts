import type { User, Pet, Booking, Session, Package, Vaccination, InsertVaccination } from "@shared/schema";

const API_BASE = "/api";

// Users
export async function getUser(id: string): Promise<User> {
  const res = await fetch(`${API_BASE}/users/${id}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function getUserByEmail(email: string): Promise<User> {
  const res = await fetch(`${API_BASE}/users/email/${email}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

// Pets
export async function getPetsByUser(userId: string): Promise<Pet[]> {
  const res = await fetch(`${API_BASE}/users/${userId}/pets`);
  if (!res.ok) throw new Error("Failed to fetch pets");
  return res.json();
}

// Bookings
export async function getBookingsByUser(userId: string): Promise<Booking[]> {
  const res = await fetch(`${API_BASE}/users/${userId}/bookings`);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

export async function getUpcomingBookings(userId: string): Promise<Booking[]> {
  const res = await fetch(`${API_BASE}/users/${userId}/bookings/upcoming`);
  if (!res.ok) throw new Error("Failed to fetch upcoming bookings");
  return res.json();
}

export async function createBooking(booking: {
  userId: string;
  petId: string;
  serviceType: string;
  date: Date;
  timeSlot: string;
  location: string;
  status: string;
  price: number;
  notes?: string;
}): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  });
  if (!res.ok) throw new Error("Failed to create booking");
  return res.json();
}

export async function cancelBooking(id: string): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to cancel booking");
  return res.json();
}

// Sessions
export async function getSessionsByUser(userId: string): Promise<Session[]> {
  const res = await fetch(`${API_BASE}/users/${userId}/sessions`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

// Packages
export async function getPackagesByUser(userId: string): Promise<Package[]> {
  const res = await fetch(`${API_BASE}/users/${userId}/packages`);
  if (!res.ok) throw new Error("Failed to fetch packages");
  return res.json();
}

// Vaccinations
export async function getVaccinationsByPet(petId: string): Promise<Vaccination[]> {
  const res = await fetch(`${API_BASE}/pets/${petId}/vaccinations`);
  if (!res.ok) throw new Error("Failed to fetch vaccinations");
  return res.json();
}

export async function createVaccination(vaccination: InsertVaccination): Promise<Vaccination> {
  const res = await fetch(`${API_BASE}/vaccinations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vaccination),
  });
  if (!res.ok) throw new Error("Failed to create vaccination");
  return res.json();
}

export async function deleteVaccination(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/vaccinations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete vaccination");
}
