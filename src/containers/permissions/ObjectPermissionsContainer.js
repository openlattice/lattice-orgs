/*
 * @flow
 */

import React, { useEffect, useMemo } from 'react';

import {
  List,
  Map,
  Set,
  get,
} from 'immutable';
import { Typography } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type {
  Ace,
  PermissionType,
  Principal,
  PropertyType,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import ObjectPermissionsPrincipalCard from './ObjectPermissionsPrincipalCard';

import { Spinner, StackGrid } from '../../components';
import { INITIALIZE_OBJECT_PERMISSIONS, initializeObjectPermissions } from '../../core/permissions/actions';
import { PERMISSIONS } from '../../core/redux/constants';
import {
  selectDataSetProperties,
  selectPermissionsByPrincipal,
} from '../../core/redux/selectors';
import { getDataSetKeys } from '../../utils';

const ObjectPermissionsContainer = ({
  filterByPermissionTypes,
  filterByQuery,
  isDataSet,
  objectKey,
  organizationId,
} :{|
  filterByPermissionTypes :Array<PermissionType>;
  filterByQuery :string;
  isDataSet :boolean;
  objectKey :List<UUID>;
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();

  const initializeRS :?RequestState = useRequestState([PERMISSIONS, INITIALIZE_OBJECT_PERMISSIONS]);

  const properties :Map<UUID, PropertyType | Map> = useSelector(selectDataSetProperties(objectKey.get(0)));
  const keys :List<List<UUID>> = useMemo(() => {
    if (isDataSet) {
      // data set object
      return getDataSetKeys(objectKey.get(0), properties.keySeq().toSet());
    }
    // organization / role object
    return List().push(objectKey);
  }, [isDataSet, objectKey, properties]);

  const permissions :Map<Principal, Map<List<UUID>, Ace>> = useSelector(selectPermissionsByPrincipal(keys));
  const principals :Set<Principal> = permissions.keySeq().toSet();
  const isEmptyPrincipals :boolean = principals.isEmpty();

  useEffect(() => {
    dispatch(initializeObjectPermissions({ isDataSet, objectKey, organizationId }));
  }, [dispatch, isDataSet, objectKey, organizationId]);

  return (
    <StackGrid gap={0}>
      {
        initializeRS === RequestStates.PENDING && (
          <Spinner />
        )
      }
      {
        initializeRS === RequestStates.SUCCESS && isEmptyPrincipals && (
          <Typography align="center">No permissions assigned.</Typography>
        )
      }
      {
        initializeRS === RequestStates.SUCCESS && !isEmptyPrincipals && (
          principals
            .filter((principal :Principal) => {
              const ace :?Ace = (get(permissions, principal) || Map()).get(objectKey);
              return filterByPermissionTypes.every((pt :PermissionType) => ace?.permissions.includes(pt));
            })
            .map((principal :Principal) => (
              <ObjectPermissionsPrincipalCard
                  filterByQuery={filterByQuery}
                  isDataSet={isDataSet}
                  key={principal.id}
                  objectKey={objectKey}
                  permissions={get(permissions, principal) || Map()}
                  principal={principal}
                  properties={properties} />
            ))
        )
      }
    </StackGrid>
  );
};

ObjectPermissionsContainer.defaultProps = {
  isDataSet: false,
};

export default ObjectPermissionsContainer;
