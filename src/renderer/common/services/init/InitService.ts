import FirebaseInitializer from './FirebaseInitializer';
import IServiceInitializer from './IServiceInitializer';

export enum InitServiceType {
    Firebase,
}

export default class InitService {
    private readonly initServiceType: InitServiceType;
    initService: IServiceInitializer | undefined;

    isServiceInitialized = false;

    constructor(initServiceType: InitServiceType) {
        this.initServiceType = initServiceType;
    }

    initialize = (): void => {
        if (this.initService && this.isServiceInitialized) {
            console.log('Service Initializer is already initialized');
            return;
        }

        switch (this.initServiceType) {
            case InitServiceType.Firebase:
                this.initService = new FirebaseInitializer();
                break;
        }

        this.initService.initialize();

        this.isServiceInitialized = true;
        console.log('Service Initializer initialized.');
    };
}
