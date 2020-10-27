import { OrderedSet } from 'immutable';

import * as PermissionsActions from '.';
import { testShouldExportActionTypes, testShouldExportRequestSequences } from '../../../utils/testing/TestUtils';

const ACTION_TYPES = OrderedSet([
  'ASSIGN_PERMISSIONS_TO_DATA_SET',
  'GET_DATA_SET_PERMISSIONS',
  'GET_PAGE_DATA_SET_PERMISSIONS',
  'GET_PERMISSIONS',
  'SET_PERMISSIONS',
]).toJS();

const REQSEQ_NAMES = OrderedSet([
  'assignPermissionsToDataSet',
  'getDataSetPermissions',
  'getPageDataSetPermissions',
  'getPermissions',
  'setPermissions',
]).toJS();

describe('PermissionsActions', () => {

  testShouldExportActionTypes(PermissionsActions, ACTION_TYPES);
  testShouldExportRequestSequences(PermissionsActions, ACTION_TYPES, REQSEQ_NAMES);
});
