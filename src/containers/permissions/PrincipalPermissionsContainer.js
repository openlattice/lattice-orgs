/*
 * @flow
 */

import React, {
  Fragment,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ComponentType } from 'react';

import _capitalize from 'lodash/capitalize';
import styled from 'styled-components';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map, get } from 'immutable';
import { Models, Types } from 'lattice';
import {
  CardSegment,
  Checkbox,
  Colors,
  IconButton,
  Typography,
} from 'lattice-ui-kit';
import { LangUtils, useRequestState } from 'lattice-utils';
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

import { ORDERED_PERMISSIONS } from './constants';

import { SpaceBetweenGrid, Spinner, StackGrid } from '../../components';
import { UPDATE_PERMISSIONS, updatePermissions } from '../../core/permissions/actions';
import { PERMISSIONS } from '../../core/redux/constants';
import { selectUser } from '../../core/redux/selectors';
import { getUserProfileLabel } from '../../utils/PersonUtils';

const { NEUTRAL } = Colors;
const { AceBuilder } = Models;
const { ActionTypes, PermissionTypes, PrincipalTypes } = Types;
const { isNonEmptyString } = LangUtils;

const PermissionTypeWrapper :ComponentType<{|
  children :any;
  isDataSet ?:boolean;
|}> = styled.div`
  background-color: ${({ isDataSet }) => (isDataSet ? NEUTRAL.N50 : 'white')};
  border-radius: 5px;
  margin-left: 64px;
  padding: ${({ isDataSet }) => (isDataSet ? '2px 2px 2px 16px' : '0 12px 0 0')};
`;

const PropertiesWrapper = styled.div`
  margin: 8px 12px 8px 96px;
`;

const SpinnerWrapper = styled.div`
  display: flex;
  margin-right: -4px; /* for alignment with checkbox / chevron */
  min-height: 40px; /* because checkbox has this min-height */
`;

