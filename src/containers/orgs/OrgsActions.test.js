import { Set } from 'immutable';

import * as OrgsActions from './OrgsActions';
import { testShouldExportActionTypes, testShouldExportRequestSequences } from '../../utils/testing/TestUtils';

const ACTION_TYPES = Set([
  'GET_RELEVANT_ENTITY_SETS',
  'SWITCH_ORGANIZATION',
]).sort();

const REQSEQ_NAMES = Set([
  'getRelevantEntitySets',
]).sort();

describe('OrgsActions', () => {

  testShouldExportActionTypes(OrgsActions, ACTION_TYPES.toJS());
  testShouldExportRequestSequences(OrgsActions, ACTION_TYPES.toJS(), REQSEQ_NAMES.toJS());
});
