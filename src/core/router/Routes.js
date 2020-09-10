/*
 * @flow
 */

const ORG_ID_PARAM :':organizationId' = ':organizationId';
const PRINCIPAL_ID_PARAM :':principalId' = ':principalId';
const ROLE_ID_PARAM :':roleId' = ':roleId';

export {
  ORG_ID_PARAM,
  PRINCIPAL_ID_PARAM,
  ROLE_ID_PARAM,
};

const ROOT :'/' = '/';
const ORGS :'/orgs' = '/orgs';

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG :'/orgs/:organizationId' = `${ORGS}/${ORG_ID_PARAM}`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_ROLE :'/orgs/:organizationId/roles/:roleId' = `${ORG}/roles/${ROLE_ID_PARAM}`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_MEMBERS :'/orgs/:organizationId/members' = `${ORG}/members`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_MEMBER :'/orgs/:organizationId/members/:principalId' = `${ORG_MEMBERS}/${PRINCIPAL_ID_PARAM}`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_SETTINGS :'/orgs/:organizationId/settings' = `${ORGS}/${ORG_ID_PARAM}/settings`;

export {
  ORG,
  ORGS,
  ORG_MEMBER,
  ORG_MEMBERS,
  ORG_ROLE,
  ORG_SETTINGS,
  ROOT,
};