const PrincipalPermissionsContainer = ({
  filterByQuery,
  isDataSet,
  objectKey,
  permissions,
  principal,
  properties,
} :{|
  filterByQuery :string;
  isDataSet :boolean;
  objectKey :List<UUID>;
  permissions :Map<List<UUID>, Ace>;
  principal :Principal;
  properties :Map<UUID, PropertyType | Map>;
|}) => {

  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [openPermissionType, setOpenPermissionType] = useState('');
  const [targetPropertyId, setTargetPropertyId] = useState('');

  const updatePermissionsRS :?RequestState = useRequestState([PERMISSIONS, UPDATE_PERMISSIONS]);
  const user :Map = useSelector(selectUser(principal.id));

  useEffect(() => {
    if (updatePermissionsRS !== RequestStates.PENDING) {
      setTargetPropertyId('');
    }
  }, [updatePermissionsRS]);

  const objectAce :?Ace = permissions.get(objectKey);

  let title = '';
  if (principal.type === PrincipalTypes.ROLE) {
    title = principal.id.substring(principal.id.indexOf('|') + 1);
  }
  else if (principal.type === PrincipalTypes.USER) {
    title = getUserProfileLabel(user);
  }

  if (!isNonEmptyString(title)) {
    title = principal.id;
  }

  const objectPermissionsString = useMemo(() => (
    ORDERED_PERMISSIONS
      .filter((permissionType :PermissionType) => objectAce?.permissions.includes(permissionType))
      .map((permissionType :PermissionType) => permissionType.toLowerCase())
      .join(', ')
  ), [objectAce]);

  const handleOnChangePermission = (event :SyntheticEvent<HTMLInputElement>) => {

    const { propertyId } = event.currentTarget.dataset;
    const permissionType :?PermissionType = PermissionTypes[event.currentTarget.dataset.permissionType];

    if (permissionType && updatePermissionsRS !== RequestStates.PENDING) {
      const aceForUpdate = (new AceBuilder()).setPermissions([permissionType]).setPrincipal(principal).build();
      const targetKey :List<UUID> = propertyId ? List([objectKey.get(0), propertyId]) : objectKey;
      dispatch(
        updatePermissions({
          actionType: event.currentTarget.checked ? ActionTypes.ADD : ActionTypes.REMOVE,
          permissions: Map().set(targetKey, aceForUpdate),
        })
      );
      if (propertyId) {
        setTargetPropertyId(propertyId);
      }
    }
  };

  // TODO: this is probably not good enough, plan to revisit
  if (!title.toLowerCase().includes(filterByQuery.toLowerCase())) {
    return null;
  }

  const toggleOpenPermissionType = (permissionType :PermissionType) => {
    if (openPermissionType === permissionType) {
      setOpenPermissionType('');
    }
    else {
      setOpenPermissionType(permissionType);
    }
  };

  return (
    <CardSegment padding="24px 0">
      <StackGrid gap={8}>
        <CardSegment borderless padding="0 2px 0 0">
          <SpaceBetweenGrid>
            <Typography component="span">{title}</Typography>
            <SpaceBetweenGrid gap={8}>
              <Typography component="span">{objectPermissionsString}</Typography>
              <IconButton aria-label="toggle open/close" onClick={() => setIsOpen(!isOpen)}>
                <FontAwesomeIcon fixedWidth icon={isOpen ? faChevronUp : faChevronDown} />
              </IconButton>
            </SpaceBetweenGrid>
          </SpaceBetweenGrid>
        </CardSegment>
        {
          isOpen && (
            ORDERED_PERMISSIONS.map((permissionType :PermissionType) => {
              const isOpenPermissionType = openPermissionType === permissionType;
              return (
                <Fragment key={permissionType}>
                  <PermissionTypeWrapper isDataSet={isDataSet}>
                    <SpaceBetweenGrid>
                      <Typography component="span">{_capitalize(permissionType)}</Typography>
                      {
                        isDataSet && (
                          <IconButton
                              aria-label="toggle open/close permission type"
                              onClick={() => toggleOpenPermissionType(permissionType)}>
                            <FontAwesomeIcon fixedWidth icon={isOpenPermissionType ? faChevronUp : faChevronDown} />
                          </IconButton>
                        )
                      }
                      {
                        !isDataSet && updatePermissionsRS === RequestStates.PENDING && (
                          <SpinnerWrapper>
                            <Spinner size="lg" />
                          </SpinnerWrapper>
                        )
                      }
                      {
                        !isDataSet && updatePermissionsRS !== RequestStates.PENDING && (
                          <Checkbox
                              data-permission-type={permissionType}
                              checked={objectAce?.permissions.includes(permissionType)}
                              onChange={handleOnChangePermission} />
                        )
                      }
                    </SpaceBetweenGrid>
                  </PermissionTypeWrapper>
                  {
                    isOpenPermissionType && (
                      <PropertiesWrapper key={permissionType}>
                        <StackGrid>
                          <div>
                            <Typography gutterBottom variant="body2">Object</Typography>
                            <SpaceBetweenGrid>
                              <Typography component="span">Data Set Object</Typography>
                              <Checkbox
                                  data-permission-type={permissionType}
                                  checked={objectAce?.permissions.includes(permissionType)}
                                  onChange={handleOnChangePermission} />
                            </SpaceBetweenGrid>
                          </div>
                          <div>
                            <Typography gutterBottom variant="body2">Properties</Typography>
                            {
                              properties.valueSeq().map((property :PropertyType | Map) => {
                                const propertyId :UUID = property.id || get(property, 'id');
                                const propertyTitle :UUID = property.title || get(property, 'title');
                                const propertyTypeFQN :?string = property?.type?.toString() || '';
                                const key :List<UUID> = List([objectKey.get(0), propertyId]);
                                const ace :?Ace = permissions.get(key);
                                return (
                                  <SpaceBetweenGrid key={propertyId}>
                                    <Typography data-property-id={propertyId} title={propertyTypeFQN}>
                                      {propertyTitle}
                                    </Typography>
                                    {
                                      updatePermissionsRS === RequestStates.PENDING && targetPropertyId === propertyId
                                        ? (
                                          <SpinnerWrapper>
                                            <Spinner size="lg" />
                                          </SpinnerWrapper>
                                        )
                                        : (
                                          <Checkbox
                                              data-permission-type={permissionType}
                                              data-property-id={propertyId}
                                              checked={ace?.permissions.includes(permissionType)}
                                              onChange={handleOnChangePermission} />
                                        )
                                    }
                                  </SpaceBetweenGrid>
                                );
                              })
                            }
                          </div>
                        </StackGrid>
                      </PropertiesWrapper>
                    )
                  }
                </Fragment>
              );
            })
          )
        }
      </StackGrid>
    </CardSegment>
  );
};

export default PrincipalPermissionsContainer;
