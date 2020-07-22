import * as Routes from './Routes';

describe('routes', () => {

  test('should export the correct ROOT path', () => {
    expect(Routes.ROOT).toEqual('/');
  });

  test('should export the correct ORGS path', () => {
    expect(Routes.ORGS).toEqual('/orgs');
  });

  test('should export the correct ORG path', () => {
    expect(Routes.ORG).toEqual('/orgs/:id');
  });

});
