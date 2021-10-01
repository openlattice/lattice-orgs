/*
 * @flow
 */

/* eslint-disable max-len */

import _capitalize from 'lodash/capitalize';
import { List, Map } from 'immutable';
import { Constants, Models, Types } from 'lattice';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { EntitySetFlagType, PermissionType } from 'lattice';

import type { ReactSelectOption } from '../types';

export const {
  AT_CLASS,
  OPENLATTICE_ID_FQN,
} = Constants;

export const {
  APP,
  AUTH,
  DATA,
  EDM,
  ENTITY_SETS,
  ENTITY_SETS_INDEX_MAP,
  ENTITY_TYPES,
  ENTITY_TYPES_INDEX_MAP,
  ERROR,
  FILTER,
  HITS,
  MEMBERS,
  ORGANIZATIONS,
  PAGE,
  PERMISSIONS,
  PROPERTY_TYPES,
  PROPERTY_TYPES_INDEX_MAP,
  QUERY,
  REQUEST_STATE,
  RESET,
  SEARCH,
  TOTAL_HITS,
  USERS,
} = ReduxConstants;

export const ACCOUNT :'account' = 'account';
export const ACES :'aces' = 'aces';
export const APP_INSTALLS :'appInstalls' = 'appInstalls';
export const ATLAS_CREDENTIALS :'atlasCredentials' = 'atlasCredentials';
export const AUTHENTICATED_USER :'AuthenticatedUser' = 'AuthenticatedUser';
export const COLLABORATIONS :'collaborations' = 'collaborations';
export const COLLABORATIONS_BY_DATA_SET_ID :'collaborationsByDataSetId' = 'collaborationsByDataSetId';
export const COLLABORATIONS_BY_ORGANIZATION_ID :'collaborationsByOrganizationId' = 'collaborationsByOrganizationId';
export const COLLABORATION_DATA_SETS :'collaborationDataSets' = 'collaborationDataSets';
export const CONTACTS :'contacts' = 'contacts';
export const CURRENT :'current' = 'current';
export const CURRENT_ROLE_AUTHORIZATIONS :'currentRoleAuthorizations' = 'currentRoleAuthorizations';
export const DATABASE_DETAILS :'databaseDetails' = 'databaseDetails';
export const DATABASE_NAME :'databaseName' = 'databaseName';
export const DATA_SET :'dataSet' = 'dataSet';
export const DATA_SET_COLUMNS :'dataSetColumns' = 'dataSetColumns';
export const DATA_SET_ID :'dataSetId' = 'dataSetId';
export const DATA_SET_PERMISSIONS_PAGE :'dataSetPermissionsPage' = 'dataSetPermissionsPage';
export const DATA_SET_SCHEMA :'dataSetSchema' = 'dataSetSchema';
export const DATA_SET_TYPE :'dataSetType' = 'dataSetType';
export const DATA_TYPE :'dataType' = 'dataType';
export const DESCRIPTION :'description' = 'description';
export const ENTITY_NEIGHBORS_MAP :'entityNeighborsMap' = 'entityNeighborsMap';
export const ENTITY_SET_DATA :'entitySetData' = 'entitySetData';
export const ENTITY_SET_IDS :'entitySetIds' = 'entitySetIds';
export const ENTITY_SET_SIZE_MAP :'entitySetSizeMap' = 'entitySetSizeMap';
export const ENTITY_TYPE_ID :'entityTypeId' = 'entityTypeId';
export const ERR_INVALID_ACL_KEY :'invalid acl key' = 'invalid acl key';
export const ERR_INVALID_PRINCIPAL_ID :'invalid principal id' = 'invalid principal id';
export const ERR_INVALID_REQUEST_STATUS :'invalid RequestStatusType' = 'invalid RequestStatusType';
export const ERR_INVALID_UUID :'invalid uuid' = 'invalid uuid';
export const ERR_MISSING_ORG :'organization missing in the redux store' = 'organization missing in the redux store';
export const ERR_UNEXPECTED_SEARCH_RESULTS :'unexpected search results' = 'unexpected search results';
export const ERR_UNEXPECTED_STATE :'unexpected state' = 'unexpected state';
export const EXPLORE :'explore' = 'explore';
export const FLAGS :'flags' = 'flags';
export const ID :'id' = 'id';
export const INTEGRATION_DETAILS :'integrationDetails' = 'integrationDetails';
export const IS_OWNER :'isOwner' = 'isOwner';
export const MAX_HITS_10 :10 = 10;
export const MAX_HITS_20 :20 = 20;
export const MAX_HITS_10000 :10000 = 10000;
export const METADATA :'metadata' = 'metadata';
export const MY_KEYS :'myKeys' = 'myKeys';
export const NAME :'name' = 'name';
export const NEW_ORGANIZATION_ID :'newOrganizationId' = 'newOrganizationId';
export const OPENLATTICE :'openlattice' = 'openlattice';
export const ORGANIZATION :'organization' = 'organization';
export const ORGANIZATION_ID :'organizationId' = 'organizationId';
export const ORGANIZATION_IDS :'organizationIds' = 'organizationIds';
export const ORG_DATA_SETS :'organizationDataSets' = 'organizationDataSets';
export const ORG_DATA_SET_COLUMNS :'organizationDataSetColumns' = 'organizationDataSetColumns';
export const PAGE_PERMISSIONS_BY_DATA_SET :'pagePermissionsByDataSet' = 'pagePermissionsByDataSet';
export const PRINCIPAL :'principal' = 'principal';
export const SECURABLE_PRINCIPAL_CLASS :'com.openlattice.authorization.SecurablePrincipal' = 'com.openlattice.authorization.SecurablePrincipal';
export const SELECTED_ENTITY_DATA :'selectedEntityData' = 'selectedEntityData';
export const TAGS :'tags' = 'tags';
export const TITLE :'title' = 'title';
export const TOTAL_PERMISSIONS :'totalPermissions' = 'totalPermissions';
export const USER_SEARCH_RESULTS :'userSearchResults' = 'userSearchResults';
export const VISIBILITY :'visibility' = 'visibility';

