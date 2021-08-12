import { setUser } from '../../redux/auth-slice';
import { store } from '../../redux/store';
import FirebaseAuthProvider from './FirebaseAuthProvider';
import IAuthProvider from './IAuthProvider';
import IUser from '../IUser';
import { error, log } from '../../log';

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
            log('Auth Service is already initialized');
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
        log('Auth Service initialized.');
    };

    googleSignIn = async (): Promise<IUser | undefined> => {
        if (!this.authProvider) {
            error('Auth Service is not initialized!');
            return undefined;
        }

        const user = await this.authProvider.googleSignIn();
        return user;
    };

    signOut = async (): Promise<void> => {
        if (!this.authProvider) {
            error('Auth Service is not initialized!');
            return;
        }

        await this.authProvider.signOut();
    };
}
