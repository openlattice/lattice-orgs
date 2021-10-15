/*
 * @flow
 */

import React, { useEffect } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';
import {
  AppContentWrapper,
  Badge,
  Chip,
  Colors,
  FolderTab,
  FolderTabs,
  Label,
  MarkdownPreview,
  Typography,
} from 'lattice-ui-kit';
import { LangUtils, ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import type { EntityType, Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import CollaborationsParticipationContainer from './CollaborationsParticipationContainer';
import DataSetActionButton from './components/dataset/DataSetActionButton';
import DataSetDataContainer from './DataSetDataContainer';
import DataSetMetadataContainer from './DataSetMetadataContainer';

import {
  COLLABORATIONS,
  CONTACTS,
  DESCRIPTION,
  ENTITY_TYPE_ID,
  METADATA,
  NAME,
  TAGS,
  TITLE
} from '../../common/constants';
import { clipboardWriteText, isEntitySet } from '../../common/utils';
import {
  ActionsGrid,
  CopyButton,
  CrumbItem,
  CrumbLink,
  Crumbs,
  Pre,
  SpaceBetweenGrid,
  StackGrid,
} from '../../components';
import { resetRequestStates } from '../../core/redux/actions';
import {
  selectCollaborationsByDataSetId,
  selectDataSetSchema,
  selectEntityType,
  selectOrgDataSet,
  selectOrgDataSetColumns,
  selectOrgDataSetSize,
  selectOrganization
} from '../../core/redux/selectors';
import { Routes } from '../../core/router';
import { ORG_DATA_SET_COLLABORATIONS } from '../../core/router/Routes';
import { clearCollaborationsByDataSetId } from '../collaborations/actions';

const { BLUE } = Colors;
const { isDefined, isNonEmptyString } = LangUtils;
const { GET_COLLABORATIONS_WITH_DATA_SETS, getCollaborationsWithDataSets } = CollaborationsApiActions;
const { isSuccess } = ReduxUtils;

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

  const dispatch = useDispatch();
  const location = useLocation();
  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const dataSet :Map = useSelector(selectOrgDataSet(organizationId, dataSetId));
  const dataSetEntityTypeId :UUID = dataSet.get(ENTITY_TYPE_ID);
  const dataSetColumns :Map<UUID, Map> = useSelector(selectOrgDataSetColumns(organizationId, dataSetId));
  const dataSetSchema :?string = useSelector(selectDataSetSchema(dataSetId));
  const dataSetSize :?number = useSelector(selectOrgDataSetSize(organizationId, dataSetId));
  const entityType :?EntityType = useSelector(selectEntityType(dataSetEntityTypeId));
  const getCollabWithDataSetRS :?RequestState = useRequestState([COLLABORATIONS, GET_COLLABORATIONS_WITH_DATA_SETS]);

  const collaborationsByDataSetId = useSelector(selectCollaborationsByDataSetId(dataSetId));

  useEffect(() => {
    dispatch(getCollaborationsWithDataSets(dataSetId));

    return () => {
      dispatch(resetRequestStates([GET_COLLABORATIONS_WITH_DATA_SETS]));
      dispatch(clearCollaborationsByDataSetId());
    };
  }, [dispatch, dataSetId]);

  const contacts :List<string> = dataSet.getIn([METADATA, CONTACTS]);
  const description :string = dataSet.getIn([METADATA, DESCRIPTION]);
  const name :string = dataSet.get(NAME);
  const title :string = dataSet.getIn([METADATA, TITLE]);
  const metadata :Map = dataSet.getIn([METADATA, METADATA], Map());

  const hasContactInfo :boolean = contacts.some(isNonEmptyString);
  const dataSetCollabRoute = ORG_DATA_SET_COLLABORATIONS
    .replace(Routes.ORG_ID_PARAM, organizationId)
    .replace(Routes.DATA_SET_ID_PARAM, dataSetId);

  const collabCount = collaborationsByDataSetId.size;
  const collabTabText = isSuccess(getCollabWithDataSetRS) ? `Collaborations (${collabCount})` : 'Collaborations';

  const tags = metadata.get(TAGS, List());
  const tagLabel = tags.join(', ');

  if (organization) {

    return (
      <>
        <AppContentWrapper>
          <Crumbs>
            <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
            <CrumbItem>{title || name}</CrumbItem>
          </Crumbs>
          <StackGrid gap={16}>
            <StackGrid>
              <SpaceBetweenGrid>
                <Typography gutterBottom variant="h1">{title || name}</Typography>
                <DataSetActionButton dataSetId={dataSetId} organizationId={organizationId} />
              </SpaceBetweenGrid>
              <div>
                <Typography variant="subtitle1">DATA SET NAME</Typography>
                <Typography gutterBottom>{name}</Typography>
                {
                  entityType && (
                    <>
                      <Typography variant="subtitle1">DATA SET TYPE</Typography>
                      <Typography gutterBottom>{entityType.type.toString()}</Typography>
                    </>
                  )
                }
                <Typography variant="subtitle1">DATA SET ID</Typography>
                <ActionsGrid align={{ v: 'center' }} fit>
                  <Pre>{dataSetId}</Pre>
                  <CopyButton
                      aria-label="copy organization id"
                      onClick={() => clipboardWriteText(dataSetId)} />
                </ActionsGrid>
              </div>
              <div>
                <CountBadge count={dataSetColumns.size} />
                <Label subtle>Data Fields</Label>
                {
                  isDefined(dataSetSize) && isEntitySet(dataSet) && (
                    <>
                      <CountBadge count={dataSetSize} max={1000000} />
                      <Label subtle>Records</Label>
                    </>
                  )
                }
              </div>
              {
                !!tags.size && (
                  <div>
                    <Chip label={tagLabel} />
                  </div>
                )
              }
            </StackGrid>
            {
              isNonEmptyString(description) && (
                <ReducedMargin>
                  <MarkdownPreview>{description}</MarkdownPreview>
                </ReducedMargin>
              )
            }
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
                contacts.map((contact :string) => {
                  if (isNonEmptyString(contact)) {
                    return (
                      <Typography key={contact}>{contact}</Typography>
                    );
                  }
                  return null;
                })
              }
              {
                !hasContactInfo && (
                  <Typography>No contact information is available.</Typography>
                )
              }
            </StackGrid>
            <FolderTabs
                aria-label="tabs"
                indicatorColor="primary"
                textColor="primary"
                value={location.pathname}>
              <FolderTab
                  component={Link}
                  to={dataSetRoute}
                  label="Properties"
                  value={dataSetRoute} />
              <FolderTab
                  component={Link}
                  to={dataSetDataRoute}
                  label="Search"
                  value={dataSetDataRoute} />
              <FolderTab
                  component={Link}
                  to={dataSetCollabRoute}
                  label={collabTabText}
                  value={dataSetCollabRoute} />
            </FolderTabs>
            <Switch>
              <Route
                  exact
                  path={Routes.ORG_DATA_SET_DATA}
                  render={() => (
                    <DataSetDataContainer
                        dataSetId={dataSetId}
                        dataSetName={title || name}
                        organizationId={organizationId} />
                  )} />
              <Route
                  exact
                  path={Routes.ORG_DATA_SET}
                  render={() => (
                    <DataSetMetadataContainer
                        dataSetId={dataSetId}
                        organizationId={organizationId} />
                  )} />
              <Route
                  exact
                  path={Routes.ORG_DATA_SET_COLLABORATIONS}
                  render={() => (
                    <CollaborationsParticipationContainer
                        collaborations={collaborationsByDataSetId}
                        type="data set" />
                  )} />
            </Switch>
          </StackGrid>
        </AppContentWrapper>
      </>
    );
  }

  return null;
};

export default OrgDataSetContainer;
