/*
 * @flow
 */

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
