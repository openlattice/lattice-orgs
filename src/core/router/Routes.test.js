import * as Routes from './Routes';

describe('routes', () => {

  test('should export "ORG_ID_PARAM"', () => {
    expect(Routes.ORG_ID_PARAM).toEqual(':organizationId');
  });

  test('should export "PRINCIPAL_ID_PARAM"', () => {
    expect(Routes.ORG_ID_PARAM).toEqual(':principalId');
  });

  test('should export the correct ROOT path', () => {
    expect(Routes.ROOT).toEqual('/');
  });

  test('should export the correct ORGS path', () => {
    expect(Routes.ORGS).toEqual('/orgs');
  });

  test('should export the correct ORG path', () => {
    expect(Routes.ORG).toEqual('/orgs/:organizationId');
  });

  test('should export the correct ORG_MEMBERS path', () => {
    expect(Routes.ORG_MEMBERS).toEqual('/orgs/:organizationId/members');
  });

  test('should export the correct ORG_MEMBER path', () => {
    expect(Routes.ORG_MEMBER).toEqual('/orgs/:organizationId/members/:principalId');
  });

});
