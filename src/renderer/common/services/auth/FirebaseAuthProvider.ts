import firebase from 'firebase/app';
import 'firebase/auth';
import IAuthProvider from './IAuthProvider';
import IUser from '../IUser';
import { log } from '../../log';
import SimpleShareError, { ErrorCode } from '../../SimpleShareError';

export default class FirebaseAuthProvider implements IAuthProvider {
    private readonly auth: firebase.auth.Auth;

    constructor(onAuthStateChanged: (user: IUser | undefined) => void) {
        this.auth = firebase.auth();

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
        const googleProvider = new firebase.auth.GoogleAuthProvider();

        let firebaseUser: firebase.User | undefined;

        try {
            const userCredential = await this.auth.signInWithPopup(
                googleProvider
            );
            firebaseUser = userCredential.user || undefined;

            if (firebaseUser) {
                return {
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName || undefined,
                };
            } else {
                throw new SimpleShareError(
                    ErrorCode.SIGN_IN_INVALID_CREDENTIALS
                );
            }
        } catch (e) {
            switch (e.code) {
                case 'auth/popup-closed-by-user':
                    throw new SimpleShareError(ErrorCode.SIGN_IN_CANCELLED);
                default:
                    log('Failed to sign in error: ', e);
                    throw new SimpleShareError(
                        ErrorCode.UNEXPECTED_SIGN_IN_ERROR
                    );
            }
        }
    };

    signOut = async (): Promise<void> => {
        await this.auth.signOut();
    };
}
