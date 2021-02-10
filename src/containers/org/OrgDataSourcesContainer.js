/*
 * @flow
 */

import React, { useEffect, useReducer, useState } from 'react';

import {
  List,
  Map,
  Set,
  get,
} from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  AppContentWrapper,
  CardSegment,
  PaginationToolbar,
  SearchInput,
  Typography,
} from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';

import { OrgDataSourceModal } from './components';

import {
  ActionsGrid,
  CrumbItem,
  CrumbLink,
  Crumbs,
  PlusButton,
  StackGrid,
} from '../../components';
import {
  selectMyKeys,
  selectOrganization,
  selectOrganizationDataSources,
} from '../../core/redux/selectors';
import {
  FILTER,
  INITIAL_PAGINATION_STATE,
  PAGE,
  paginationReducer,
} from '../../utils/stateReducers/pagination';

const MAX_PER_PAGE = 20;

const { getOrganizationDataSources } = OrganizationsApiActions;

const OrgDataSourcesContainer = ({
  organizationId,
  organizationRoute,
} :{|
  organizationId :UUID;
  organizationRoute :string;
|}) => {

  const dispatch = useDispatch();
  const [paginationState, paginationDispatch] = useReducer(paginationReducer, INITIAL_PAGINATION_STATE);
  const [isVisibleOrgDataSourceModal, setIsVisibleOrgDataSourceModal] = useState(false);
  const [targetDataSource, setTargetDataSource] = useState(Map());

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const dataSources :Map<UUID, Map> = useSelector(selectOrganizationDataSources(organizationId));
  const myKeys :Set<List<UUID>> = useSelector(selectMyKeys());
  const isOwner :boolean = myKeys.has(List([organizationId]));

  useEffect(() => {
    dispatch(getOrganizationDataSources(organizationId));
  }, [dispatch, organizationId]);

  if (organization) {

    let filteredDataSources :Map<UUID, Map> = dataSources;
    if (paginationState.query) {
      filteredDataSources = filteredDataSources.filter((dataSource :Map) => (
        get(dataSource, 'name', '').toLowerCase().includes(paginationState.query.toLowerCase())
      ));
    }

    const pageDataSources = filteredDataSources.slice(paginationState.start, paginationState.start + MAX_PER_PAGE);

    const handleOnChangeFilterQuery = (event :SyntheticInputEvent<HTMLInputElement>) => {
      paginationDispatch({ type: FILTER, query: event.target.value || '' });
    };

    const handleOnPageChange = ({ page, start }) => {
      paginationDispatch({ type: PAGE, page, start });
    };

    const openOrgDataSourceModal = (dataSource :Map) => {
      setTargetDataSource(dataSource);
      setIsVisibleOrgDataSourceModal(true);
    };

    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbItem>Data Sources</CrumbItem>
        </Crumbs>
        <StackGrid gap={24}>
          <StackGrid>
            <Typography variant="h1">Data Sources</Typography>
            <Typography>Manage organization data sources.</Typography>
          </StackGrid>
          <ActionsGrid>
            <SearchInput onChange={handleOnChangeFilterQuery} placeholder="Filter data sources" />
            {
              isOwner && (
                <PlusButton
                    aria-label="add data source"
                    isDisabled={!isOwner}
                    onClick={() => openOrgDataSourceModal(Map())}>
                  <Typography component="span">Add Data Source</Typography>
                </PlusButton>
              )
            }
          </ActionsGrid>
          <div>
            {
              filteredDataSources.count() > MAX_PER_PAGE && (
                <PaginationToolbar
                    count={filteredDataSources.count()}
                    onPageChange={handleOnPageChange}
                    page={paginationState.page}
                    rowsPerPage={MAX_PER_PAGE} />
              )
            }
            {
              pageDataSources.valueSeq().map((dataSource :Map) => {
                const name = get(dataSource, 'name', '');
                return (
                  <CardSegment key={name} onClick={() => openOrgDataSourceModal(dataSource)} padding="24px 0">
                    <Typography component="span">{name}</Typography>
                  </CardSegment>
                );
              })
            }
          </div>
        </StackGrid>
        {
          isOwner && (
            <OrgDataSourceModal
                dataSource={targetDataSource}
                isVisible={isVisibleOrgDataSourceModal}
                onClose={() => setIsVisibleOrgDataSourceModal(false)}
                organizationId={organizationId} />
          )
        }
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgDataSourcesContainer;
