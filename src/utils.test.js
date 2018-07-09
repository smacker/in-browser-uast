import { roleToString } from './utils';

describe('roleToString', () => {
  const expectedStrings = {
    0: 'Invalid',
    19: 'Statement',
    22: 'LessThan',
    23: 'LessThanOrEqual'
  };

  Object.keys(expectedStrings).forEach(role => {
    const name = expectedStrings[role];
    it(`${role} => ${name}`, () => {
      expect(roleToString(role)).toEqual(name);
    });
  });
});
