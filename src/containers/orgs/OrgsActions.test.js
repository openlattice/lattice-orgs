import { Set } from 'immutable';

import * as OrgsActions from './OrgsActions';
import { testShouldExportActionTypes } from '../../utils/testing/TestUtils';

const ACTION_TYPES = Set([
  'GET_RELEVANT_ENTITY_SETS',
  'SWITCH_ORGANIZATION',
]).sort();

describe('OrgsActions', () => {

  testShouldExportActionTypes(OrgsActions, ACTION_TYPES.toJS());
});
