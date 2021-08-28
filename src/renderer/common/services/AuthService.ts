import { FirebaseAuthProvider, IAuthProvider, IUser } from 'simpleshare-common';
import { OFAuth } from '@omnifire/web';
import { setUser } from '../redux/auth-slice';
import { store } from '../redux/store';
import { error, log } from '../log';

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
            case AuthProviderType.Firebase: {
                const ofAuth = new OFAuth();
                ofAuth.configureGoogle();
                this.authProvider = new FirebaseAuthProvider(
                    ofAuth,
                    (user: IUser | undefined) => {
                        store.dispatch(setUser(user));
                    }
                );
                break;
            }
        }

        this.isServiceInitialized = true;
        log('Auth Service initialized.');
    };

    googleSignIn = async (): Promise<IUser> => {
        if (!this.authProvider) {
            error(
                'Auth Service is not initialized! Attempting to initializing...'
            );
            this.initialize();
            if (!this.authProvider) {
                error('Auth Service is still not initialized.');
                // TODO: Change this to a SimpleShare error.
                throw new Error('Auth Service failed to initialize');
            }
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
