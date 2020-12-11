/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import { List } from 'immutable';
import { Types } from 'lattice';
import {
  AppContentWrapper,
  CheckboxSelect,
  SearchInput,
  Typography,
} from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type {
  Ace,
  Organization,
  PermissionType,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  ActionsGrid,
  CrumbItem,
  CrumbLink,
  Crumbs,
  Divider,
  PlusButton,
  Spinner,
  StackGrid,
} from '../../components';
import { GET_ORGANIZATION_OBJECT_PERMISSIONS, getOrganizationObjectPermissions } from '../../core/permissions/actions';
import { resetRequestState } from '../../core/redux/actions';
import { PERMISSIONS } from '../../core/redux/constants';
import { selectObjectPermissions, selectOrganization } from '../../core/redux/selectors';
import { Routes } from '../../core/router';
import { ObjectPermissionsCardStack } from '../permissions';
import type { ReactSelectOption } from '../../types';

const { PermissionTypes } = Types;

const PERMISSION_TYPE_OPTIONS = [
  { label: PermissionTypes.OWNER.toLowerCase(), value: PermissionTypes.OWNER },
  { label: PermissionTypes.READ.toLowerCase(), value: PermissionTypes.READ },
  { label: PermissionTypes.WRITE.toLowerCase(), value: PermissionTypes.WRITE },
  { label: PermissionTypes.LINK.toLowerCase(), value: PermissionTypes.LINK },
  { label: PermissionTypes.MATERIALIZE.toLowerCase(), value: PermissionTypes.MATERIALIZE },
];

const SearchFilterAssignPermissionsGrid = styled(ActionsGrid)`
  grid-template-columns: 2fr minmax(200px, 1fr) auto;
`;

const OrgObjectPermissionsContainer = ({
  organizationId,
} :{
  organizationId :UUID;
}) => {

  const dispatch = useDispatch();
  const [filterByPermissionTypes, setFilterByPermissionTypes] = useState([]);

  const getOrgObjectPermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_ORGANIZATION_OBJECT_PERMISSIONS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));

  const key = useMemo(() => List([organizationId]), [organizationId]);
  const permissions :List<Ace> = useSelector(selectObjectPermissions(key));

  useEffect(() => {
    if (getOrgObjectPermissionsRS === RequestStates.STANDBY) {
      dispatch(getOrganizationObjectPermissions(List().push(key)));
    }
  }, [dispatch, getOrgObjectPermissionsRS, key, permissions]);

  useEffect(() => () => {
    dispatch(resetRequestState([GET_ORGANIZATION_OBJECT_PERMISSIONS]));
  }, [dispatch]);

  const orgPath = useMemo(() => (
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  if (organization) {

    const handleOnChangeSelect = (options :?ReactSelectOption<PermissionType>[]) => {
      if (!options) {
        setFilterByPermissionTypes([]);
      }
      else {
        setFilterByPermissionTypes(options.map((option) => option.value));
      }
    };

    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={orgPath}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbItem>Permissions</CrumbItem>
        </Crumbs>
        {
          getOrgObjectPermissionsRS === RequestStates.PENDING && (
            <Spinner />
          )
        }
        {
          getOrgObjectPermissionsRS === RequestStates.SUCCESS && (
            <StackGrid>
              <Typography variant="h1">Permissions</Typography>
              <Typography>
                Below are the users and roles that are granted permissions on this object.
              </Typography>
              <SearchFilterAssignPermissionsGrid>
                <SearchInput />
                <CheckboxSelect
                    hideSelectedOptions
                    isClearable
                    onChange={handleOnChangeSelect}
                    options={PERMISSION_TYPE_OPTIONS}
                    placeholder="Filter by permission" />
                <PlusButton aria-label="assign permissions">
                  <Typography component="span">Assign Permissions</Typography>
                </PlusButton>
              </SearchFilterAssignPermissionsGrid>
              <Divider isVisible={false} margin={0} />
              <ObjectPermissionsCardStack
                  filterByPermissionTypes={filterByPermissionTypes}
                  organizationId={organizationId}
                  permissions={permissions} />
            </StackGrid>
          )
        }
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgObjectPermissionsContainer;
