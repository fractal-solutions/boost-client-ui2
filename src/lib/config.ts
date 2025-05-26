export const PRODUCTION = true;
export const chain_ip =  PRODUCTION ? 'http://192.9.241.89:8222': 'http://127.0.0.1:2222';
export const chain_ws = PRODUCTION ? 'ws://192.9.241.89:8222/ws': 'ws://127.0.0.1:2222/ws';
export const smartcron_ip = PRODUCTION ? 'http://192.9.241.89:8223': 'http://127.0.0.1:2223';
export const metadata_ip = PRODUCTION ?  'http://192.9.241.89:8224': 'http://127.0.0.1:2224';
export const users_ip = PRODUCTION ?  'http://192.9.241.89:8225': 'http://127.0.0.1:2225';
export const users_ws = PRODUCTION ? 'ws://192.9.241.89:8225/ws': 'ws://127.0.0.1:2225/ws';