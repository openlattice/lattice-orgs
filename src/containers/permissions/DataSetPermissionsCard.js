/*
 * @flow
 */

import React, { useMemo } from 'react';
import type { ComponentType } from 'react';

import _capitalize from 'lodash/capitalize';
import _isFunction from 'lodash/isFunction';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Types } from 'lattice';
import { Colors, Typography } from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type {
  Ace,
  EntitySet,
  PermissionType,
  Principal,
  PropertyType,
  UUID,
} from 'lattice';

import { ORDERED_PERMISSIONS } from './constants';

import { AtlasDataSetIcon, EntitySetIcon } from '../../assets/svg/icons';
import { GapGrid, SpaceBetweenGrid, StackGrid } from '../../components';
import { selectDataSetProperties, selectPermissionsByPrincipal } from '../../core/redux/selectors';
import {
  getDataSetId,
  getDataSetKeys,
  getDataSetTitle,
  isAtlasDataSet,
} from '../../utils';
import type { DataSetPermissionTypeSelection } from '../../types';

const { NEUTRAL, PURPLE } = Colors;
const { PermissionTypes } = Types;

const DataSetCard :ComponentType<{}> = styled.div`
  align-items: center;
  background-color: ${NEUTRAL.N50};
  border-radius: 5px;
  border: 1px solid ${NEUTRAL.N50};
  padding: 8px 16px;

  &:hover {
    cursor: pointer;
  }
`;

const PermissionTypeCard :ComponentType<{
  isSelected :boolean;
}> = styled.div`
  align-items: center;
  background-color: ${({ isSelected }) => (isSelected ? PURPLE.P00 : 'white')};
  border-radius: 5px;
  border: 1px solid ${({ isSelected }) => (isSelected ? PURPLE.P300 : 'white')};
  margin-left: 24px;
  padding: 8px 16px;

  &:hover {
    cursor: pointer;
  }
`;

const DataSetPermissionsCard = ({
  dataSet,
  isOpen,
  onClick,
  onSelect,
  principal,
  selection,
} :{|
  dataSet :EntitySet | Map;
  isOpen :boolean;
  onClick :(dataSetId :UUID) => void;
  onSelect :(selection :DataSetPermissionTypeSelection) => void;
  principal :Principal;
  selection :?DataSetPermissionTypeSelection;
|}) => {

  const dataSetId :UUID = getDataSetId(dataSet);

  const properties :Map<UUID, PropertyType | Map> = useSelector(selectDataSetProperties(dataSetId));
  const keys :List<List<UUID>> = useMemo(() => (
    getDataSetKeys(dataSetId, properties.keySeq().toSet())
  ), [dataSetId, properties]);

  const permissions :Map<Principal, Map<List<UUID>, Ace>> = useSelector(selectPermissionsByPrincipal(keys));
  const principalPermissions :Map<List<UUID>, Ace> = permissions.get(principal) || Map();
  const principalPermissionsHash :number = principalPermissions.hashCode();

  const permissionTypeSummaryString = useMemo(() => {
    const dataSetAce :?Ace = principalPermissions.get(List([dataSetId]));
    return ORDERED_PERMISSIONS
      .filter((permissionType :PermissionType) => dataSetAce?.permissions.includes(permissionType))
      .map((permissionType :PermissionType) => permissionType.toLowerCase())
      .join(', ');
  }, [dataSetId, principalPermissionsHash]);

  const summaryStringsMap :Map<PermissionType, string> = useMemo(() => {
    const dataSetAce :?Ace = principalPermissions.get(List([dataSetId]));
    const counts :Map<PermissionType, number> = Map().withMutations((mutableMap) => (
      principalPermissions.forEach((ace :Ace) => {
        ace.permissions.forEach((permission :PermissionType) => {
          mutableMap.update(permission, (count :number = 0) => count + 1);
        });
      })
    ));
    return Map().withMutations((mutableMap) => {
      ORDERED_PERMISSIONS.forEach((permissionType :PermissionType) => {
        const count :number = counts.get(permissionType, 0);
        let summaryString = '';
        if (dataSetAce?.permissions.includes(permissionType)) {
          summaryString = (count > 1) ? 'object, properties' : 'object';
        }
        else if (count > 0) {
          summaryString = 'properties';
        }
        mutableMap.set(permissionType, summaryString);
      });
    });
  }, [dataSetId, principalPermissionsHash]);

  const handleOnClickDataSetCard = () => {
    if (_isFunction(onClick)) {
      onClick(dataSetId);
    }
  };

  const handleOnClickPermissionTypeCard = (event :SyntheticEvent<HTMLElement>) => {
    const permissionType :?PermissionType = PermissionTypes[event.currentTarget.dataset.permissionType];
    if (permissionType && _isFunction(onSelect)) {
      onSelect({ dataSetId, permissionType });
    }
  };

  return (
    <StackGrid gap={8}>
      <DataSetCard onClick={handleOnClickDataSetCard}>
        <SpaceBetweenGrid>
          <GapGrid gap={8}>
            {
              isAtlasDataSet(dataSet)
                ? <AtlasDataSetIcon />
                : <EntitySetIcon />
            }
            <Typography>{getDataSetTitle(dataSet)}</Typography>
          </GapGrid>
          <Typography component="span">{permissionTypeSummaryString}</Typography>
        </SpaceBetweenGrid>
      </DataSetCard>
      {
        isOpen && (
          ORDERED_PERMISSIONS.map((permissionType :PermissionType) => (
            <PermissionTypeCard
                data-permission-type={permissionType}
                isSelected={(
                  selection?.dataSetId === dataSetId && selection?.permissionType === permissionType
                )}
                key={permissionType}
                onClick={handleOnClickPermissionTypeCard}>
              <SpaceBetweenGrid>
                <Typography component="span">{_capitalize(permissionType)}</Typography>
                <Typography component="span">{summaryStringsMap.get(permissionType)}</Typography>
              </SpaceBetweenGrid>
            </PermissionTypeCard>
          ))
        )
      }
    </StackGrid>
  );
};

export default DataSetPermissionsCard;
