/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import { List, Map } from 'immutable';
import { AppContentWrapper, Typography } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import type { EntitySet, Organization, UUID } from 'lattice';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Divider,
  StackGrid,
} from '../../components';
import {
  GET_ORG_DATA_SET_OBJECT_PERMISSIONS,
} from '../../core/permissions/actions';
import { resetRequestState } from '../../core/redux/actions';
import {
  selectAtlasDataSets,
  selectEntitySets,
  selectOrganization,
} from '../../core/redux/selectors';
import { getDataSetField } from '../../utils';
import { ObjectPermissionsContainer, PermissionsActionsGrid } from '../permissions';

const OrgDataSetObjectPermissionsContainer = ({
  dataSetId,
  dataSetRoute,
  dataSetsRoute,
  organizationId,
  organizationRoute,
} :{|
  dataSetId :UUID;
  dataSetRoute :string;
  dataSetsRoute :string;
  organizationId :UUID;
  organizationRoute :string;
|}) => {

  const dispatch = useDispatch();

  const [filterByPermissionTypes, setFilterByPermissionTypes] = useState([]);
  const [filterByQuery, setFilterByQuery] = useState('');
  const [isVisibleAssignPermissionsModal, setIsVisibleAssignPermissionsModal] = useState(false);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const atlasDataSets :Map<UUID, Map> = useSelector(selectAtlasDataSets([dataSetId]));
  const entitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets([dataSetId]));

  useEffect(() => () => {
    dispatch(resetRequestState([GET_ORG_DATA_SET_OBJECT_PERMISSIONS]));
  }, [dispatch]);

  const objectKey = useMemo(() => List([dataSetId]), [dataSetId]);

  const atlasDataSet :?Map = atlasDataSets.get(dataSetId);
  const entitySet :?EntitySet = entitySets.get(dataSetId);
  const dataSet = atlasDataSet || entitySet;
  const name :string = getDataSetField(dataSet, 'name');
  const title :string = getDataSetField(dataSet, 'title');

  const onOpenPermissionsModal = () => setIsVisibleAssignPermissionsModal(true);
  const onClosePermissionsModal = () => setIsVisibleAssignPermissionsModal(false);

  return (
    <AppContentWrapper>
      <Crumbs>
        <CrumbLink to={organizationRoute}>{organization?.title || 'Organization'}</CrumbLink>
        <CrumbLink to={dataSetsRoute}>Data Sets</CrumbLink>
        <CrumbLink to={dataSetRoute}>{title || name}</CrumbLink>
        <CrumbItem>Permissions</CrumbItem>
      </Crumbs>
      <StackGrid>
        <Typography variant="h1">Permissions</Typography>
        <Typography>
          Below are the users, roles, and organizations that are granted permissions on this object.
        </Typography>
        <PermissionsActionsGrid
            assignPermissionsText="Add permission"
            onChangeFilterByPermissionTypes={setFilterByPermissionTypes}
            onChangeFilterByQuery={setFilterByQuery}
            onClickAssignPermissions={onOpenPermissionsModal} />
        <Divider isVisible={false} margin={0} />
        <ObjectPermissionsContainer
            filterByPermissionTypes={filterByPermissionTypes}
            filterByQuery={filterByQuery}
            isVisibleAssignPermissionsModal={isVisibleAssignPermissionsModal}
            dataSetId={dataSetId}
            objectKey={objectKey}
            onClosePermissionsModal={onClosePermissionsModal}
            organizationId={organizationId} />
      </StackGrid>
    </AppContentWrapper>
  );
};

export default OrgDataSetObjectPermissionsContainer;
