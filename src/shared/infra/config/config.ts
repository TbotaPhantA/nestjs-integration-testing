import { ensureNumber } from '../../utils/ensures/ensureNumber.js';
import { ensureTruthy } from '../../utils/ensures/ensureTruthy.js';

class Config {
  port = ensureNumber(Number(process.env.PORT))
  db = {
    host: ensureTruthy(process.env.DB_HOST),
    port: ensureNumber(Number(process.env.DB_PORT)),
    name: ensureTruthy(process.env.DB_NAME),
    username: ensureTruthy(process.env.DB_USERNAME),
    password: ensureTruthy(process.env.DB_PASSWORD),
    synchronize: process.env.DB_SYNCHRONIZE === 'true'
  }
}

export const config = new Config()
