import { OrderedSet } from 'immutable';

import * as SearchActions from '.';
import { testShouldExportActionTypes, testShouldExportRequestSequences } from '../../../utils/testing/TestUtils';

const ACTION_TYPES = OrderedSet([
  'SEARCH_DATA',
  'SEARCH_ORGANIZATION_DATA_SETS',
]).toJS();

const REQSEQ_NAMES = OrderedSet([
  'searchData',
  'searchOrganizationDataSets',
]).toJS();

describe('SearchActions', () => {

  testShouldExportActionTypes(SearchActions, ACTION_TYPES);
  testShouldExportRequestSequences(SearchActions, ACTION_TYPES, REQSEQ_NAMES);
});
