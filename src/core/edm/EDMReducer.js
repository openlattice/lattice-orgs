/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { EntitySetsApiActions } from 'lattice-sagas';
import { Logger, ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { EntitySet, EntityTypeObject, PropertyTypeObject } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_EDM_TYPES,
  getEntityDataModelTypes,
} from './EDMActions';

import { RS_INITIAL_STATE } from '../redux/constants';

const LOG = new Logger('EDMReducer');

const {
  EntitySetBuilder,
  EntityTypeBuilder,
  PropertyTypeBuilder,
} = Models;

const {
  GET_ENTITY_SET,
  GET_ENTITY_SETS,
  getEntitySet,
  getEntitySets,
} = EntitySetsApiActions;

const {
  ENTITY_SETS,
  ENTITY_SETS_INDEX_MAP,
  REQUEST_STATE,
} = ReduxConstants;

const INITIAL_STATE :Map = fromJS({
  // actions
  [GET_EDM_TYPES]: RS_INITIAL_STATE,
  [GET_ENTITY_SET]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [GET_ENTITY_SETS]: { [REQUEST_STATE]: RequestStates.STANDBY },
  // data
  [ENTITY_SETS]: List(),
  [ENTITY_SETS_INDEX_MAP]: Map(),
  entityTypes: List(),
  entityTypesIndexMap: Map(),
  propertyTypes: List(),
  propertyTypesIndexMap: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case getEntityDataModelTypes.case(action.type): {
      const seqAction :SequenceAction = action;
      return getEntityDataModelTypes.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_EDM_TYPES, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_EDM_TYPES, seqAction.id], seqAction),
        SUCCESS: () => {

          const rawEntityTypes :EntityTypeObject[] = seqAction.value.entityTypes;
          const entityTypes :List = List().asMutable();
          const entityTypesIndexMap :Map = Map().asMutable();

          rawEntityTypes.forEach((et :EntityTypeObject, index :number) => {
            try {
              const entityType = (new EntityTypeBuilder(et)).build();
              entityTypes.push(entityType);
              entityTypesIndexMap.set(entityType.id, index);
              entityTypesIndexMap.set(entityType.type, index);
            }
            catch (e) {
              LOG.error(seqAction.type, e);
              LOG.error(seqAction.type, et);
            }
          });

          const rawPropertyTypes :PropertyTypeObject[] = seqAction.value.propertyTypes;
          const propertyTypes :List = List().asMutable();
          const propertyTypesIndexMap :Map = Map().asMutable();

          rawPropertyTypes.forEach((pt :PropertyTypeObject, index :number) => {
            try {
              const propertyType = (new PropertyTypeBuilder(pt)).build();
              propertyTypes.push(propertyType);
              propertyTypesIndexMap.set(propertyType.id, index);
              propertyTypesIndexMap.set(propertyType.type, index);
            }
            catch (e) {
              LOG.error(seqAction.type, e);
              LOG.error(seqAction.type, pt);
            }
          });

          return state
            .set('entityTypes', entityTypes.asImmutable())
            .set('entityTypesIndexMap', entityTypesIndexMap.asImmutable())
            .set('propertyTypes', propertyTypes.asImmutable())
            .set('propertyTypesIndexMap', propertyTypesIndexMap.asImmutable())
            .setIn([GET_EDM_TYPES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set('entityTypes', List())
          .set('entityTypesIndexMap', Map())
          .set('propertyTypes', List())
          .set('propertyTypesIndexMap', Map())
          .setIn([GET_EDM_TYPES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state
          .deleteIn([GET_EDM_TYPES, seqAction.id]),
      });
    }

    case getEntitySet.case(action.type): {
      const seqAction :SequenceAction = action;
      return getEntitySet.reducer(state, seqAction, {
        REQUEST: () => state
          .setIn([GET_ENTITY_SET, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_ENTITY_SET, seqAction.id], seqAction),
        SUCCESS: () => {
          if (state.hasIn([GET_ENTITY_SET, seqAction.id])) {

            const entitySet :EntitySet = (new EntitySetBuilder(seqAction.value)).build();
            let entitySets :List = state.get(ENTITY_SETS);
            let entitySetsIndexMap :Map = state.get(ENTITY_SETS_INDEX_MAP);

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

            return state
              .set(ENTITY_SETS, entitySets)
              .set(ENTITY_SETS_INDEX_MAP, entitySetsIndexMap)
              .setIn([GET_ENTITY_SET, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          if (state.hasIn([GET_ENTITY_SET, seqAction.id])) {
            return state.setIn([GET_ENTITY_SET, REQUEST_STATE], RequestStates.FAILURE);
          }
          return state;
        },
        FINALLY: () => state.deleteIn([GET_ENTITY_SET, seqAction.id]),
      });
    }

    case getEntitySets.case(action.type): {
      const seqAction :SequenceAction = action;
      return getEntitySets.reducer(state, seqAction, {
        REQUEST: () => state
          .setIn([GET_ENTITY_SETS, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_ENTITY_SETS, seqAction.id], seqAction),
        SUCCESS: () => {
          if (state.hasIn([GET_ENTITY_SETS, seqAction.id])) {

            let entitySets :List = state.get(ENTITY_SETS);
            let entitySetsIndexMap :Map = state.get(ENTITY_SETS_INDEX_MAP);

            Object.values(seqAction.value).forEach((es) => {
              const entitySet :EntitySet = (new EntitySetBuilder(es)).build();
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
              .setIn([GET_ENTITY_SETS, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => {
          if (state.hasIn([GET_ENTITY_SETS, seqAction.id])) {
            return state.setIn([GET_ENTITY_SETS, REQUEST_STATE], RequestStates.FAILURE);
          }
          return state;
        },
        FINALLY: () => state.deleteIn([GET_ENTITY_SETS, seqAction.id]),
      });
    }

    default:
      return state;
  }
}
