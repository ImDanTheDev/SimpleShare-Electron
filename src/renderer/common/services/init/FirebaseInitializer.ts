import IServiceInitializer from './IServiceInitializer';
import { OFFirebase } from '@omnifire/web';

export default class FirebaseInitializer implements IServiceInitializer {
    initialize = async (): Promise<void> => {
        const ofFirebase = new OFFirebase();
        ofFirebase.initializeApp({
            apiKey: 'AIzaSyA6zzVAR_PGih6Pe8mIrBpFV6x-tNAVCp4',
            authDomain: 'simpleshare-428bb.firebaseapp.com',
            projectId: 'simpleshare-428bb',
            storageBucket: 'simpleshare-428bb.appspot.com',
            messagingSenderId: '555940005658',
            appId: '1:555940005658:web:b00dd5f990111de83dcea3',
            measurementId: 'G-WV37870J2G',
        });
    };
}
