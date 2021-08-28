import AuthService, { AuthProviderType } from './AuthService';
import DatabaseService, { DatabaseProviderType } from './DatabaseService';
import InitService, { InitServiceType } from './init/InitService';

export const initService = new InitService(InitServiceType.Firebase);
export const authService = new AuthService(AuthProviderType.Firebase);
export const databaseService = new DatabaseService(
    DatabaseProviderType.Firestore
);
