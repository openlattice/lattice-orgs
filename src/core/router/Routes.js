/*
 * @flow
 */

/* eslint-disable max-len */

const DATA_SET_ID_PARAM :':dataSetId' = ':dataSetId';
const ENTITY_KEY_ID :':entityKeyId' = ':entityKeyId';
const ORG_ID_PARAM :':organizationId' = ':organizationId';
const PRINCIPAL_ID_PARAM :':principalId' = ':principalId';
const REQUEST_ID_PARAM :':requestId' = ':requestId';
const ROLE_ID_PARAM :':roleId' = ':roleId';

export {
  DATA_SET_ID_PARAM,
  ENTITY_KEY_ID,
  ORG_ID_PARAM,
  PRINCIPAL_ID_PARAM,
  REQUEST_ID_PARAM,
  ROLE_ID_PARAM,
};

const ROOT :'/' = '/';

const ACCOUNT :'/account' = '/account';
const ORGS :'/orgs' = '/orgs';

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG :'/orgs/:organizationId' = `${ORGS}/${ORG_ID_PARAM}`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_ACCESS_REQUESTS :'/orgs/:organizationId/access' = `${ORG}/access`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_ACCESS_REQUEST :'/orgs/:organizationId/access/request/:requestId' = `${ORG_ACCESS_REQUESTS}/request/${REQUEST_ID_PARAM}`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_DATA_SETS :'/orgs/:organizationId/dataSets' = `${ORG}/dataSets`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_DATA_SET :'/orgs/:organizationId/dataSets/:dataSetId' = `${ORG_DATA_SETS}/${DATA_SET_ID_PARAM}`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_DATA_SET_OBJECT_PERMISSIONS :'/orgs/:organizationId/dataSets/:dataSetId/permissions' = `${ORG_DATA_SET}/permissions`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_DATA_SET_DATA :'/orgs/:organizationId/dataSets/:dataSetId/data' = `${ORG_DATA_SET}/data`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_DATA_SET_DATA_DETAILS :'/orgs/:organizationId/dataSets/:dataSetId/data/:entityKeyId' = `${ORG_DATA_SET_DATA}/${ENTITY_KEY_ID}`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_PEOPLE :'/orgs/:organizationId/people' = `${ORG}/people`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_MEMBER :'/orgs/:organizationId/people/:principalId' = `${ORG_PEOPLE}/${PRINCIPAL_ID_PARAM}`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_OBJECT_PERMISSIONS :'/orgs/:organizationId/permissions' = `${ORG}/permissions`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_ROLES :'/orgs/:organizationId/roles' = `${ORG}/roles`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_ROLE :'/orgs/:organizationId/roles/:roleId' = `${ORG_ROLES}/${ROLE_ID_PARAM}`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_ROLE_OBJECT_PERMISSIONS :'/orgs/:organizationId/roles/:roleId/permissions' = `${ORG_ROLE}/permissions`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_SETTINGS :'/orgs/:organizationId/settings' = `${ORGS}/${ORG_ID_PARAM}/settings`;

export {
  ACCOUNT,
  ORG,
  ORGS,
  ORG_ACCESS_REQUEST,
  ORG_ACCESS_REQUESTS,
  ORG_DATA_SET,
  ORG_DATA_SETS,
  ORG_DATA_SET_DATA,
  ORG_DATA_SET_DATA_DETAILS,
  ORG_DATA_SET_OBJECT_PERMISSIONS,
  ORG_MEMBER,
  ORG_OBJECT_PERMISSIONS,
  ORG_PEOPLE,
  ORG_ROLE,
  ORG_ROLES,
  ORG_ROLE_OBJECT_PERMISSIONS,
  ORG_SETTINGS,
  ROOT,
};
