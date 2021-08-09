import { setUser } from '../../redux/auth-slice';
import { store } from '../../redux/store';
import FirebaseAuthProvider from './FirebaseAuthProvider';
import IAuthProvider from './IAuthProvider';
import IUser from '../IUser';

export enum AuthProviderType {
    Firebase,
}

export default class AuthService {
    private readonly authProviderType: AuthProviderType;
    private authProvider: IAuthProvider | undefined;

    isServiceInitialized = false;

    constructor(authProviderType: AuthProviderType) {
        this.authProviderType = authProviderType;
    }

    initialize = (): void => {
        if (this.authProvider && this.isServiceInitialized) {
            console.log('Auth Service is already initialized');
            return;
        }

        switch (this.authProviderType) {
            case AuthProviderType.Firebase:
                this.authProvider = new FirebaseAuthProvider(
                    (user: IUser | undefined) => {
                        store.dispatch(setUser(user));
                    }
                );
                break;
        }

        this.isServiceInitialized = true;
        console.log('Auth Service initialized.');
    };

    googleSignIn = async (): Promise<IUser | undefined> => {
        if (!this.authProvider) {
            console.error('Auth Service is not initialized!');
            return undefined;
        }

        const user = await this.authProvider.googleSignIn();
        return user;
    };

    signOut = async (): Promise<void> => {
        if (!this.authProvider) {
            console.error('Auth Service is not initialized!');
            return;
        }

        await this.authProvider.signOut();
    };
}
