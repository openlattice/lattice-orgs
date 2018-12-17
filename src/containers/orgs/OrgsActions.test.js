import { Set } from 'immutable';

import * as OrgsActions from './OrgsActions';
import { testShouldExportActionTypes, testShouldExportRequestSequences } from '../../utils/testing/TestUtils';

const ACTION_TYPES = Set([
  'SWITCH_ORGANIZATION',
]).sort();

const REQSEQ_NAMES = Set([
]).sort();

describe('OrgsActions', () => {

  testShouldExportActionTypes(OrgsActions, ACTION_TYPES.toJS());
  testShouldExportRequestSequences(OrgsActions, ACTION_TYPES.toJS(), REQSEQ_NAMES.toJS());
});
