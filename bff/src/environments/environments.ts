import * as dotenv from 'dotenv';

dotenv.config();

export const environments = {
  PORT: process.env.PORT || 3000,
  BACK_END: process.env.BACK_END || 'http://localhost:8080/api',
  PRIVATE_KEY: process.env.PRIVATE_KEY || `-----BEGIN RSA PRIVATE KEY-----
    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
    -----END RSA PRIVATE KEY-----`,
  NODE_ENV: process.env.NODE_ENV || 'localhost'
};