/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import { List, Map, getIn } from 'immutable';
import { AppContentWrapper, Typography } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type {
  Ace,
  EntitySet,
  Organization,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Divider,
  Spinner,
  StackGrid,
} from '../../components';
import { GET_OR_SELECT_DATA_SET, getOrSelectDataSet } from '../../core/edm/actions';
import { GET_ORG_DATA_SET_OBJECT_PERMISSIONS, getOrgDataSetObjectPermissions } from '../../core/permissions/actions';
import { resetRequestState } from '../../core/redux/actions';
import { EDM, PERMISSIONS } from '../../core/redux/constants';
import {
  selectAtlasDataSets,
  selectEntitySets,
  selectObjectPermissions,
  selectOrganization,
} from '../../core/redux/selectors';
import { ObjectPermissionsActionsGrid, ObjectPermissionsCardStack } from '../permissions';

const { reduceRequestStates } = ReduxUtils;

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

  const getOrSelectDataSetRS :?RequestState = useRequestState([EDM, GET_OR_SELECT_DATA_SET]);
  const getOrgDataSetObjectPermissionsRS :?RequestState = useRequestState(
    [PERMISSIONS, GET_ORG_DATA_SET_OBJECT_PERMISSIONS]
  );

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const atlasDataSets :Map<UUID, Map> = useSelector(selectAtlasDataSets([dataSetId]));
  const entitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets([dataSetId]));

  const objectKey = useMemo(() => List([dataSetId]), [dataSetId]);
  const permissions :List<Ace> = useSelector(selectObjectPermissions(objectKey));

  const atlasDataSet :?Map = atlasDataSets.get(dataSetId);
  const entitySet :?EntitySet = entitySets.get(dataSetId);
  const name :string = entitySet?.name || getIn(atlasDataSet, ['table', 'name']);
  const title :string = entitySet?.title || getIn(atlasDataSet, ['table', 'title']);

  useEffect(() => {
    dispatch(getOrSelectDataSet({ dataSetId, organizationId }));
  }, [dispatch, dataSetId, organizationId]);

  useEffect(() => {
    if (getOrgDataSetObjectPermissionsRS === RequestStates.STANDBY) {
      dispatch(getOrgDataSetObjectPermissions(List().push(objectKey)));
    }
  }, [dispatch, getOrgDataSetObjectPermissionsRS, objectKey]);

  useEffect(() => () => {
    dispatch(resetRequestState([GET_ORG_DATA_SET_OBJECT_PERMISSIONS]));
  }, [dispatch]);

  const reducedRS :?RequestState = reduceRequestStates([getOrSelectDataSetRS, getOrgDataSetObjectPermissionsRS]);

  return (
    <AppContentWrapper>
      <Crumbs>
        <CrumbLink to={organizationRoute}>{organization?.title || 'Organization'}</CrumbLink>
        <CrumbLink to={dataSetsRoute}>Data Sets</CrumbLink>
        <CrumbLink to={dataSetRoute}>{title || name}</CrumbLink>
        <CrumbItem>Permissions</CrumbItem>
      </Crumbs>
      {
        reducedRS === RequestStates.PENDING && (
          <Spinner />
        )
      }
      {
        reducedRS === RequestStates.SUCCESS && (
          <StackGrid>
            <Typography variant="h1">Permissions</Typography>
            <Typography>
              Below are the users, roles, and organizations that are granted permissions on this object.
            </Typography>
            <ObjectPermissionsActionsGrid
                onChangeFilterByPermissionTypes={setFilterByPermissionTypes}
                onChangeFilterByQuery={setFilterByQuery} />
            <Divider isVisible={false} margin={0} />
            <ObjectPermissionsCardStack
                filterByPermissionTypes={filterByPermissionTypes}
                filterByQuery={filterByQuery}
                isDataSet
                objectKey={objectKey}
                organizationId={organizationId}
                permissions={permissions} />
          </StackGrid>
        )
      }
    </AppContentWrapper>
  );
};

export default OrgDataSetObjectPermissionsContainer;
