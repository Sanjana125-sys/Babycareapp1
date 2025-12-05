// src/types.ts (Updated)

// --- Individual Log Interfaces ---

export interface SleepLog {
    id: string;
    startTime: Date;
    endTime: Date | null; // Made optional/nullable to support ongoing sleep
    durationMinutes: number;
    type: 'Nap' | 'Night Sleep';
    // Added 'quality' property based on component usage
    quality: 'Excellent' | 'Good' | 'Fair' | 'Poor'; 
    notes: string;
}

export interface DiaperLog {
    id: string;
    time: Date;
    type: 'Wet' | 'Dirty' | 'Both';
    notes: string;
}

export interface ActivityLog {
    id: string;
    time: Date;
    durationMinutes: number;
    type: string; // e.g., 'Tummy Time', 'Playtime'
    notes: string;
}
// src/types.ts

// Defining the structure for an appointment history item
export interface Appointment {
  id: string;
  name: string;
  specialty: string;
  date: string;
  time: string;
  duration: string;
  notes: string;
  status: "Upcoming" | "History";
}
// --- Combined History Interface ---

export interface TrackingHistory {
    sleep: SleepLog[];
    diaper: DiaperLog[];
    activity: ActivityLog[];
}

// --- Initial State ---
export const initialHistory: TrackingHistory = {
    sleep: [],
    diaper: [],
    activity: [],
};

