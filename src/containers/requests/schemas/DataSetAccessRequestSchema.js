/*
 * @flow
 */

import { DataProcessingUtils } from 'lattice-fabricate';

import { ESNS, FQNS } from '../../../core/edm/constants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

/*
 * AR === access request
 * access request entity data (visible)
 */

const ACCESS_REQUEST_PSK = getPageSectionKey(1, 1);
const ACL_KEYS_EAK = getEntityAddressKey(0, ESNS.ACCESS_REQUESTS, FQNS.OL_ACL_KEYS);

const dataSchema = {
  properties: {
    [ACCESS_REQUEST_PSK]: {
      properties: {
        requestTitle: {
          title: 'Title',
          type: 'string',
        },
        requestDescription: {
          title: 'Description',
          type: 'string',
        },
        [ACL_KEYS_EAK]: {
          items: {
            default: true,
            enum: [],
            enumNames: [],
            type: 'string',
          },
          uniqueItems: true,
          title: 'Select properties for which to request access',
          type: 'array',
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
    requestTitle: {
      classNames: 'column-span-12',
    },
    requestDescription: {
      'ui:widget': 'textarea',
      classNames: 'column-span-12',
    },
    [ACL_KEYS_EAK]: {
      'ui:widget': 'checkboxes',
      classNames: 'column-span-12',
    },
  },
};

export {
  ACCESS_REQUEST_PSK,
  ACL_KEYS_EAK,
  dataSchema,
  uiSchema,
};
