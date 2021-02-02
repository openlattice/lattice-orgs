import { OrderedSet } from 'immutable';

import * as SearchActions from '.';
import { testShouldExportActionTypes, testShouldExportRequestSequences } from '../../../utils/testing/TestUtils';

const ACTION_TYPES = OrderedSet([
  'SEARCH_DATA',
  'SEARCH_DATA_SETS',
  'SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS',
  'SEARCH_ORGANIZATION_DATA_SETS',
]).toJS();

const REQSEQ_NAMES = OrderedSet([
  'searchData',
  'searchDataSets',
  'searchDataSetsToAssignPermissions',
  'searchOrganizationDataSets',
]).toJS();

describe('SearchActions', () => {

  testShouldExportActionTypes(SearchActions, ACTION_TYPES);
  testShouldExportRequestSequences(SearchActions, ACTION_TYPES, REQSEQ_NAMES);
});
