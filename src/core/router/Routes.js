/*
 * @flow
 */

const ID_PARAM :':id' = ':id';

const ROOT :string = '/';
const LOGIN :string = '/login';
const ORGS :string = '/orgs';

const ORG :string = `${ORGS}/${ID_PARAM}`;
const ORG_PERMISSIONS :string = `${ORGS}/${ID_PARAM}/permissions`;
const ORG_ENTITY_SETS :string = `${ORGS}/${ID_PARAM}/entitysets`;

export {
  ID_PARAM,
  LOGIN,
  ORG,
  ORGS,
  ORG_ENTITY_SETS,
  ORG_PERMISSIONS,
  ROOT,
};
