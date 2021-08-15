import { error, log } from '../../log';
import {
    setAccountInfo,
    setPublicGeneralInfo,
} from '../../redux/account-slice';
import { setFetchingProfiles, setProfiles } from '../../redux/profiles-slice';
import { addShare, deleteShare, updateShare } from '../../redux/shares-slice';
import { store } from '../../redux/store';
import IAccountInfo from '../IAccountInfo';
import IProfile from '../IProfile';
import IPublicGeneralInfo from '../IPublicGeneralInfo';
import IShare from '../IShare';
import FirestoreDatabaseProvider from './FirebaseDatabaseProvider';
import IDatabaseProvider from './IDatabaseProvider';

export enum DatabaseProviderType {
    Firestore,
}

export default class DatabaseService {
    private readonly databaseProviderType: DatabaseProviderType;
    private databaseProvider: IDatabaseProvider | undefined;

    constructor(databaseProviderType: DatabaseProviderType) {
        this.databaseProviderType = databaseProviderType;
    }

    initialize = (): void => {
        if (this.databaseProvider) {
            log('Database Service is already initialized');
            return;
        }

        switch (this.databaseProviderType) {
            case DatabaseProviderType.Firestore:
                this.databaseProvider = new FirestoreDatabaseProvider(
                    (share: IShare) => {
                        // OnShareAdded - Called when a share is added to any of the profiles being listened to.
                        store.dispatch(addShare(share));
                    },
                    (share: IShare) => {
                        // OnShareDeleted - Called when a share is deleted from any of the profiles being listened to.
                        if (!share.id) return;
                        store.dispatch(deleteShare(share.id));
                    },
                    (share: IShare) => {
                        // OnShareModified - Called when a share is modified in any of the profiles being listened to.
                        store.dispatch(updateShare(share));
                    }
                );
                break;
        }
    };

    getAccountInfo = async (uid: string): Promise<IAccountInfo | undefined> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return undefined;
        }

        const accountInfo = await this.databaseProvider.getAccountInfo(uid);
        store.dispatch(setAccountInfo(accountInfo));

        return accountInfo;
    };

    doesAccountExist = async (uid: string): Promise<boolean> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return false;
        }

        return await this.databaseProvider.doesAccountExist(uid);
    };

    initializeAccount = async (
        uid: string,
        accountInfo: IAccountInfo,
        publicGeneralInfo: IPublicGeneralInfo
    ): Promise<boolean> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return false;
        }

        const success = await this.databaseProvider.initializeAccount(
            uid,
            accountInfo,
            publicGeneralInfo
        );
        if (success) {
            store.dispatch(setAccountInfo(accountInfo));
            store.dispatch(setPublicGeneralInfo(publicGeneralInfo));
        }
        return success;
    };

    setAccountInfo = async (
        uid: string,
        accountInfo: IAccountInfo
    ): Promise<boolean> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return false;
        }

        const success = await this.databaseProvider.setAccountInfo(
            uid,
            accountInfo
        );
        if (success) {
            store.dispatch(setAccountInfo(accountInfo));
        }
        return success;
    };

    getUidByPhoneNumber = async (
        phoneNumber: string
    ): Promise<string | undefined> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return undefined;
        }

        const uid = await this.databaseProvider.getUidByPhoneNumber(
            phoneNumber
        );
        return uid;
    };

    getPublicGeneralInfo = async (
        uid: string
    ): Promise<IPublicGeneralInfo | undefined> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return undefined;
        }

        const publicGeneralInfo =
            await this.databaseProvider.getPublicGeneralInfo(uid);
        return publicGeneralInfo;
    };

    setPublicGeneralInfo = async (
        uid: string,
        info: IPublicGeneralInfo
    ): Promise<void> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return undefined;
        }

        await this.databaseProvider.setPublicGeneralInfo(uid, info);
        store.dispatch(setPublicGeneralInfo(info));
    };

    createDefaultProfile = async (uid: string): Promise<boolean> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return false;
        }

        return await this.databaseProvider.createDefaultProfile(uid);
    };

    createProfile = async (uid: string, profile: IProfile): Promise<void> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return undefined;
        }

        try {
            await this.databaseProvider.createProfile(uid, profile);

            // TODO: Instead of refetching all profiles after creating one,
            // consider registering a collection listener for 'profiles' and
            // handling the ADD, DELETE, MODIFIED operations.
            await this.getAllProfiles(uid);
        } catch (e) {
            log('Failed to create profile');
        }
    };

    getAllProfiles = async (uid: string): Promise<IProfile[]> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return [];
        }

        store.dispatch(setFetchingProfiles(true));

        const profiles = await this.databaseProvider.getAllProfiles(uid);

        store.dispatch(setProfiles(profiles || []));
        store.dispatch(setFetchingProfiles(false));

        return profiles;
    };

    getProfile = async (
        uid: string,
        profileId: string
    ): Promise<IProfile | undefined> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return undefined;
        }

        const profile = await this.databaseProvider.getProfile(uid, profileId);
        return profile;
    };

    getProfileIdByName = async (
        uid: string,
        name: string
    ): Promise<string | undefined> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return undefined;
        }

        const profileId = await this.databaseProvider.getProfileIdByName(
            uid,
            name
        );
        return profileId;
    };

    deleteProfile = async (
        uid: string,
        profileId: string
    ): Promise<boolean> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return false;
        }

        const success = await this.databaseProvider.deleteProfile(
            uid,
            profileId
        );
        // TODO: Instead of refetching all profiles after creating one,
        // consider registering a collection listener for 'profiles' and
        // handling the ADD, DELETE, MODIFIED operations.
        await this.getAllProfiles(uid);
        return success;
    };

    createShare = async (share: IShare): Promise<void> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return undefined;
        }

        await this.databaseProvider.createShare(share);
    };

    deleteShare = async (share: IShare): Promise<boolean> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return false;
        }

        const success = await this.databaseProvider.deleteShare(share);
        return success;
    };

    switchShareListener = async (
        uid: string,
        profileId: string
    ): Promise<void> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return undefined;
        }

        if (this.databaseProvider.hasShareListener(uid, profileId)) return;

        await this.removeAllShareListeners();
        await this.addShareListener(uid, profileId);
    };

    addShareListener = async (
        uid: string,
        profileId: string
    ): Promise<void> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return undefined;
        }

        await this.databaseProvider.addShareListener(uid, profileId);
    };

    removeAllShareListeners = async (): Promise<void> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return undefined;
        }

        await this.databaseProvider.removeAllShareListeners();
    };

    removeShareListener = async (
        uid: string,
        profileId: string
    ): Promise<void> => {
        if (!this.databaseProvider) {
            error('Database Service is not initialized!');
            return undefined;
        }

        await this.databaseProvider.removeShareListener(uid, profileId);
    };
}
