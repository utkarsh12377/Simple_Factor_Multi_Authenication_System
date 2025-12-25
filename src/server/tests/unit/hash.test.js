const { hashPassword, verifyPassword } = require('../../utils/hash');

describe('hash utils', () => {
  test('hash and verify password', async () => {
    const pwd = 'Test@1234';
    const hashed = await hashPassword(pwd);
    expect(hashed).not.toBe(pwd);
    const ok = await verifyPassword(pwd, hashed);
    expect(ok).toBe(true);
    expect(await verifyPassword('wrongpwd', hashed)).toBe(false);
  });
});