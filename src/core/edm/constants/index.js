/*
 * @flow
 */

import _capitalize from 'lodash/capitalize';
import { Constants, Models, Types } from 'lattice';
import type { EntitySetFlagType } from 'lattice';

import type { ReactSelectOption } from '../../../types';

const { OPENLATTICE_ID_FQN } = Constants;
const { FQN } = Models;
const { EntitySetFlagTypes } = Types;

const APPS = {
  ACCESS_REQUESTS: 'access_requests',
};

const FQNS = {
  CONTACT_EMAIL: FQN.of('contact.Email'),
  CONTACT_PHONE_NUMBER: FQN.of('contact.phonenumber'),
  EKID: FQN.of(OPENLATTICE_ID_FQN),
  OL_ACL_KEYS: FQN.of('ol.aclkeys'),
  OL_COLUMN_NAME: FQN.of('ol.column_name'),
  OL_DATA_SET_ID: FQN.of('ol.datasetid'),
  OL_DATA_SET_NAME: FQN.of('ol.dataset_name'),
  OL_DATA_TYPE: FQN.of('ol.datatype'),
  OL_DATE_TIME: FQN.of('ol.datetime'),
  OL_DESCRIPTION: FQN.of('ol.description'),
  OL_FLAGS: FQN.of('ol.flags'),
  OL_ID: FQN.of('ol.id'),
  OL_INDEX: FQN.of('ol.index'),
  OL_PERMISSIONS: FQN.of('ol.permissions'),
  OL_REQUEST_DATE_TIME: FQN.of('ol.requestdatetime'),
  OL_REQUEST_PRINCIPAL_ID: FQN.of('ol.requestprincipalid'),
  OL_RESPONSE_DATE_TIME: FQN.of('ol.responsedatetime'),
  OL_RESPONSE_PRINCIPAL_ID: FQN.of('ol.responseprincipalid'),
  OL_SCHEMA: FQN.of('ol.schema'),
  OL_STANDARDIZED: FQN.of('ol.standardized'),
  OL_STATUS: FQN.of('ol.status'),
  OL_TEXT: FQN.of('ol.text'),
  OL_TITLE: FQN.of('ol.title'),
  OL_TYPE: FQN.of('ol.type'),
};

const ES_FLAG_TYPE_RS_OPTIONS :ReactSelectOption<EntitySetFlagType>[] = [
  { label: _capitalize(EntitySetFlagTypes.ASSOCIATION), value: EntitySetFlagTypes.ASSOCIATION },
  { label: _capitalize(EntitySetFlagTypes.AUDIT), value: EntitySetFlagTypes.AUDIT },
  { label: _capitalize(EntitySetFlagTypes.EXTERNAL), value: EntitySetFlagTypes.EXTERNAL },
  { label: _capitalize(EntitySetFlagTypes.LINKING), value: EntitySetFlagTypes.LINKING },
  { label: _capitalize(EntitySetFlagTypes.METADATA), value: EntitySetFlagTypes.METADATA },
  { label: _capitalize(EntitySetFlagTypes.TRANSPORTED), value: EntitySetFlagTypes.TRANSPORTED },
  { label: _capitalize(EntitySetFlagTypes.UNVERSIONED), value: EntitySetFlagTypes.UNVERSIONED },
];

export {
  APPS,
  ES_FLAG_TYPE_RS_OPTIONS,
  FQNS,
};
