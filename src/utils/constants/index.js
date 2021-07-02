/*
 * @flow
 */

export const OPENLATTICE :'openlattice' = 'openlattice';
export const PRINCIPAL :'principal' = 'principal';
export const SECURABLE_PRINCIPAL_CLASS = 'com.openlattice.authorization.SecurablePrincipal';

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
      'ui:widget': 'textarea',
    },
  },
};
