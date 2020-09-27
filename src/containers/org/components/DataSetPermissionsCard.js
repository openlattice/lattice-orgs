/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import _capitalize from 'lodash/capitalize';
import styled from 'styled-components';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import { Types } from 'lattice';
import { Colors, IconButton, Typography } from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type {
  Ace,
  EntitySet,
  EntityType,
  PermissionType,
  Principal,
  UUID,
} from 'lattice';

import { selectEntitySetEntityType, selectPermissions } from '../../../core/redux/utils';

const { NEUTRAL, PURPLE } = Colors;
const { PermissionTypes } = Types;

const MIXED_PERMISSIONS_LABEL :'Mixed Permissions' = 'Mixed Permissions';
const NO_PERMISSIONS_LABEL :'No Permissions' = 'No Permissions';
const ORDERED_PERMISSIONS = [
  PermissionTypes.OWNER,
  PermissionTypes.READ,
  PermissionTypes.WRITE,
  PermissionTypes.DISCOVER,
  PermissionTypes.LINK,
  PermissionTypes.MATERIALIZE,
];

const Card = styled.div`
  align-items: center;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
`;

const DataSetCard = styled(Card)`
  background-color: ${NEUTRAL.N50};
  border: 1px solid ${NEUTRAL.N50};
  padding: 8px 24px;
`;

const PermissionTypeCard = styled(Card)`
  background-color: ${({ isSelected }) => (isSelected ? PURPLE.P00 : NEUTRAL.N00)};
  border: 1px solid ${({ isSelected }) => (isSelected ? PURPLE.P300 : NEUTRAL.N00)};
  margin-left: 24px;
  padding: 16px 24px;

  &:hover {
    cursor: pointer;
  }
`;

const ActionsWrapper = styled.div`
  align-items: center;
  display: flex;

  > button {
    margin-left: 16px;
  }
`;

const DataSetPermissionsCard = ({
  dataSet,
  onSelect,
  principal,
  selection,
} :{|
  dataSet :EntitySet;
  onSelect :(dataSetId :UUID, permissionType :PermissionType) => void;
  principal :Principal;
  selection :?{|
    dataSetId :UUID;
    permissionType :PermissionType;
  |};
|}) => {

  const [isOpen, setIsOpen] = useState(false);

  const dataSetId :UUID = (dataSet.id :any);
  const entityType :?EntityType = useSelector(selectEntitySetEntityType(dataSetId));

  const keys :List<List<UUID>> = useMemo(() => (
    List().withMutations((mutableList) => {
      entityType?.properties.forEach((propertyTypeId :UUID) => {
        mutableList.push(List([dataSetId, propertyTypeId]));
      });
    })
  ), [dataSetId, entityType]);

  const propertyTypePermissions :Map<List<UUID>, Ace> = useSelector(selectPermissions(keys, principal));
  const propertyTypePermissionsHash :number = propertyTypePermissions.hashCode();

  const counts :Map<PermissionType, number> = useMemo(() => (
    Map().withMutations((mutableMap) => {
      propertyTypePermissions.forEach((ace :Ace) => {
        ace.permissions.forEach((permission :PermissionType) => {
          mutableMap.update(permission, (count :number = 0) => count + 1);
        });
      });
    })
  ), [propertyTypePermissionsHash]);
  const countsHash :number = counts.hashCode();

  const permissionLabel = useMemo(() => (
    ORDERED_PERMISSIONS.reduce((label :?string, permission :PermissionType) => {
      if (counts.get(permission) > 0) {
        if (label === NO_PERMISSIONS_LABEL) {
          return _capitalize(permission);
        }
        if (label !== NO_PERMISSIONS_LABEL && label !== MIXED_PERMISSIONS_LABEL) {
          return MIXED_PERMISSIONS_LABEL;
        }
      }
      return label;
    }, NO_PERMISSIONS_LABEL)
  ), [countsHash]);

  const selectPermissionType = (event :SyntheticEvent<HTMLElement>) => {
    const permissionType :PermissionType = (event.currentTarget.dataset.permissionType :any);
    onSelect(dataSetId, permissionType);
  };

  return (
    <>
      <DataSetCard>
        <Typography component="span" variant="body1">{dataSet.title}</Typography>
        <ActionsWrapper>
          <Typography component="span" variant="body1">{permissionLabel}</Typography>
          <IconButton onClick={() => setIsOpen(!isOpen)}>
            <FontAwesomeIcon fixedWidth icon={isOpen ? faChevronUp : faChevronDown} />
          </IconButton>
        </ActionsWrapper>
      </DataSetCard>
      {
        isOpen && (
          ORDERED_PERMISSIONS.map((pt :PermissionType) => (
            <PermissionTypeCard
                data-permission-type={pt}
                isSelected={(
                  selection && selection.dataSetId === dataSetId && selection.permissionType === pt
                )}
                key={`${dataSetId}-${pt}`}
                onClick={selectPermissionType}>
              <Typography component="span" variant="body1">{`${counts.get(pt) || 0} Properties`}</Typography>
              <Typography component="span" variant="body1">{_capitalize(pt)}</Typography>
            </PermissionTypeCard>
          ))
        )
      }
    </>
  );
};

export default DataSetPermissionsCard;
