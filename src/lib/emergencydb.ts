import { openDB } from 'idb';
import type { EmergencyInfo } from '../components/EmergencyOfflinePage.tsx';

const DB_NAME = 'emergencydb';
const STORE_NAME = 'info';
const DB_VERSION = 1;

export const getEmergencyInfo = async (): Promise<EmergencyInfo | null> => {
    try {
        const db = await openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            },
        });

        const data = await db.get(STORE_NAME, 'data');
        return data ?? null;
    } catch (err) {
        console.error('Error accessing emergencydb:', err);
        return null;
    }
};

export const saveEmergencyInfo = async (info: EmergencyInfo): Promise<void> => {
    const db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });

    await db.put(STORE_NAME, info, 'data');
};
