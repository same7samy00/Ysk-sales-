
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, Firestore, Unsubscribe } from 'firebase/firestore';
import { SystemSettings } from '../types';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let unsubscribe: Unsubscribe | null = null;

export const initializeScanner = (settings: SystemSettings) => {
    if (app) {
        // If app is already initialized, no need to re-initialize
        return;
    }
    if (settings.scannerApiKey && settings.scannerProjectId) {
        const firebaseConfig = {
            apiKey: settings.scannerApiKey,
            authDomain: settings.scannerAuthDomain,
            projectId: settings.scannerProjectId,
        };
        try {
            app = initializeApp(firebaseConfig, 'scanner'); // Use a unique name for the app instance
            db = getFirestore(app);
        } catch (error) {
            console.error("Firebase initialization failed:", error);
        }
    }
};

export const requestScan = async () => {
    if (!db) {
        console.error("Firestore is not initialized.");
        return;
    }
    const scannerSessionDocRef = doc(db, 'scannerSessions', 'fixed');
    try {
        await setDoc(scannerSessionDocRef, { status: 'scanRequested', requestedAt: new Date() }, { merge: true });
    } catch (error) {
        console.error("Failed to request scan:", error);
    }
};

export const listenForScanResult = (callback: (barcode: string) => void) => {
    if (!db) {
        console.error("Firestore is not initialized.");
        return;
    }
    const scannerSessionDocRef = doc(db, 'scannerSessions', 'fixed');
    
    // Unsubscribe from any previous listener
    if (unsubscribe) {
        unsubscribe();
    }

    unsubscribe = onSnapshot(scannerSessionDocRef, (snapshot) => {
        const data = snapshot.data();
        if (data && data.status === 'scanned' && data.scannedValue) {
            callback(data.scannedValue);
            // Reset status to avoid re-triggering
            setDoc(scannerSessionDocRef, { status: 'completed' }, { merge: true });
        }
    });

    return unsubscribe; // Return the unsubscribe function so components can clean up
};

export const checkScannerConnection = async (): Promise<boolean> => {
    if (!db) {
        console.error("Firestore is not initialized for connection test.");
        return false;
    }
    try {
        // Attempt a simple write to a test document
        const testDocRef = doc(db, 'scannerSessions', 'connection-test');
        await setDoc(testDocRef, { status: 'testing', timestamp: new Date() });
        console.log("Firebase connection test successful.");
        return true;
    } catch (error) {
        console.error("Firebase connection test failed:", error);
        return false;
    }
};
