import { ensureNumber } from '../../utils/ensures/ensureNumber.js';

class Config {
  port = ensureNumber(Number(process.env.PORT))
}

export const config = new Config()
