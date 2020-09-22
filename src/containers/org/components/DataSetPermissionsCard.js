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
import {
  Card,
  Colors,
  IconButton,
  Typography,
} from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type {
  Ace,
  EntitySet,
  EntityType,
  PermissionType,
  Principal,
  UUID,
} from 'lattice';

import { SpaceBetweenCardSegment } from '../../../components';
import { selectEntitySetEntityType, selectPermissions } from '../../../core/redux/utils';

const { NEUTRAL } = Colors;
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

const DataSetCard = styled(Card)`
  background-color: ${NEUTRAL.N50};
  border: none;
`;

const PermissionTypeCard = styled(Card)`
  background-color: ${NEUTRAL.N00};
  border: none;
  margin-left: 24px;
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
  principal,
} :{
  dataSet :EntitySet;
  principal :Principal;
}) => {

  const dataSetId :UUID = (dataSet.id :any);

  const [isOpen, setIsOpen] = useState(false);
  const entityType :?EntityType = useSelector(selectEntitySetEntityType(dataSet));

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

  return (
    <>
      <DataSetCard>
        <SpaceBetweenCardSegment padding="8px 16px">
          <Typography component="span" variant="body1">{dataSet.title}</Typography>
          <ActionsWrapper>
            <Typography component="span" variant="body1">{permissionLabel}</Typography>
            <IconButton onClick={() => setIsOpen(!isOpen)}>
              <FontAwesomeIcon fixedWidth icon={isOpen ? faChevronUp : faChevronDown} />
            </IconButton>
          </ActionsWrapper>
        </SpaceBetweenCardSegment>
      </DataSetCard>
      {
        isOpen && (
          ORDERED_PERMISSIONS.map((pt :PermissionType) => (
            <PermissionTypeCard key={pt}>
              <SpaceBetweenCardSegment padding="16px" onClick={() => {}}>
                <Typography component="span" variant="body1">{`${counts.get(pt) || 0} Properties`}</Typography>
                <Typography component="span" variant="body1">{_capitalize(pt)}</Typography>
              </SpaceBetweenCardSegment>
            </PermissionTypeCard>
          ))
        )
      }
    </>
  );
};

export default DataSetPermissionsCard;
