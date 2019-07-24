/*
 * @flow
 */

const ROOT :string = '/';

const LOGIN :string = '/login';
const ORGS :string = '/orgs';

const ID_PATH :':id' = ':id';
const ORG :string = `${ORGS}/${ID_PATH}`;
const ORG_PERMISSIONS :string = `${ORGS}/${ID_PATH}/permissions`;
const ORG_ENTITY_SETS :string = `${ORGS}/${ID_PATH}/entitysets`;

export {
  ID_PATH,
  LOGIN,
  ORG,
  ORGS,
  ORG_ENTITY_SETS,
  ORG_PERMISSIONS,
  ROOT,
};
