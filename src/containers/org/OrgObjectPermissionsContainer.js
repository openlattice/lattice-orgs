/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import { List } from 'immutable';
import { AppContentWrapper, Modal, Typography } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Divider,
  StackGrid,
} from '../../components';
import { GET_ORG_OBJECT_PERMISSIONS, getOrgObjectPermissions } from '../../core/permissions/actions';
import { resetRequestState } from '../../core/redux/actions';
import { PERMISSIONS } from '../../core/redux/constants';
import { selectOrganization } from '../../core/redux/selectors';
import { ObjectPermissionsContainer, PermissionsActionsGrid } from '../permissions';
import { AssignPermissionsToObjectModalBody } from '../permissions/assign-permissions-to-object';

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
  const [isVisibleAssignPermissionsModal, setIsVisibleAssignPermissionsModal] = useState(false);

  const getOrgObjectPermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_ORG_OBJECT_PERMISSIONS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));

  const objectKey = useMemo(() => List([organizationId]), [organizationId]);

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
        <StackGrid>
          <Typography variant="h1">Permissions</Typography>
          <Typography>
            Below are the users and roles that are granted permissions on this object.
          </Typography>
          <PermissionsActionsGrid
              assignPermissionsText="Add permission"
              onChangeFilterByPermissionTypes={setFilterByPermissionTypes}
              onChangeFilterByQuery={setFilterByQuery}
              onClickAssignPermissions={() => setIsVisibleAssignPermissionsModal(true)} />
          <Divider isVisible={false} margin={0} />
          <ObjectPermissionsContainer
              filterByPermissionTypes={filterByPermissionTypes}
              filterByQuery={filterByQuery}
              objectKey={objectKey}
              organizationId={organizationId} />
          <Modal
              isVisible={isVisibleAssignPermissionsModal}
              onClose={() => setIsVisibleAssignPermissionsModal(false)}
              shouldCloseOnOutsideClick={false}
              textTitle="Assign Permissions To Role Object"
              viewportScrolling
              withFooter={false}>
            <AssignPermissionsToObjectModalBody
                onClose={() => setIsVisibleAssignPermissionsModal(false)}
                objectKey={objectKey}
                organizationId={organizationId}
                principal={organization.principal} />
          </Modal>
        </StackGrid>
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgObjectPermissionsContainer;
