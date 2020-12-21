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
import { GET_ORG_OBJECT_PERMISSIONS, getOrgObjectPermissions } from '../../core/permissions/actions';
import { resetRequestState } from '../../core/redux/actions';
import { PERMISSIONS } from '../../core/redux/constants';
import { selectObjectPermissions, selectOrganization } from '../../core/redux/selectors';
import { ObjectPermissionsCardStack } from '../permissions';
import { PERMISSION_TYPE_RS_OPTIONS } from '../permissions/constants';
import type { ReactSelectOption } from '../../types';

const ObjectPermissionsActionGrid = styled(ActionsGrid)`
  grid-template-columns: 2fr minmax(200px, 1fr) auto;
`;

const OrgObjectPermissionsContainer = ({
  organizationId,
  organizationRoute,
} :{
  organizationId :UUID;
  organizationRoute :string;
}) => {

  const dispatch = useDispatch();
  const [filterByPermissionTypes, setFilterByPermissionTypes] = useState([]);
  const [filterByQuery, setFilterByQuery] = useState('');

  const getOrgObjectPermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_ORG_OBJECT_PERMISSIONS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));

  const objectKey = useMemo(() => List([organizationId]), [organizationId]);
  const permissions :List<Ace> = useSelector(selectObjectPermissions(objectKey));

  useEffect(() => {
    if (getOrgObjectPermissionsRS === RequestStates.STANDBY) {
      dispatch(getOrgObjectPermissions(List().push(objectKey)));
    }
  }, [dispatch, getOrgObjectPermissionsRS, objectKey, permissions]);

  useEffect(() => () => {
    dispatch(resetRequestState([GET_ORG_OBJECT_PERMISSIONS]));
  }, [dispatch]);

  if (organization) {

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
          <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
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

export default OrgObjectPermissionsContainer;
