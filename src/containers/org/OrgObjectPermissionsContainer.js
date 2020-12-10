/*
 * @flow
 */

import React, { useEffect, useMemo } from 'react';

import { List } from 'immutable';
import { Types } from 'lattice';
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
  Spinner,
  StackGrid,
} from '../../components';
import { GET_ORGANIZATION_OBJECT_PERMISSIONS, getOrganizationObjectPermissions } from '../../core/permissions/actions';
import { resetRequestState } from '../../core/redux/actions';
import { PERMISSIONS } from '../../core/redux/constants';
import { selectObjectPermissions, selectOrganization } from '../../core/redux/selectors';
import { Routes } from '../../core/router';
import { ObjectPermissionsCard } from '../permissions';

const { PrincipalTypes } = Types;

const OrgObjectPermissionsContainer = ({
  organizationId,
} :{
  organizationId :UUID;
}) => {

  const dispatch = useDispatch();

  const getOrgObjectPermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_ORGANIZATION_OBJECT_PERMISSIONS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));

  const key = useMemo(() => List([organizationId]), [organizationId]);
  const permissions :List<Ace> = useSelector(selectObjectPermissions(key));
  const permissionsCount :number = permissions.count();

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
              {
                permissionsCount === 0 && (
                  <Typography>No permissions.</Typography>
                )
              }
              {
                permissionsCount > 0 && (
                  <div>
                    {
                      permissions
                        .filter((ace :Ace) => (
                          ace.principal.type === PrincipalTypes.ROLE || ace.principal.type === PrincipalTypes.USER
                        ))
                        .map((ace :Ace) => (
                          <ObjectPermissionsCard ace={ace} key={ace.principal.id} />
                        ))
                    }
                  </div>
                )
              }
            </StackGrid>
          )
        }
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgObjectPermissionsContainer;
