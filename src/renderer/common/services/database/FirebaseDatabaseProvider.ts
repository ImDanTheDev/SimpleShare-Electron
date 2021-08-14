import IAccountInfo from '../IAccountInfo';
import IProfile from '../IProfile';
import IPublicGeneralInfo from '../IPublicGeneralInfo';
import IShare from '../IShare';
import IDatabaseProvider from './IDatabaseProvider';

import firebase from 'firebase/app';
import 'firebase/firestore';
import SimpleShareError, { ErrorCode } from '../../SimpleShareError';
import { error, log } from '../../log';

interface IShareListener {
    uid: string;
    profileId: string;
    unsubscribe: () => void;
}

export default class FirestoreDatabaseProvider implements IDatabaseProvider {
    private readonly firestore: firebase.firestore.Firestore;
    private shareListeners: IShareListener[] = [];

    private onShareAddedCallback: (share: IShare) => void;
    private onShareDeletedCallback: (share: IShare) => void;
    private onShareModifiedCallback: (share: IShare) => void;

    constructor(
        onShareAdded: (share: IShare) => void,
        onShareDeleted: (share: IShare) => void,
        onShareModified: (share: IShare) => void
    ) {
        this.firestore = firebase.firestore();
        this.onShareAddedCallback = onShareAdded;
        this.onShareDeletedCallback = onShareDeleted;
        this.onShareModifiedCallback = onShareModified;
    }

    getAccountInfo = async (uid: string): Promise<IAccountInfo | undefined> => {
        try {
            const accountDocRef = this.firestore
                .collection('accounts')
                .doc(uid);
            const accountDoc = await accountDocRef.get();

            if (accountDoc.exists) {
                const accountDocData = accountDoc.data();
                if (accountDocData) {
                    return {
                        isAccountComplete: accountDocData.isAccountComplete,
                        phoneNumber: accountDocData.phoneNumber,
                    };
                }
            }
        } catch {
            return undefined;
        }
        return undefined;
    };

    doesAccountExist = async (uid: string): Promise<boolean> => {
        try {
            const accountDocRef = this.firestore
                .collection('accounts')
                .doc(uid);
            const accountDoc = await accountDocRef.get();
            return accountDoc.exists;
        } catch {
            return false;
        }
    };

    initializeAccount = async (
        uid: string,
        accountInfo: IAccountInfo
    ): Promise<boolean> => {
        const setAccountInfo = await this.setAccountInfo(uid, accountInfo);
        if (!setAccountInfo) return false;

        return await this.createDefaultProfile(uid);
    };

    setAccountInfo = async (
        uid: string,
        accountInfo: IAccountInfo
    ): Promise<boolean> => {
        try {
            const accountDocRef = this.firestore
                .collection('accounts')
                .doc(uid);
            await accountDocRef.set(accountInfo);
            return true;
        } catch (e) {
            log(e);
            return false;
        }
    };

    getUidByPhoneNumber = async (
        phoneNumber: string
    ): Promise<string | undefined> => {
        const query = this.firestore
            .collection('accounts')
            .where('phoneNumber', '==', phoneNumber)
            .limit(1);

        const matchingAccountDocs = await query.get();

        if (matchingAccountDocs.size <= 0) return undefined;
        const matchingAccountDoc = matchingAccountDocs.docs[0];
        return matchingAccountDoc.id;
    };

    getPublicGeneralInfo = async (
        uid: string
    ): Promise<IPublicGeneralInfo | undefined> => {
        const generalInfoDocRef = this.firestore
            .collection('accounts')
            .doc(uid)
            .collection('public')
            .doc('GeneralInfo');
        const generalInfoDoc = await generalInfoDocRef.get();

        if (generalInfoDoc.exists) {
            const generalInfoData = generalInfoDoc.data();
            if (generalInfoData) {
                return {
                    displayName: generalInfoData.displayName,
                    isComplete: generalInfoData.isComplete,
                } as IPublicGeneralInfo;
            }
        }
        return undefined;
    };

    setPublicGeneralInfo = async (
        uid: string,
        info: IPublicGeneralInfo
    ): Promise<void> => {
        const generalInfoDocRef = this.firestore
            .collection('accounts')
            .doc(uid)
            .collection('public')
            .doc('GeneralInfo');
        await generalInfoDocRef.set(info);
    };

    createDefaultProfile = async (uid: string): Promise<boolean> => {
        try {
            const defaultProfileDocRef = this.firestore
                .collection('accounts')
                .doc(uid)
                .collection('profiles')
                .doc('default');

            await defaultProfileDocRef.set({
                name: 'default',
            });

            return true;
        } catch (e) {
            log(e);
            return false;
        }
    };

    createProfile = async (uid: string, profile: IProfile): Promise<void> => {
        try {
            const profileDocRef = this.firestore
                .collection('accounts')
                .doc(uid)
                .collection('profiles')
                .doc(profile.id);

            await profileDocRef.set({ name: profile.name });

            throw new SimpleShareError(ErrorCode.UNEXPECTED_DATABASE_ERROR);
        } catch (e) {
            error(e);
            throw new SimpleShareError(ErrorCode.UNEXPECTED_DATABASE_ERROR);
        }
    };