export const APPS = {
  ACCESS_REQUESTS: 'access_requests',
};

const { FQN } = Models;

export const FQNS = {
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

const { EntitySetFlagTypes } = Types;

export const ES_FLAG_TYPE_RS_OPTIONS :ReactSelectOption<EntitySetFlagType>[] = [
  { label: _capitalize(EntitySetFlagTypes.ASSOCIATION), value: EntitySetFlagTypes.ASSOCIATION },
  { label: _capitalize(EntitySetFlagTypes.AUDIT), value: EntitySetFlagTypes.AUDIT },
  { label: _capitalize(EntitySetFlagTypes.EXTERNAL), value: EntitySetFlagTypes.EXTERNAL },
  { label: _capitalize(EntitySetFlagTypes.LINKING), value: EntitySetFlagTypes.LINKING },
  { label: _capitalize(EntitySetFlagTypes.METADATA), value: EntitySetFlagTypes.METADATA },
  { label: _capitalize(EntitySetFlagTypes.TRANSPORTED), value: EntitySetFlagTypes.TRANSPORTED },
  { label: _capitalize(EntitySetFlagTypes.UNVERSIONED), value: EntitySetFlagTypes.UNVERSIONED },
];

export const EDIT_TITLE_DESCRIPTION_DATA_SCHEMA = {
  properties: {
    fields: {
      properties: {
        title: {
          description: '',
          title: 'Title',
          type: 'string',
        },
        description: {
          description: '',
          title: 'Description',
          type: 'string',
        },
      },
      required: ['title', 'description'],
      title: '',
      type: 'object',
    },
  },
  title: '',
  type: 'object',
};

export const EDIT_TITLE_DESCRIPTION_UI_SCHEMA = {
  fields: {
    classNames: 'column-span-12 grid-container',
    title: {
      classNames: 'column-span-12',
    },
    description: {
      classNames: 'column-span-12',
      'ui:widget': 'MarkdownEditorWidget',
    },
  },
};

export const LAW_FLAGS = [
  {
    label: 'Health and Safety Code',
    options: [
      { label: 'HSC § 128766', value: 'HSC § 128766' }
    ],
  },
  {
    label: 'Health Insurance Portability and Accountability Act',
    options: [
      { label: 'HIPAA', value: 'HIPAA' }
    ],
  },
  {
    label: 'Information Practices Act of 1977',
    options: [
      { label: 'IPA', value: 'IPA' },
      { label: 'IPA § 1798', value: 'IPA § 1798' },
      { label: 'IPA § 1798.24(t)(1)', value: 'IPA § 1798.24(t)(1)' },
    ]
  },
  {
    label: 'Social Security Act',
    options: [
      { label: 'SSA', value: 'SSA' },
      { label: 'SSA § 1902', value: 'SSA § 1902' },
    ]
  },
  {
    label: 'Welfare and Institutions Code',
    options: [
      { label: 'WIC', value: 'WIC' },
      { label: 'WIC § 4515', value: 'WIC § 4515' },
      { label: 'WIC § 10850(f)', value: 'WIC § 10850(f)' },
      { label: 'WIC § 16521.6', value: 'WIC § 16521.6' },
    ]
  },
];

export const EDIT_TITLE_DESCRIPTION_TAGS_DATA_SCHEMA = {
  properties: {
    fields: {
      properties: {
        title: {
          type: 'string',
          title: 'Title',
        },
        tags: {
          type: 'array',
          title: 'Tags',
          options: LAW_FLAGS,
          items: {
            type: 'string',
            enum: LAW_FLAGS,
          },
          uniqueItems: true,
        },
        description: {
          type: 'string',
          title: 'Description',
        },
      },
      required: ['title', 'description'],
      title: '',
      type: 'object',
    },
  },
  title: '',
  type: 'object',
};

export const EDIT_TITLE_DESCRIPTION_TAGS_UI_SCHEMA = {
  fields: {
    classNames: 'column-span-12 grid-container',
    title: {
      classNames: 'column-span-12',
    },
    tags: {
      classNames: 'column-span-12',
      'ui:options': {
        creatable: true,
        multiple: true,
        noOptionsMessage: 'Type to create',
      },
    },
    description: {
      classNames: 'column-span-12',
      'ui:widget': 'MarkdownEditorWidget',
    },
  },
};

export const RS_INITIAL_STATE = {
  [ERROR]: false,
  [REQUEST_STATE]: RequestStates.STANDBY,
};

export const INITIAL_SEARCH_STATE = Map({
  [ERROR]: false,
  [HITS]: List(),
  [PAGE]: 1,
  [QUERY]: '',
  [REQUEST_STATE]: RequestStates.STANDBY,
  [TOTAL_HITS]: 0,
});

const { PermissionTypes } = Types;

export const ORDERED_PERMISSIONS = [
  PermissionTypes.OWNER,
  PermissionTypes.READ,
  PermissionTypes.WRITE,
  PermissionTypes.LINK,
  PermissionTypes.MATERIALIZE,
];

export const PERMISSION_TYPE_RS_OPTIONS :ReactSelectOption<PermissionType>[] = [
  { label: _capitalize(PermissionTypes.OWNER), value: PermissionTypes.OWNER },
  { label: _capitalize(PermissionTypes.READ), value: PermissionTypes.READ },
  { label: _capitalize(PermissionTypes.WRITE), value: PermissionTypes.WRITE },
  { label: _capitalize(PermissionTypes.LINK), value: PermissionTypes.LINK },
  { label: _capitalize(PermissionTypes.MATERIALIZE), value: PermissionTypes.MATERIALIZE },
];

type DataSetTypesEnum = {|
  ENTITY_SET :'EntitySet';
  EXTERNAL_TABLE :'ExternalTable';
|};

export const DataSetTypes :{| ...DataSetTypesEnum |} = Object.freeze({
  ENTITY_SET: 'EntitySet',
  EXTERNAL_TABLE: 'ExternalTable',
});

export type DataSetType = $Values<typeof DataSetTypes>;

export const DATA_SET_TYPE_RS_OPTIONS :ReactSelectOption<DataSetType>[] = [
  { label: 'Entity Set', value: DataSetTypes.ENTITY_SET },
  { label: 'External Table', value: DataSetTypes.EXTERNAL_TABLE },
];
