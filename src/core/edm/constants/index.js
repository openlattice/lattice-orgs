/*
 * @flow
 */

import { Constants, Models } from 'lattice';

const { OPENLATTICE_ID_FQN } = Constants;
const { FQN } = Models;

const ESNS = {
  ACCESS_REQUESTS: 'ACCESS_REQUESTS',
};

const FQNS = {
  EKID: FQN.of(OPENLATTICE_ID_FQN),
  OL_ACL_KEYS: FQN.of('ol.aclkeys'),
  OL_COLUMN_INFO: FQN.of('ol.columninfo'),
  OL_DATE_TIME: FQN.of('ol.datetime'),
  OL_ID: FQN.of('ol.id'),
  OL_REQUEST_DATE_TIME: FQN.of('ol.requestdatetime'),
  OL_REQUEST_PRINCIPAL_ID: FQN.of('ol.requestprincipalid'),
  OL_RESPONSE_DATE_TIME: FQN.of('ol.responsedatetime'),
  OL_RESPONSE_PRINCIPAL_ID: FQN.of('ol.responseprincipalid'),
  OL_STANDARDIZED: FQN.of('ol.standardized'),
  OL_STATUS: FQN.of('ol.status'),
  OL_TEXT: FQN.of('ol.text'),
};

// TODO: DELETE ONCE PROPERLY IMPLEMENTED
const SHIP_ROOM_ORG_ID = '81999873-5b22-434e-be9b-1f98931ae2e4';
const SR_DS_META_ESID = '091695e1-a971-40ee-9956-a6a05c5942dd';
const JBI_ACCESS_REQUESTS_ESID = '279ef887-9a9e-4954-9ab8-b529bc0d732a';

export {
  ESNS,
  FQNS,
  JBI_ACCESS_REQUESTS_ESID,
  SHIP_ROOM_ORG_ID,
  SR_DS_META_ESID,
};
