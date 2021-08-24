/*
 * @flow
 */

export const CONTACTS :'contacts' = 'contacts';
export const DATA_SET_ID :'dataSetId' = 'dataSetId';
export const DATA_TYPE :'dataType' = 'dataType';
export const DESCRIPTION :'description' = 'description';
export const FLAGS :'flags' = 'flags';
export const ID :'id' = 'id';
export const METADATA :'metadata' = 'metadata';
export const NAME :'name' = 'name';
export const OPENLATTICE :'openlattice' = 'openlattice';
export const ORGANIZATION_ID :'organizationId' = 'organizationId';
export const ORGANIZATION_IDS :'organizationIds' = 'organizationIds';
export const PRINCIPAL :'principal' = 'principal';
export const SECURABLE_PRINCIPAL_CLASS = 'com.openlattice.authorization.SecurablePrincipal';
export const TITLE :'title' = 'title';

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
