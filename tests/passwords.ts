import { execFileSync } from 'child_process';
import dotenv from 'dotenv';

export default function globalSetup() {
  const config = dotenv.config();

  if (!Object.keys(process.env).some((key) => key.startsWith('OP_SESSION_'))) {
    throw new Error('OP_SESSION_* environment variable is not set');
  }

  if (!config.parsed) {
    throw config.error;
  }

  for (const [name, id] of Object.entries(config.parsed)) {
    if (!name.startsWith('OP_SESSION_') && name !== 'downloadDirectory') {
      passwords[name] = get1PasswordItem(name, id);
    }
  }

  process.env.passwords = JSON.stringify(passwords);
}

export const passwords: { [website: string]: { [key: string]: string } } = JSON.parse(process.env.passwords || '{}');

function get1PasswordItem(name: string, id: string) {
  console.log('Getting password for', name);
  const fields = (
    JSON.parse(execFileSync('op', ['item', 'get', id, '--format', 'json'], { encoding: 'utf-8' })) as {
      fields: { id: string; value: string }[];
    }
  ).fields
    .filter(({ id }) => id)
    .map(({ id, value }) => [id, value]);
  console.log('Fields:', fields.map(([id]) => id).join(', '));

  return Object.fromEntries(fields);
}
