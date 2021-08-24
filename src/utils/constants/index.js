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

const LAW_FLAGS = [
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
    ]
  },
];

export const EDIT_TITLE_DESCRIPTION_TAGS_DATA_SCHEMA = {
  type: 'object',
  title: '',
  properties: {
    fields: {
      type: 'object',
      title: '',
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
    },
  },

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
