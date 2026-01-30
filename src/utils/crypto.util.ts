import * as bcrypt from 'bcrypt';

export async function hashValue(value: string, saltRounds: number = 10): Promise<string> {
  return bcrypt.hash(value, saltRounds);
}


export async function compareValue(value: string, hash: string): Promise<boolean> {
  return bcrypt.compare(value, hash);
}
