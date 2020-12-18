/*
 * @flow
 */

import React, { Fragment, useState } from 'react';
import type { ComponentType } from 'react';

import styled from 'styled-components';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  List,
  Map,
  Set,
  get,
} from 'immutable';
import { Models, Types } from 'lattice';
import {
  CardSegment,
  Checkbox,
  Colors,
  IconButton,
  Typography,
} from 'lattice-ui-kit';
import { LangUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type {
  Ace,
  PermissionType,
  Principal,
  PropertyType,
  Role,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { SpaceBetweenGrid, Spinner, StackGrid } from '../../components';
import { UPDATE_PERMISSIONS, updatePermissions } from '../../core/permissions/actions';
import { PERMISSIONS } from '../../core/redux/constants';
import { getUserProfileLabel } from '../../utils/PersonUtils';

const { NEUTRAL } = Colors;
const { AceBuilder } = Models;
const { ActionTypes, PermissionTypes, PrincipalTypes } = Types;
const { isNonEmptyString } = LangUtils;

const ORDERED_PERMISSIONS = [
  PermissionTypes.OWNER,
  PermissionTypes.READ,
  PermissionTypes.WRITE,
  PermissionTypes.LINK,
  PermissionTypes.MATERIALIZE,
];

const Card :ComponentType<{|
  bgColor ?:string;
  children :any;
  indent ?:number;
|}> = styled.div`
  background-color: ${({ bgColor }) => (bgColor || 'white')};
  border-radius: 5px;
  margin-left: ${({ indent = 0 }) => indent * 32}px;
`;

const SpinnerWrapper = styled.div`
  display: flex;
  margin-right: -4px; /* for alignment with checkbox / chevron */
  min-height: 40px; /* because checkbox has this min-height */
`;

const ObjectPermissionsCard = ({
  ace,
  filterByQuery,
  isDataSet,
  objectKey,
  organizationMembers,
  organizationRoles,
  properties,
} :{|
  ace :Ace;
  filterByQuery :string;
  isDataSet :boolean;
  objectKey :List<UUID>;
  organizationMembers :Map<Principal, Map>;
  organizationRoles :Map<Principal, Role>;
  properties :Map<UUID, PropertyType | Map>;
|}) => {

  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [openPermissionType, setOpenPermissionType] = useState('');

  const updatePermissionsRS :?RequestState = useRequestState([PERMISSIONS, UPDATE_PERMISSIONS]);

  let title = '';
  if (ace.principal.type === PrincipalTypes.ROLE) {
    // TODO: it's not guaranteed that this role belongs to this organization, in which case it's not clear exactly
    // how we're going to resolve the role title
    const role :?Role = organizationRoles.get(ace.principal);
    if (role) {
      title = role.title;
    }
  }
  else if (ace.principal.type === PrincipalTypes.USER) {
    // TODO: it's not guaranteed that this user is a member of this organization, in which case it's not clear exactly
    // how we're going to resolve the user's name (or rather, something other than the user_id)
    const member :?Map = organizationMembers.get(ace.principal);
    title = getUserProfileLabel(member);
  }

  if (!isNonEmptyString(title)) {
    title = ace.principal.id;
  }

  const permissions = ORDERED_PERMISSIONS
    .filter((permissionType :PermissionType) => ace.permissions.includes(permissionType))
    .map((permissionType :PermissionType) => permissionType.toLowerCase())
    .join(', ');

  const handleOnChangePermission = (event :SyntheticEvent<HTMLInputElement>) => {

    const { permissionType } = event.currentTarget.dataset;

    if (PermissionTypes[permissionType]) {
      const aceForUpdate = (new AceBuilder())
        .setPermissions(Set([permissionType]))
        .setPrincipal(ace.principal)
        .build();
      dispatch(
        updatePermissions({
          actionType: event.currentTarget.checked ? ActionTypes.ADD : ActionTypes.REMOVE,
          permissions: Map().set(objectKey, aceForUpdate),
        })
      );
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
              <Typography component="span">{permissions}</Typography>
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
              const bgColor = isDataSet ? NEUTRAL.N50 : undefined;
              const padding = isDataSet ? '2px 2px 2px 16px' : '0 12px 0 0';
              return (
                <Fragment key={permissionType}>
                  <Card bgColor={bgColor} indent={2}>
                    <CardSegment padding={padding}>
                      <SpaceBetweenGrid>
                        <Typography component="span">{permissionType.toLowerCase()}</Typography>
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
                                checked={ace.permissions.includes(permissionType)}
                                onChange={handleOnChangePermission} />
                          )
                        }
                      </SpaceBetweenGrid>
                    </CardSegment>
                  </Card>
                  {
                    isOpenPermissionType && (
                      <Card indent={3}>
                        <CardSegment borderless key={permissionType} padding="0 12px 0 0">
                          <SpaceBetweenGrid>
                            <Typography component="span">Data Set Object</Typography>
                            <Checkbox
                                data-object-key={objectKey}
                                data-permission-type={permissionType}
                                checked={ace.permissions.includes(permissionType)}
                                onChange={() => {}} />
                          </SpaceBetweenGrid>
                          {
                            properties.valueSeq().map((property :PropertyType | Map) => {
                              const propertyId :UUID = property.id || get(property, 'id');
                              const propertyTitle :UUID = property.title || get(property, 'title');
                              const propertyTypeFQN :?string = property?.type?.toString() || '';
                              return (
                                <SpaceBetweenGrid key={propertyId}>
                                  <Typography data-property-id={propertyId} title={propertyTypeFQN}>
                                    {propertyTitle}
                                  </Typography>
                                  <Checkbox
                                      data-property-id={propertyId}
                                      data-permission-type={permissionType}
                                      // checked={ace.permissions.includes(permissionType)}
                                      onChange={() => {}} />
                                </SpaceBetweenGrid>
                              );
                            })
                          }
                        </CardSegment>
                      </Card>
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

export default ObjectPermissionsCard;
