/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import _debounce from 'lodash/debounce';
import styled from 'styled-components';
import { List } from 'immutable';
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
  Role,
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
import { GET_ORG_ROLE_OBJECT_PERMISSIONS, getOrgRoleObjectPermissions } from '../../core/permissions/actions';
import { resetRequestState } from '../../core/redux/actions';
import { PERMISSIONS } from '../../core/redux/constants';
import { selectObjectPermissions, selectOrganization } from '../../core/redux/selectors';
import { Routes } from '../../core/router';
import { ObjectPermissionsCardStack } from '../permissions';
import { PERMISSION_TYPE_RS_OPTIONS } from '../permissions/constants';
import type { ReactSelectOption } from '../../types';

const ObjectPermissionsActionGrid = styled(ActionsGrid)`
  grid-template-columns: 2fr minmax(200px, 1fr) auto;
`;

const OrgRoleObjectPermissionsContainer = ({
  organizationId,
  roleId,
} :{
  organizationId :UUID;
  roleId :UUID;
}) => {

  const dispatch = useDispatch();
  const [filterByPermissionTypes, setFilterByPermissionTypes] = useState([]);
  const [filterByQuery, setFilterByQuery] = useState('');

  const getOrgRoleObjectPermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_ORG_ROLE_OBJECT_PERMISSIONS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const role :?Role = useMemo(() => (
    organization?.roles.find((orgRole) => orgRole.id === roleId)
  ), [organization, roleId]);

  const objectKey = useMemo(() => List([organizationId, roleId]), [organizationId, roleId]);
  const permissions :List<Ace> = useSelector(selectObjectPermissions(objectKey));

  useEffect(() => {
    if (getOrgRoleObjectPermissionsRS === RequestStates.STANDBY) {
      dispatch(getOrgRoleObjectPermissions(List().push(objectKey)));
    }
  }, [dispatch, getOrgRoleObjectPermissionsRS, objectKey, permissions]);

  useEffect(() => () => {
    dispatch(resetRequestState([GET_ORG_ROLE_OBJECT_PERMISSIONS]));
  }, [dispatch]);

  const orgPath = useMemo(() => (
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const rolesPath = useMemo(() => (
    Routes.ORG_ROLES.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const rolePath = useMemo(() => (
    Routes.ORG_ROLE.replace(Routes.ORG_ID_PARAM, organizationId).replace(Routes.ROLE_ID_PARAM, roleId)
  ), [organizationId, roleId]);

  if (organization && role) {

    const handleOnChangeSelect = (options :?ReactSelectOption<PermissionType>[]) => {
      if (!options) {
        setFilterByPermissionTypes([]);
      }
      else {
        setFilterByPermissionTypes(options.map((option) => option.value));
      }
    };

    const debounceFilterByQuery = _debounce((query :string) => {
      setFilterByQuery(query);
    }, 250);

    const handleOnChangeFilterQuery = (event :SyntheticInputEvent<HTMLInputElement>) => {
      debounceFilterByQuery(event.target.value || '');
    };

    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={orgPath}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbLink to={rolesPath}>Roles</CrumbLink>
          <CrumbLink to={rolePath}>{role.title || 'Role'}</CrumbLink>
          <CrumbItem>Permissions</CrumbItem>
        </Crumbs>
        {
          getOrgRoleObjectPermissionsRS === RequestStates.PENDING && (
            <Spinner />
          )
        }
        {
          getOrgRoleObjectPermissionsRS === RequestStates.SUCCESS && (
            <StackGrid>
              <Typography variant="h1">Permissions</Typography>
              <Typography>
                Below are the users and roles that are granted permissions on this object.
              </Typography>
              <ObjectPermissionsActionGrid>
                <SearchInput onChange={handleOnChangeFilterQuery} />
                <CheckboxSelect
                    hideSelectedOptions
                    isClearable
                    onChange={handleOnChangeSelect}
                    options={PERMISSION_TYPE_RS_OPTIONS}
                    placeholder="Filter by permission" />
                <PlusButton aria-label="assign permissions" isDisabled>
                  <Typography component="span">Assign Permissions</Typography>
                </PlusButton>
              </ObjectPermissionsActionGrid>
              <Divider isVisible={false} margin={0} />
              <ObjectPermissionsCardStack
                  filterByPermissionTypes={filterByPermissionTypes}
                  filterByQuery={filterByQuery}
                  objectKey={objectKey}
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

export default OrgRoleObjectPermissionsContainer;
