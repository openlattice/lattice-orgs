/*
 * @flow
 */

import { Constants, Models } from 'lattice';

const { OPENLATTICE_ID_FQN } = Constants;
const { FQN } = Models;

const FQNS = {
  EKID: FQN.of(OPENLATTICE_ID_FQN),
  OL_COLUMN_INFO: FQN.of('ol.columninfo'),
  OL_DATE_TIME: FQN.of('ol.datetime'),
  OL_ID: FQN.of('ol.id'),
  OL_STANDARDIZED: FQN.of('ol.standardized'),
};

// TODO: DELETE ONCE PROPERLY IMPLEMENTED
const SHIP_ROOM_ORG_ID = '81999873-5b22-434e-be9b-1f98931ae2e4';
const SR_DS_META_ESID = '091695e1-a971-40ee-9956-a6a05c5942dd';

export {
  FQNS,
  SHIP_ROOM_ORG_ID,
  SR_DS_META_ESID,
};
