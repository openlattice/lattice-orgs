/*
 * @flow
 */

const ID_PARAM :':id' = ':id';
const ORG_ID_PARAM :':orgId' = ':orgId';
const DATA_SET_ID_PARAM :':dataSetId' = ':dataSetId';

const ROOT :string = '/';
const LOGIN :string = '/login';
const ORGS :string = '/orgs';

const ORG :string = `${ORGS}/${ID_PARAM}`;
const ORG_ADMIN :string = `${ORGS}/${ID_PARAM}/admin`;
const ORG_DATA_SETS :string = `${ORGS}/${ID_PARAM}/datasets`;
const ORG_PERMISSIONS :string = `${ORGS}/${ID_PARAM}/permissions`;
const ORG_ROLES :string = `${ORGS}/${ID_PARAM}/roles`;

const DATA_SET :string = `${ORGS}/${ORG_ID_PARAM}/${DATA_SET_ID_PARAM}`;

export {
  DATA_SET,
  DATA_SET_ID_PARAM,
  ID_PARAM,
  LOGIN,
  ORG,
  ORGS,
  ORG_ADMIN,
  ORG_DATA_SETS,
  ORG_ID_PARAM,
  ORG_PERMISSIONS,
  ORG_ROLES,
  ROOT,
};
