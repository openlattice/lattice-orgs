/*
 * @flow
 */

import { List, Map } from 'immutable';
import { DataUtils } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ORG_DATA_SETS,
  ORG_DATA_SET_COLUMNS,
  REQUEST_STATE,
} from '../../redux/constants';
import { UPDATE_ORGANIZATION_DATA_SET, updateOrganizationDataSet } from '../actions';
import { FQNS } from '../constants';

const { getEntityKeyId } = DataUtils;

export default function reducer(state :Map, action :SequenceAction) {

  return updateOrganizationDataSet.reducer(state, action, {
    REQUEST: () => state
      .setIn([UPDATE_ORGANIZATION_DATA_SET, REQUEST_STATE], RequestStates.PENDING)
      .setIn([UPDATE_ORGANIZATION_DATA_SET, action.id], action),
    SUCCESS: () => {
      const storedAction = state.getIn([UPDATE_ORGANIZATION_DATA_SET, action.id]);
      if (storedAction) {
        const {
          dataSetId,
          description,
          entityKeyId,
          isColumn,
          organizationId: orgId,
          title,
        } :{|
          dataSetId :UUID;
          description :string;
          entityKeyId :UUID;
          isColumn ?:boolean;
          organizationId :UUID;
          title :string;
        |} = storedAction.value;
        if (isColumn) {
          const columns :List<Map> = state.getIn([ORG_DATA_SET_COLUMNS, orgId, dataSetId], List());
          const index :number = columns.findIndex((column :Map) => getEntityKeyId(column) === entityKeyId);
          if (index >= 0) {
            return state
              .setIn([ORG_DATA_SET_COLUMNS, orgId, dataSetId, index, FQNS.OL_DESCRIPTION], List([description]))
              .setIn([ORG_DATA_SET_COLUMNS, orgId, dataSetId, index, FQNS.OL_TITLE], List([title]))
              .setIn([UPDATE_ORGANIZATION_DATA_SET, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        }
        return state
          .setIn([ORG_DATA_SETS, orgId, dataSetId, FQNS.OL_DESCRIPTION], List([description]))
          .setIn([ORG_DATA_SETS, orgId, dataSetId, FQNS.OL_TITLE], List([title]))
          .setIn([UPDATE_ORGANIZATION_DATA_SET, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([UPDATE_ORGANIZATION_DATA_SET, action.id])) {
        return state.setIn([UPDATE_ORGANIZATION_DATA_SET, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([UPDATE_ORGANIZATION_DATA_SET, action.id]),
  });
}
