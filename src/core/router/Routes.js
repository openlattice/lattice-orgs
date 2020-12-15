/*
 * @flow
 */

const DATA_SET_ID_PARAM :':dataSetId' = ':dataSetId';
const ORG_ID_PARAM :':organizationId' = ':organizationId';
const PRINCIPAL_ID_PARAM :':principalId' = ':principalId';
const ROLE_ID_PARAM :':roleId' = ':roleId';

export {
  DATA_SET_ID_PARAM,
  ORG_ID_PARAM,
  PRINCIPAL_ID_PARAM,
  ROLE_ID_PARAM,
};

const ROOT :'/' = '/';

const ACCOUNT :'/account' = '/account';
const ORGS :'/orgs' = '/orgs';

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG :'/orgs/:organizationId' = `${ORGS}/${ORG_ID_PARAM}`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_DATA_SETS :'/orgs/:organizationId/dataSets' = `${ORG}/dataSets`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_DATA_SET :'/orgs/:organizationId/dataSets/:dataSetId' = `${ORG_DATA_SETS}/${DATA_SET_ID_PARAM}`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_DATA_SET_DATA :'/orgs/:organizationId/dataSets/:dataSetId/data' = `${ORG_DATA_SET}/data`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_ROLE :'/orgs/:organizationId/roles/:roleId' = `${ORG}/roles/${ROLE_ID_PARAM}`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_MEMBERS :'/orgs/:organizationId/members' = `${ORG}/members`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_MEMBER :'/orgs/:organizationId/members/:principalId' = `${ORG_MEMBERS}/${PRINCIPAL_ID_PARAM}`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_OBJ_PERMISSIONS :'/orgs/:organizationId/permissions' = `${ORG}/permissions`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_SETTINGS :'/orgs/:organizationId/settings' = `${ORGS}/${ORG_ID_PARAM}/settings`;

export {
  ACCOUNT,
  ORG,
  ORGS,
  ORG_DATA_SET,
  ORG_DATA_SETS,
  ORG_DATA_SET_DATA,
  ORG_MEMBER,
  ORG_MEMBERS,
  ORG_OBJ_PERMISSIONS,
  ORG_ROLE,
  ORG_SETTINGS,
  ROOT,
};
