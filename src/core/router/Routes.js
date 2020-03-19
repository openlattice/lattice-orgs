/*
 * @flow
 */

const ID_PARAM :':id' = ':id';

const ROOT :string = '/';
const LOGIN :string = '/login';
const ORGS :string = '/orgs';

const ORG :string = `${ORGS}/${ID_PARAM}`;
const ORG_ADMIN :string = `${ORGS}/${ID_PARAM}/admin`;
const ORG_DATA_SETS :string = `${ORGS}/${ID_PARAM}/datasets`;
const ORG_PERMISSIONS :string = `${ORGS}/${ID_PARAM}/permissions`;
const ORG_ROLES :string = `${ORGS}/${ID_PARAM}/roles`;

export {
  ID_PARAM,
  LOGIN,
  ORG,
  ORGS,
  ORG_ADMIN,
  ORG_DATA_SETS,
  ORG_PERMISSIONS,
  ORG_ROLES,
  ROOT,
};
