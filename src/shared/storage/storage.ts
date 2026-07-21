import { createMMKV } from "react-native-mmkv";

/**
 * Storage síncrono — espelha a API de localStorage usada no projeto web,
 * permitindo que repositories e use cases sejam compartilhados sem refactor async.
 */
export const storage = createMMKV({ id: "yggdrasil" });
