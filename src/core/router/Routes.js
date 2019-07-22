/*
 * @flow
 */

const ROOT :string = '/';

const LOGIN :string = '/login';
const ORGS :string = '/orgs';

const ID_PATH :':id' = ':id';
const ORG :string = `${ORGS}/${ID_PATH}`;

export {
  ID_PATH,
  LOGIN,
  ORG,
  ORGS,
  ROOT,
};
