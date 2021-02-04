/*
 * @flow
 */

import { DataProcessingUtils } from 'lattice-fabricate';

import { ESNS, FQNS } from '../../../core/edm/constants';
import { DATA_SET_COLUMNS } from '../../../core/redux/constants';
import { PERMISSION_TYPE_RS_OPTIONS } from '../../permissions/constants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const ACCESS_REQUEST_PSK = getPageSectionKey(1, 1);
const ACCESS_REQUEST_EAK = getEntityAddressKey(0, ESNS.ACCESS_REQUESTS, FQNS.OL_TEXT);

const PERMISSION_TYPES :'permissionTypes' = 'permissionTypes';

const dataSchema = {
  properties: {
    [ACCESS_REQUEST_PSK]: {
      properties: {
        [ACCESS_REQUEST_EAK]: {
          properties: {
            requestTitle: {
              title: 'Title',
              type: 'string',
            },
            requestDescription: {
              title: 'Description',
              type: 'string',
            },
            [PERMISSION_TYPES]: {
              items: {
                enum: PERMISSION_TYPE_RS_OPTIONS.map((pt) => pt.value),
                enumNames: PERMISSION_TYPE_RS_OPTIONS.map((pt) => pt.label),
                type: 'string',
              },
              type: 'array',
              title: 'Permissions',
              uniqueItems: true,
            },
            [DATA_SET_COLUMNS]: {
              items: {
                enum: [],
                enumNames: [],
                type: 'string',
              },
              title: 'Select properties for which to request access',
              type: 'array',
              uniqueItems: true,
            },
          },
          title: '',
          type: 'object',
        },
      },
      title: '',
      type: 'object',
    },
  },
  title: '',
  type: 'object',
};

const uiSchema = {
  [ACCESS_REQUEST_PSK]: {
    classNames: 'column-span-12 grid-container',
    [ACCESS_REQUEST_EAK]: {
      classNames: 'column-span-12 grid-container',
      requestTitle: {
        classNames: 'column-span-12',
      },
      requestDescription: {
        'ui:widget': 'textarea',
        classNames: 'column-span-12',
      },
      [PERMISSION_TYPES]: {
        'ui:options': { multiple: true },
        classNames: 'column-span-12',
      },
      [DATA_SET_COLUMNS]: {
        'ui:widget': 'checkboxes',
        classNames: 'column-span-12',
      },
    },
  },
};

export {
  ACCESS_REQUEST_EAK,
  ACCESS_REQUEST_PSK,
  PERMISSION_TYPES,
  dataSchema,
  uiSchema,
};