    getAllProfiles = async (uid: string): Promise<IProfile[]> => {
        const profilesCollectionRef = this.firestore
            .collection('accounts')
            .doc(uid)
            .collection('profiles');
        const profileDocs = await profilesCollectionRef.get();

        const profiles: IProfile[] = profileDocs.docs.map((doc): IProfile => {
            const profileData = doc.data();
            return {
                id: doc.id,
                name: profileData.name,
            };
        });

        return profiles || [];
    };

    getProfile = async (
        uid: string,
        profileId: string
    ): Promise<IProfile | undefined> => {
        const defaultProfileDocRef = this.firestore
            .collection('accounts')
            .doc(uid)
            .collection('profiles')
            .doc(profileId);

        const profileDoc = await defaultProfileDocRef.get();
        const profileData = profileDoc.data();

        if (!profileData) return undefined;

        return {
            id: profileData.id,
            name: profileData.name,
        };
    };

    getProfileIdByName = async (
        uid: string,
        name: string
    ): Promise<string | undefined> => {
        const profilesCollectionRef = this.firestore
            .collection('accounts')
            .doc(uid)
            .collection('profiles');

        const query = profilesCollectionRef.where('name', '==', name).limit(1);

        const matchingProfileDocs = await query.get();

        if (matchingProfileDocs.size <= 0) return undefined;
        const matchingProfileDoc = matchingProfileDocs.docs[0];
        return matchingProfileDoc.id;
    };

    deleteProfile = async (
        uid: string,
        profileId: string
    ): Promise<boolean> => {
        try {
            const profileDocRef = this.firestore
                .collection('accounts')
                .doc(uid)
                .collection('profiles')
                .doc(profileId);

            await profileDocRef.delete();

            const sharesCollection = this.firestore
                .collection('shares')
                .doc(uid)
                .collection(profileId);

            const shareDocs = await sharesCollection.get();
            shareDocs.docs.forEach(async (doc) => {
                await this.deleteShareById(uid, profileId, doc.id);
            });

            return true;
        } catch (e) {
            return false;
        }
    };

    createShare = async (share: IShare): Promise<void> => {
        const shareDoc = this.firestore
            .collection('shares')
            .doc(share.toUid)
            .collection(share.toProfileId)
            .doc(share.id);
        await shareDoc.set(share);
    };

    deleteShareById = async (
        userId: string,
        profileId: string,
        shareId: string | undefined
    ): Promise<void> => {
        const shareDoc = this.firestore
            .collection('shares')
            .doc(userId)
            .collection(profileId)
            .doc(shareId);
        await shareDoc.delete();
    };

    deleteShare = async (share: IShare): Promise<boolean> => {
        try {
            await this.deleteShareById(
                share.toUid,
                share.toProfileId,
                share.id
            );
            return true;
        } catch (e) {
            return false;
        }
    };

    addShareListener = async (
        uid: string,
        profileId: string
    ): Promise<void> => {
        const profileSharesCollection = this.firestore
            .collection('shares')
            .doc(uid)
            .collection(profileId);

        const unsubscribe = profileSharesCollection.onSnapshot((snapshot) => {
            const docChanges = snapshot.docChanges();
            docChanges.forEach((change) => {
                const changedShareId = change.doc.id;
                const shareData = change.doc.data();
                const share: IShare = {
                    id: changedShareId,
                    type: shareData.type,
                    content: shareData.content,
                    fromUid: shareData.fromUid,
                    fromProfileId: shareData.fromProfileId,
                    toUid: shareData.toUid,
                    toProfileId: shareData.toProfileId,
                };
                switch (change.type) {
                    case 'added':
                        // Add share to redux state.
                        this.onShareAddedCallback(share);
                        break;
                    case 'modified':
                        // Update share in redux state.
                        this.onShareModifiedCallback(share);
                        break;
                    case 'removed':
                        // Remove share from redux state.
                        this.onShareDeletedCallback(share);
                        break;
                }
            });
        });
        this.shareListeners.push({
            uid: uid,
            profileId: profileId,
            unsubscribe: unsubscribe,
        });
    };

    removeShareListener = async (
        uid: string,
        profileId: string
    ): Promise<void> => {
        const listener = this.shareListeners.find(
            (x) => x.uid === uid && x.profileId === profileId
        );
        listener?.unsubscribe();
        this.shareListeners = this.shareListeners.filter(
            (x) => x.uid !== uid && x.profileId !== profileId
        );
    };

    removeAllShareListeners = async (): Promise<void> => {
        for (let listener; (listener = this.shareListeners.pop()); ) {
            listener.unsubscribe();
        }
    };

    hasShareListener = (uid: string, profileId: string): boolean => {
        return (
            this.shareListeners.find(
                (profileListener) =>
                    profileListener.uid === uid &&
                    profileListener.profileId === profileId
            ) !== undefined
        );
    };
}
