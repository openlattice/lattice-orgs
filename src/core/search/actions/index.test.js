import { OrderedSet } from 'immutable';

import * as SearchActions from '.';
import { testShouldExportActionTypes, testShouldExportRequestSequences } from '../../../utils/testing/TestUtils';

const ACTION_TYPES = OrderedSet([
  'SEARCH_DATA_SETS',
  'SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_CONTAINER',
  'SEARCH_DATA_SETS_IN_DATA_SET_PERMISSIONS_MODAL',
]).toJS();

const REQSEQ_NAMES = OrderedSet([
  'searchDataSets',
  'searchDataSetsInDataSetPermissionsContainer',
  'searchDataSetsInDataSetPermissionsModal',
]).toJS();

describe('SearchActions', () => {

  testShouldExportActionTypes(SearchActions, ACTION_TYPES);
  testShouldExportRequestSequences(SearchActions, ACTION_TYPES, REQSEQ_NAMES);
});
