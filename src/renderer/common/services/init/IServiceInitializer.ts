export default interface IServiceInitializer {
    initialize: () => Promise<void>;
}
