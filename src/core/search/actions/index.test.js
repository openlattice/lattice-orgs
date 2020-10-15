import { Set } from 'immutable';

import * as SearchActions from '.';
import { testShouldExportActionTypes, testShouldExportRequestSequences } from '../../../utils/testing/TestUtils';

const ACTION_TYPES = Set([
  'SEARCH_DATA_SETS',
]).toJS();

const REQSEQ_NAMES = Set([
  'searchDataSets',
]).toJS();

describe('SearchActions', () => {

  testShouldExportActionTypes(SearchActions, ACTION_TYPES);
  testShouldExportRequestSequences(SearchActions, ACTION_TYPES, REQSEQ_NAMES);
});
