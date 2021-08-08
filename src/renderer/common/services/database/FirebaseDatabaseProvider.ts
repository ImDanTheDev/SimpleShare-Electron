import IAccountInfo from '../auth/IAccountInfo';
import IProfile from '../auth/IProfile';
import IPublicGeneralInfo from '../auth/IPublicGeneralInfo';
import IShare from '../auth/IShare';
import IDatabaseProvider from './IDatabaseProvider';

import {
    Firestore,
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where,
    limit,
    onSnapshot,
} from 'firebase/firestore';
import SimpleShareError, { ErrorCode } from '../../SimpleShareError';

interface IShareListener {
    uid: string;
    profileId: string;
    unsubscribe: () => void;
}

export default class FirestoreDatabaseProvider implements IDatabaseProvider {
    private readonly firestore: Firestore;
    private shareListeners: IShareListener[] = [];

    private onShareAddedCallback: (share: IShare) => void;
    private onShareDeletedCallback: (share: IShare) => void;
    private onShareModifiedCallback: (share: IShare) => void;

    constructor(
        onShareAdded: (share: IShare) => void,
        onShareDeleted: (share: IShare) => void,
        onShareModified: (share: IShare) => void
    ) {
        this.firestore = getFirestore();
        this.onShareAddedCallback = onShareAdded;
        this.onShareDeletedCallback = onShareDeleted;
        this.onShareModifiedCallback = onShareModified;
    }

    getAccountInfo = async (uid: string): Promise<IAccountInfo | undefined> => {
        try {
            const accountsCollectionRef = collection(
                this.firestore,
                'accounts'
            );
            const accountDocRef = doc(accountsCollectionRef, uid);
            const accountDoc = await getDoc(accountDocRef);

            if (accountDoc.exists()) {
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
            const accountsCollectionRef = collection(
                this.firestore,
                'accounts'
            );
            const accountDocRef = doc(accountsCollectionRef, uid);
            const accountDoc = await getDoc(accountDocRef);
            return accountDoc.exists();
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
            const accountsCollectionRef = collection(
                this.firestore,
                'accounts'
            );
            const accountDocRef = doc(accountsCollectionRef, uid);
            await setDoc(accountDocRef, accountInfo);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    };

    getUidByPhoneNumber = async (
        phoneNumber: string
    ): Promise<string | undefined> => {
        const accountsCollectionRef = collection(this.firestore, 'accounts');

        const q = query(
            accountsCollectionRef,
            where('phoneNumber', '==', phoneNumber),
            limit(1)
        );
        const matchingAccountDocs = await getDocs(q);

        if (matchingAccountDocs.size <= 0) return undefined;
        const matchingAccountDoc = matchingAccountDocs.docs[0];
        return matchingAccountDoc.id;
    };

    getPublicGeneralInfo = async (
        uid: string
    ): Promise<IPublicGeneralInfo | undefined> => {
        const generalInfoDocRef = doc(
            collection(
                doc(collection(this.firestore, 'accounts'), uid),
                'public'
            ),
            'GeneralInfo'
        );

        const generalInfoDoc = await getDoc(generalInfoDocRef);
        if (generalInfoDoc.exists()) {
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
        const generalInfoDocRef = doc(
            collection(
                doc(collection(this.firestore, 'accounts'), uid),
                'public'
            ),
            'GeneralInfo'
        );
        await setDoc(generalInfoDocRef, info);
    };

    createDefaultProfile = async (uid: string): Promise<boolean> => {
        try {
            const defaultProfileDocRef = doc(
                collection(
                    doc(collection(this.firestore, 'accounts'), uid),
                    'profiles'
                ),
                'default'
            );

            await setDoc(defaultProfileDocRef, {
                name: 'default',
            });

            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    };

    createProfile = async (uid: string, profile: IProfile): Promise<void> => {
        try {
            const profileDocRef = doc(
                collection(
                    doc(collection(this.firestore, 'accounts'), uid),
                    'profiles'
                ),
                profile.id
            );

            await setDoc(profileDocRef, {
                name: profile.name,
            });

            throw new SimpleShareError(ErrorCode.UNEXPECTED_DATABASE_ERROR);
        } catch (e) {
            console.error(e);
            throw new SimpleShareError(ErrorCode.UNEXPECTED_DATABASE_ERROR);
        }
    };

    getAllProfiles = async (uid: string): Promise<IProfile[]> => {
        const profilesCollectionRef = collection(
            doc(collection(this.firestore, 'accounts'), uid),
            'profiles'
        );

        const profileDocs = await getDocs(profilesCollectionRef);

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
        const defaultProfileDocRef = doc(
            collection(
                doc(collection(this.firestore, 'accounts'), uid),
                'profiles'
            ),
            profileId
        );

        const profileDoc = await getDoc(defaultProfileDocRef);
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
        const profilesCollectionRef = collection(
            doc(collection(this.firestore, 'accounts'), uid),
            'profiles'
        );

        const q = query(
            profilesCollectionRef,
            where('name', '==', name),
            limit(1)
        );

        const matchingProfileDocs = await getDocs(q);

        if (matchingProfileDocs.size <= 0) return undefined;
        const matchingProfileDoc = matchingProfileDocs.docs[0];
        return matchingProfileDoc.id;
    };

    deleteProfile = async (
        uid: string,
        profileId: string
    ): Promise<boolean> => {
        try {
            const profileDocRef = doc(
                collection(
                    doc(collection(this.firestore, 'accounts'), uid),
                    'profiles'
                ),
                profileId
            );

            await deleteDoc(profileDocRef);

            const sharesCollection = collection(
                doc(collection(this.firestore, 'shares'), uid),
                profileId
            );
            const shareDocs = await getDocs(sharesCollection);
            shareDocs.docs.forEach(async (doc) => {
                await this.deleteShareById(uid, profileId, doc.id);
            });

            return true;
        } catch (e) {
            return false;
        }
    };

    createShare = async (share: IShare): Promise<void> => {
        const shareDoc = doc(
            collection(
                doc(collection(this.firestore, 'shares'), share.toUid),
                share.toProfileId
            ),
            share.id
        );
        await setDoc(shareDoc, share);
    };

    deleteShareById = async (
        userId: string,
        profileId: string,
        shareId: string | undefined
    ): Promise<void> => {
        const shareDoc = doc(
            collection(
                doc(collection(this.firestore, 'shares'), userId),
                profileId
            ),
            shareId
        );
        deleteDoc(shareDoc);
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
        const profileSharesCollection = collection(
            doc(collection(this.firestore, 'shares'), uid),
            profileId
        );
        const unsubscribe = onSnapshot(profileSharesCollection, (snapshot) => {
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
}
