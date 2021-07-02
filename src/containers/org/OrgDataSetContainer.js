/*
 * @flow
 */

import React, { useMemo } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  AppContentWrapper,
  AppNavigationWrapper,
  Badge,
  Colors,
  Label,
  MarkdownPreview,
  Typography,
} from 'lattice-ui-kit';
import { DataUtils, LangUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import type { FQN, Organization, UUID } from 'lattice';

import DataSetActionButton from './components/dataset/DataSetActionButton';
import DataSetDataContainer from './DataSetDataContainer';
import DataSetMetaDataContainer from './DataSetMetaDataContainer';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  NavContentWrapper,
  SpaceBetweenGrid,
  StackGrid,
} from '../../components';
import { FQNS } from '../../core/edm/constants';
import {
  selectDataSetSchema,
  selectOrgDataSet,
  selectOrgDataSetColumns,
  selectOrgDataSetSize,
  selectOrganization
} from '../../core/redux/selectors';
import { Routes } from '../../core/router';
import { isAtlasDataSet } from '../../utils';

const { BLUE } = Colors;

const { getPropertyValue } = DataUtils;
const { isDefined, isNonEmptyString } = LangUtils;

const ReducedMargin = styled.div`
  margin: -16px 0;
`;

const CountBadge = styled(Badge)`
  background: ${BLUE.B300};
  color: white;
  margin-right: 5px;
`;

const OrgDataSetContainer = ({
  dataSetDataRoute,
  dataSetId,
  dataSetRoute,
  organizationId,
  organizationRoute,
} :{|
  dataSetDataRoute :string;
  dataSetId :UUID;
  dataSetRoute :string;
  organizationId :UUID;
  organizationRoute :string;
|}) => {

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const dataSet :Map<FQN, List> = useSelector(selectOrgDataSet(organizationId, dataSetId));
  const dataSetSchema :?string = useSelector(selectDataSetSchema(dataSetId));
  const dataSetColumns :List<Map<FQN, List>> = useSelector(selectOrgDataSetColumns(organizationId, dataSetId));
  const dataSetSize :?number = useSelector(selectOrgDataSetSize(organizationId, dataSetId));

  const description :string = getPropertyValue(dataSet, [FQNS.OL_DESCRIPTION, 0]);
  const name :string = getPropertyValue(dataSet, [FQNS.OL_DATA_SET_NAME, 0]);
  const title :string = getPropertyValue(dataSet, [FQNS.OL_TITLE, 0]);

  const contact :string = useMemo(() => {
    const contactEmail :string = getPropertyValue(dataSet, [FQNS.CONTACT_EMAIL, 0]);
    const contactPhone :string = getPropertyValue(dataSet, [FQNS.CONTACT_PHONE_NUMBER, 0]);
    let contactString = '';
    if (isNonEmptyString(contactEmail) && isNonEmptyString(contactPhone)) {
      contactString = `${contactEmail} - ${contactPhone}`;
    }
    else if (isNonEmptyString(contactEmail)) {
      contactString = contactEmail;
    }
    else if (isNonEmptyString(contactPhone)) {
      contactString = contactPhone;
    }
    return contactString;
  }, [dataSet]);

  if (organization) {

    const renderDataSetDataContainer = () => (
      <DataSetDataContainer dataSetName={title || name} dataSetId={dataSetId} organizationId={organizationId} />
    );

    const renderDataSetMetaContainer = () => (
      <DataSetMetaDataContainer dataSetId={dataSetId} organizationId={organizationId} />
    );

    return (
      <>
        <AppContentWrapper>
          <Crumbs>
            <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
            <CrumbItem>{title || name}</CrumbItem>
          </Crumbs>
          <StackGrid gap={32}>
            <StackGrid>
              <SpaceBetweenGrid>
                <div>
                  <Typography variant="h1">{title || name}</Typography>
                  { name && <Typography variant="subtitle1">{name}</Typography> }
                </div>
                <DataSetActionButton dataSetId={dataSetId} organizationId={organizationId} />
              </SpaceBetweenGrid>
              <div>
                <CountBadge count={dataSetColumns.size} />
                <Label subtle>Data Fields</Label>
                { (isDefined(dataSetSize) && !isAtlasDataSet(dataSet)) && (
                  <>
                    <CountBadge count={dataSetSize} max={1000000} />
                    <Label subtle>Records</Label>
                  </>
                )}
              </div>
            </StackGrid>
            <ReducedMargin>
              <MarkdownPreview>{description || name}</MarkdownPreview>
            </ReducedMargin>
            {
              isNonEmptyString(dataSetSchema) && (
                <StackGrid>
                  <Typography variant="h4">Schema</Typography>
                  <Typography>{dataSetSchema}</Typography>
                </StackGrid>
              )
            }
            <StackGrid>
              <Typography variant="h4">Contact</Typography>
              {
                isNonEmptyString(contact)
                  ? (
                    <Typography>{contact}</Typography>
                  )
                  : (
                    <Typography>No contact information is available.</Typography>
                  )
              }
            </StackGrid>
          </StackGrid>
        </AppContentWrapper>
        <NavContentWrapper borderless bgColor="white">
          <AppNavigationWrapper borderless>
            <NavLink exact strict to={dataSetRoute}>
              <Typography variant="h3">Properties</Typography>
            </NavLink>
            {
              !isAtlasDataSet(dataSet) && (
                <NavLink to={dataSetDataRoute}>
                  <Typography variant="h3">Search</Typography>
                </NavLink>
              )
            }
          </AppNavigationWrapper>
        </NavContentWrapper>
        <Switch>
          <Route exact path={Routes.ORG_DATA_SET_DATA} render={renderDataSetDataContainer} />
          <Route exact path={Routes.ORG_DATA_SET} render={renderDataSetMetaContainer} />
        </Switch>
      </>
    );
  }

  return null;
};

export default OrgDataSetContainer;
