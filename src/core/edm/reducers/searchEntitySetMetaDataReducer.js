/*
 * @flow
 */

import { List, Map, get } from 'immutable';
import { Models } from 'lattice';
import { SearchApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { EntitySet, FQN, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ENTITY_SETS,
  ENTITY_SETS_INDEX_MAP,
  HITS,
  REQUEST_STATE,
} from '../../redux/constants';
import type { SearchEntitySetsHit } from '../../../types';

const { EntitySetBuilder } = Models;
const { SEARCH_ENTITY_SET_METADATA, searchEntitySetMetaData } = SearchApiActions;

export default function reducer(state :Map, action :SequenceAction) {

  return searchEntitySetMetaData.reducer(state, action, {
    REQUEST: () => state
      .setIn([SEARCH_ENTITY_SET_METADATA, REQUEST_STATE], RequestStates.PENDING)
      .setIn([SEARCH_ENTITY_SET_METADATA, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([SEARCH_ENTITY_SET_METADATA, action.id])) {

        let entitySets :List<EntitySet> = state.get(ENTITY_SETS);
        let entitySetsIndexMap :Map<UUID | FQN, number> = state.get(ENTITY_SETS_INDEX_MAP);

        get(action.value, HITS, []).forEach((hit :SearchEntitySetsHit) => {
          const entitySet :EntitySet = (new EntitySetBuilder(hit.entitySet)).build();
          if (entitySetsIndexMap.has(entitySet.id)) {
            entitySets = entitySets.update(entitySetsIndexMap.get(entitySet.id), () => entitySet);
          }
          else {
            entitySets = entitySets.push(entitySet);
            const entitySetIndex :number = entitySets.count() - 1;
            entitySetsIndexMap = entitySetsIndexMap
              .set(entitySet.id, entitySetIndex)
              .set(entitySet.name, entitySetIndex);
          }
        });

        return state
          .set(ENTITY_SETS, entitySets)
          .set(ENTITY_SETS_INDEX_MAP, entitySetsIndexMap)
          .setIn([SEARCH_ENTITY_SET_METADATA, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([SEARCH_ENTITY_SET_METADATA, action.id])) {
        return state.setIn([SEARCH_ENTITY_SET_METADATA, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([SEARCH_ENTITY_SET_METADATA, action.id]),
  });
}
