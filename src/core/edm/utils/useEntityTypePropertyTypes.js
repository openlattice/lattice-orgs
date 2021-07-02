/*
 * @flow
 */

import { Map } from 'immutable';
import { Models } from 'lattice';
import { ValidationUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { UUID } from 'lattice';

import {
  EDM,
  ENTITY_TYPES,
  ENTITY_TYPES_INDEX_MAP,
  PROPERTY_TYPES,
  PROPERTY_TYPES_INDEX_MAP,
} from '../../redux/constants';

const { EntityType, FQN, PropertyType } = Models;
const { isValidUUID } = ValidationUtils;

export default function useEntityTypePropertyTypes(idOrFQN :?UUID | FQN) :PropertyType[] {
  return (
    useSelector((state :Map) => {
      if (isValidUUID(idOrFQN) || FQN.isValid(idOrFQN)) {

        const entityTypeIndex :?number = state.getIn([EDM, ENTITY_TYPES_INDEX_MAP, idOrFQN], -1);
        if (entityTypeIndex === -1) {
          return [];
        }

        const entityType :?EntityType = state.getIn([EDM, ENTITY_TYPES, entityTypeIndex]);
        if (!entityType || !entityType.properties) {
          return [];
        }

        return entityType.properties.map((propertyTypeId :UUID) => {
          const propertyTypeIndex :number = state.getIn([EDM, PROPERTY_TYPES_INDEX_MAP, propertyTypeId]);
          return state.getIn([EDM, PROPERTY_TYPES, propertyTypeIndex]);
        });
      }

      return [];
    })
  );
}
