/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import {
  List,
  Map,
  get,
  getIn,
} from 'immutable';
import { AppContentWrapper, Table, Typography } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type {
  EntitySet,
  Organization,
  PropertyType,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Spinner,
  StackGrid,
} from '../../components';
import { GET_OR_SELECT_DATA_SETS, getOrSelectDataSets } from '../../core/edm/actions';
import { EDM } from '../../core/redux/constants';
import {
  selectAtlasDataSets,
  selectEntitySetPropertyTypes,
  selectEntitySets,
  selectOrganization,
} from '../../core/redux/selectors';
import { Routes } from '../../core/router';

const TABLE_HEADERS = [
  { key: 'title', label: 'TITLE' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'datatype', label: 'DATA TYPE' },
];

const OrgDataSetContainer = ({
  dataSetId,
  organizationId,
} :{|
  dataSetId :UUID;
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();

  const [data, setData] = useState([]);

  // BUG: this is probably a bug because getOrSelectDataSets could be called in the background
  const getOrSelectDataSetsRS :?RequestState = useRequestState([EDM, GET_OR_SELECT_DATA_SETS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const atlasDataSets :Map<UUID, Map> = useSelector(selectAtlasDataSets([dataSetId]));
  const entitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets([dataSetId]));

  const propertyTypes :Map<UUID, PropertyType> = useSelector(selectEntitySetPropertyTypes(dataSetId));
  // BUG: unfortunately, I think hashCode() is computed every time since the Map is always "new"
  const propertyTypesHash :number = propertyTypes.hashCode();

  const atlasDataSet :?Map = atlasDataSets.get(dataSetId);
  const entitySet :?EntitySet = entitySets.get(dataSetId);
  const description :string = entitySet?.description || getIn(atlasDataSet, ['table', 'description']);
  const name :string = entitySet?.name || getIn(atlasDataSet, ['table', 'name']);
  const title :string = entitySet?.title || getIn(atlasDataSet, ['table', 'title']);
  const contacts :string[] = entitySet?.contacts || [];

  useEffect(() => {
    // BUG: doesn't have to ALWAYS be called because it's very likely we'll already have the data
    dispatch(
      getOrSelectDataSets({
        organizationId,
        atlasDataSetIds: [dataSetId],
        entitySetIds: [dataSetId],
      })
    );
  }, [dispatch, dataSetId, organizationId]);

  useEffect(() => {
    if (atlasDataSet) {
      const columnsData = atlasDataSet
        .get('columns', List())
        .map((column) => ({
          id: get(column, 'id'),
          datatype: get(column, 'datatype'),
          description: get(column, 'description'),
          title: get(column, 'name'),
        }))
        .toJS(); // TODO: avoid .toJS()
      setData(columnsData);
    }
    else if (entitySet) {
      const propertyTypesData = propertyTypes
        .valueSeq()
        .map((propertyType :PropertyType) => ({
          id: propertyType.id,
          datatype: propertyType.datatype,
          description: propertyType.description,
          title: propertyType.title,
        }))
        .toJS(); // TODO: avoid .toJS()
      setData(propertyTypesData);
    }
    else {
      setData([]);
    }
  }, [atlasDataSet, entitySet, propertyTypesHash]);

  const dataSetsPath = useMemo(() => (
    Routes.ORG_DATA_SETS.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const orgPath = useMemo(() => (
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  if (organization) {
    return (
      <>
        <AppContentWrapper>
          <Crumbs>
            <CrumbLink to={orgPath}>{organization.title || 'Organization'}</CrumbLink>
            <CrumbLink to={dataSetsPath}>Data Sets</CrumbLink>
            <CrumbItem>{dataSetId}</CrumbItem>
          </Crumbs>
          {
            getOrSelectDataSetsRS === RequestStates.PENDING && (
              <Spinner />
            )
          }
          {
            getOrSelectDataSetsRS === RequestStates.SUCCESS && (
              <StackGrid gap={48}>
                <StackGrid>
                  <Typography variant="h1">{title || name}</Typography>
                  <Typography>{description || name}</Typography>
                </StackGrid>
                <StackGrid>
                  <Typography variant="h4">Contact</Typography>
                  {
                    contacts.length === 0 && (
                      <Typography>No contact information is available.</Typography>
                    )
                  }
                  {
                    contacts.length > 0 && (
                      contacts.map((contact :string) => (
                        <Typography key={contact}>{contact}</Typography>
                      ))
                    )
                  }
                </StackGrid>
                <Table
                    data={data}
                    headers={TABLE_HEADERS} />
              </StackGrid>
            )
          }
        </AppContentWrapper>
      </>
    );
  }

  return null;
};

export default OrgDataSetContainer;
