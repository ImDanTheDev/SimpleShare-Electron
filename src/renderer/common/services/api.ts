import AuthService, { AuthProviderType } from './auth/AuthService';
import DatabaseService, {
    DatabaseProviderType,
} from './database/DatabaseService';
import InitService, { InitServiceType } from './init/InitService';

export const initService = new InitService(InitServiceType.Firebase);
export const authService = new AuthService(AuthProviderType.Firebase);
export const databaseService = new DatabaseService(
    DatabaseProviderType.Firestore
);
