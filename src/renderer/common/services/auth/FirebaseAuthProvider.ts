import {
    Auth,
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
} from 'firebase/auth';
import IAuthProvider from './IAuthProvider';
import IUser from './IUser';

export default class FirebaseAuthProvider implements IAuthProvider {
    private readonly auth: Auth;

    constructor(onAuthStateChanged: (user: IUser | undefined) => void) {
        this.auth = getAuth();

        this.auth.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                onAuthStateChanged({
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName || '',
                });
            } else {
                onAuthStateChanged(undefined);
            }
        });
    }

    googleSignIn = async (): Promise<IUser> => {
        const googleProvider = new GoogleAuthProvider();
        try {
            const userCredential = await signInWithPopup(
                this.auth,
                googleProvider
            );
            const firebaseUser = userCredential.user;
            return {
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || undefined,
            };
        } catch {
            throw new Error('An error occurred while signing in.');
        }
    };

    signOut = async (): Promise<void> => {
        await signOut(this.auth);
    };
}
