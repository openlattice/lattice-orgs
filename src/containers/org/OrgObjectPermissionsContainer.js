/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import { List } from 'immutable';
import { AppContentWrapper, Typography } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Ace, Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Divider,
  Spinner,
  StackGrid,
} from '../../components';
import { GET_ORG_OBJECT_PERMISSIONS, getOrgObjectPermissions } from '../../core/permissions/actions';
import { resetRequestState } from '../../core/redux/actions';
import { PERMISSIONS } from '../../core/redux/constants';
import { selectObjectPermissions, selectOrganization } from '../../core/redux/selectors';
import { ObjectPermissionsActionsGrid, ObjectPermissionsCardStack } from '../permissions';

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
  }, [dispatch, getOrgObjectPermissionsRS, objectKey]);

  useEffect(() => () => {
    dispatch(resetRequestState([GET_ORG_OBJECT_PERMISSIONS]));
  }, [dispatch]);

  if (organization) {

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
              <ObjectPermissionsActionsGrid
                  onChangeFilterByPermissionTypes={setFilterByPermissionTypes}
                  onChangeFilterByQuery={setFilterByQuery} />
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
