/*
 * @flow
 */

import { Map, Set, isCollection } from 'immutable';
import { Models } from 'lattice';
import { LangUtils, ValidationUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { UUID } from 'lattice';

import {
  EDM,
  ENTITY_SETS,
  ENTITY_SETS_INDEX_MAP,
} from '../../redux/constants';

const { isValidUUID } = ValidationUtils;
const { isNonEmptyArray, isNonEmptyString } = LangUtils;
const { EntitySet } = Models;

type IdsOrNames =
  | UUID[]
  | string[]
  | Set<UUID>
  | Set<string>;

// OPTIMIZE / MEMOIZE
export default function useEntitySets(idsOrNames :?IdsOrNames) :{ [UUID] :EntitySet } {
  return (
    useSelector((state :Map) => {

      const isValid = (
        (isNonEmptyArray(idsOrNames) || isCollection(idsOrNames))
        && (
          idsOrNames.every(isValidUUID) || idsOrNames.every(isNonEmptyString)
        )
      );

      if (!isValid || !idsOrNames) {
        return {};
      }

      const entitySetsMap = {};
      idsOrNames.forEach((idOrName) => {
        const entitySetIndex :number = state.getIn([EDM, ENTITY_SETS_INDEX_MAP, idOrName], -1);
        if (entitySetIndex >= 0) {
          const entitySet :?EntitySet = state.getIn([EDM, ENTITY_SETS, entitySetIndex]);
          if (entitySet && entitySet.id) {
            entitySetsMap[entitySet.id] = entitySet;
          }
        }
      });

      return entitySetsMap;
    })
  );
}
