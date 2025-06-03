import React, { useEffect, useState } from 'react';
import { getEmergencyInfo } from '../lib/emergencydb';

interface EmergencySection {
    name?: string;
    address?: string;
    contact?: string;
    location?: string;
    hours?: string;
    agency?: string;
    phone?: string;
}

export interface EmergencyInfo {
    hospital: EmergencySection;
    clinic: EmergencySection;
    food: EmergencySection;
    emergency: EmergencySection;
}

const defaultInfo: EmergencyInfo = {
    hospital: {
        name: 'Hope General Hospital',
        address: '123 Mercy Street, SafeTown',
        contact: '+123 456 7890',
    },
    clinic: {
        name: 'Healing Hands Clinic',
        address: '45 Wellness Ave, Refugee Zone',
        contact: '+123 987 6543',
    },
    food: {
        location: 'Community Hall, Block C',
        hours: '9:00 AM – 6:00 PM daily',
    },
    emergency: {
        agency: 'Refugee Support Hotline',
        phone: '112 or +123 222 3333',
    },
};

const EmergencyInfoOfflinePage: React.FC = () => {
    const [info, setInfo] = useState<EmergencyInfo>(defaultInfo);

    useEffect(() => {
        getEmergencyInfo()
            .then((data) => {
                if (data) {
                    setInfo(data);
                }
            })
            .catch(() => {
                console.warn('Could not retrieve emergency info from IndexedDB.');
            });
    }, []);

    return (
        <div className="offline-page">
            <header className="header">
                <h1>Emergency Information</h1>
                <p className="offline-note">You are currently offline. This page provides essential info.</p>
            </header>

            <main className="info-sections">
                <section className="info-card">
                    <h2>Nearest Hospital</h2>
                    <p><strong>Name:</strong> {info.hospital.name}</p>
                    <p><strong>Address:</strong> {info.hospital.address}</p>
                    <p><strong>Contact:</strong> {info.hospital.contact}</p>
                </section>

                <section className="info-card">
                    <h2>Medical Clinic</h2>
                    <p><strong>Name:</strong> {info.clinic.name}</p>
                    <p><strong>Address:</strong> {info.clinic.address}</p>
                    <p><strong>Contact:</strong> {info.clinic.contact}</p>
                </section>

                <section className="info-card">
                    <h2>Food Distribution Center</h2>
                    <p><strong>Location:</strong> {info.food.location}</p>
                    <p><strong>Hours:</strong> {info.food.hours}</p>
                </section>

                <section className="info-card">
                    <h2>Emergency Contact</h2>
                    <p><strong>Agency:</strong> {info.emergency.agency}</p>
                    <p><strong>Phone:</strong> {info.emergency.phone}</p>
                </section>
            </main>

            <footer className="footer">
                <p>Stay calm. Help is nearby.</p>
                <p>This page is available offline in case of emergency.</p>
            </footer>
        </div>
    );
};

export default EmergencyInfoOfflinePage;
