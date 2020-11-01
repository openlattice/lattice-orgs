import { OrderedSet } from 'immutable';

import * as EDMActions from '.';

import { testShouldExportActionTypes, testShouldExportRequestSequences } from '../../../utils/testing/TestUtils';

const ACTION_TYPES = OrderedSet([
  'GET_EDM_TYPES',
  'GET_OR_SELECT_DATA_SET',
  'GET_OR_SELECT_DATA_SETS',
]).toJS();

const REQSEQ_NAMES = OrderedSet([
  'getEntityDataModelTypes',
  'getOrSelectDataSet',
  'getOrSelectDataSets',
]).toJS();

describe('EDMActions', () => {

  testShouldExportActionTypes(EDMActions, ACTION_TYPES);
  testShouldExportRequestSequences(EDMActions, ACTION_TYPES, REQSEQ_NAMES);
});
