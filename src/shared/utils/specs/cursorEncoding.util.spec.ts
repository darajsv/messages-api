import { decodeCursor, encodeCursor } from '../cursorEncoding.util';

describe('cursor utils (encodeCursor / decodeCursor)', () => {
  it('encodes an object to a base-64 JSON string', () => {
    const key = { id: 'abc', sentAt: 42 };

    const encoded = encodeCursor(key);

    expect(encoded).toMatch(/^[A-Za-z0-9+/=]+$/);

    const json = Buffer.from(encoded, 'base64').toString('utf8');
    expect(json).toBe(JSON.stringify(key));
  });

  it('decodeCursor(encodeCursor(x)) returns the original object (round-trip)', () => {
    const original = { foo: 'bar', num: 123, nested: { ok: true } };

    const roundTrip = decodeCursor(encodeCursor(original));

    expect(roundTrip).toEqual(original);
  });

  it('handles empty objects correctly', () => {
    const encoded = encodeCursor({});
    const decoded = decodeCursor(encoded);

    expect(decoded).toEqual({});
  });

  it('throws when given an invalid base64 string', () => {
    expect(() => decodeCursor('not base64')).toThrow();
  });
});
