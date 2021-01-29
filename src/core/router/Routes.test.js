import * as Routes from './Routes';

describe('routes', () => {

  test('should export "ORG_ID_PARAM"', () => {
    expect(Routes.ORG_ID_PARAM).toEqual(':organizationId');
  });

  test('should export "PRINCIPAL_ID_PARAM"', () => {
    expect(Routes.PRINCIPAL_ID_PARAM).toEqual(':principalId');
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

  test('should export the correct ORG_PEOPLE path', () => {
    expect(Routes.ORG_PEOPLE).toEqual('/orgs/:organizationId/people');
  });

  test('should export the correct ORG_MEMBER path', () => {
    expect(Routes.ORG_MEMBER).toEqual('/orgs/:organizationId/people/:principalId');
  });

});
