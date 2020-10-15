/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import _capitalize from 'lodash/capitalize';
import styled from 'styled-components';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';
import { faServer } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  List,
  Map,
  get,
  getIn,
  has,
} from 'immutable';
import { Types } from 'lattice';
import {
  Colors,
  IconButton,
  StyleUtils,
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

import { EntitySetIcon } from '../../assets/svg/icons';
import { selectEntitySetEntityType, selectPermissions } from '../../core/redux/selectors';
import type { PermissionSelection } from '../../types';

const { NEUTRAL, PURPLE } = Colors;
const { PermissionTypes } = Types;
const { media } = StyleUtils;

const MIXED_PERMISSIONS_LABEL :'Mixed Permissions' = 'Mixed Permissions';
const NO_PERMISSIONS_LABEL :'No Permissions' = 'No Permissions';
const ORDERED_PERMISSIONS = [
  PermissionTypes.OWNER,
  PermissionTypes.READ,
  PermissionTypes.WRITE,
  PermissionTypes.LINK,
  PermissionTypes.MATERIALIZE,
];

const Card = styled.div`
  align-items: center;
  border-radius: 4px;
  display: grid;
  grid-gap: 16px;
  grid-template-columns: auto 1fr;
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

const TitleWrapper = styled.div`
  align-items: center;
  display: grid;
  grid-gap: 16px;
  grid-template-columns: auto 1fr;

  > span {
    word-break: break-all;
  }
`;

const ActionsWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 auto;

  > button {
    margin-left: 16px;
  }

  ${media.phone`
    > span {
      display: none;
    }
  `}
`;

const DataSetPermissionsCard = ({
  dataSet,
  onSelect,
  principal,
  selection,
} :{|
  dataSet :EntitySet | Map;
  onSelect :(selection :?PermissionSelection) => void;
  principal :Principal;
  selection :?PermissionSelection;
|}) => {

  const [isOpen, setIsOpen] = useState(false);

  const dataSetId :UUID = dataSet.id || getIn(dataSet, ['table', 'id']);
  const dataSetTitle :string = dataSet.title || getIn(dataSet, ['table', 'title']);
  const isAtlasDataSet :boolean = has(dataSet, 'table');

  const entityType :?EntityType = useSelector(selectEntitySetEntityType(dataSetId));

  const keys :List<List<UUID>> = useMemo(() => (
    List().withMutations((mutableList) => {
      if (has(dataSet, 'columns')) {
        get(dataSet, 'columns', List()).forEach((column :Map) => {
          mutableList.push(List([dataSetId, get(column, 'id')]));
        });
      }
      else {
        entityType?.properties.forEach((propertyTypeId :UUID) => {
          mutableList.push(List([dataSetId, propertyTypeId]));
        });
      }
    })
  ), [dataSet, dataSetId, entityType]);

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
    onSelect({ dataSetId, permissionType });
  };

  return (
    <>
      <DataSetCard>
        <TitleWrapper>
          {
            isAtlasDataSet
              ? <FontAwesomeIcon fixedWidth icon={faServer} />
              : <EntitySetIcon />
          }
          <Typography component="span" variant="body1">{dataSetTitle}</Typography>
        </TitleWrapper>
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
