/*
 * @flow
 */

const SWITCH_ORGANIZATION :'SWITCH_ORGANIZATION' = 'SWITCH_ORGANIZATION';
const switchOrganization = (orgId :UUID) :Object => ({
  orgId,
  type: SWITCH_ORGANIZATION
});

export {
  SWITCH_ORGANIZATION,
  switchOrganization,
};
