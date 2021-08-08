import AuthService, { AuthProviderType } from './auth/AuthService';
import InitService, { InitServiceType } from './init/InitService';

export const initService = new InitService(InitServiceType.Firebase);
export const authService = new AuthService(AuthProviderType.Firebase);
