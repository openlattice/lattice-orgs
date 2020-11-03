/*
 * @flow
 */

import React, { useState } from 'react';

import _capitalize from 'lodash/capitalize';
import _isFunction from 'lodash/isFunction';
import styled from 'styled-components';
import { faToggleOn } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map, Set, getIn } from 'immutable';
import { Types } from 'lattice';
import {
  Colors,
  IconButton,
  Modal,
  ModalFooter,
  PaginationToolbar,
  Radio,
  Select,
  Typography,
} from 'lattice-ui-kit';
import { LangUtils, ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { EntitySet, Principal, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  BasicErrorComponent,
  DataSetTitle,
  GridCardSegment,
  ModalBody,
  SearchForm,
  Spinner,
  StackGrid,
} from '../../components';
import { ASSIGN_PERMISSIONS_TO_DATA_SET, assignPermissionsToDataSet } from '../../core/permissions/actions';
import { resetRequestState } from '../../core/redux/actions';
import {
  ATLAS_DATA_SET_IDS,
  ENTITY_SET_IDS,
  PERMISSIONS,
  SEARCH,
} from '../../core/redux/constants';
import {
  selectAtlasDataSets,
  selectSearchHits,
  selectSearchPage,
  selectSearchQuery,
  selectSearchTotalHits,
} from '../../core/redux/selectors';
import {
  SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS,
  clearSearchState,
  searchDataSetsToAssignPermissions,
} from '../../core/search/actions';
import type { ReactSelectOption } from '../../types';

const { NEUTRAL, PURPLE } = Colors;
const { PermissionTypes } = Types;
const { isNonEmptyString } = LangUtils;
const { selectEntitySets } = ReduxUtils;

const MAX_PER_PAGE = 5;

const STEPS = {
  SELECT_DATA_SET: 0,
  SELECT_PERMISSIONS: 1,
  SELECT_PROPERTIES: 2,
  CONFIRM: 3,
};

const MODAL_TITLES = {
  [STEPS.SELECT_DATA_SET]: 'Add Data Set',
  [STEPS.SELECT_PERMISSIONS]: 'Select Permissions',
  [STEPS.SELECT_PROPERTIES]: 'Select Properties',
  [STEPS.CONFIRM]: 'Confirm',
};

const PERMISSIONS_OPTIONS = [
  { label: _capitalize(PermissionTypes.OWNER), value: PermissionTypes.OWNER },
  { label: _capitalize(PermissionTypes.READ), value: PermissionTypes.READ },
  { label: _capitalize(PermissionTypes.WRITE), value: PermissionTypes.WRITE },
  { label: _capitalize(PermissionTypes.LINK), value: PermissionTypes.LINK },
  { label: _capitalize(PermissionTypes.MATERIALIZE), value: PermissionTypes.MATERIALIZE },
];

const PaginationWrapper = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 1fr auto;
`;

const DataSetPermissionsModal = ({
  onClose,
  organizationId,
  principal,
} :{|
  onClose :() => void;
  organizationId :UUID;
  principal :Principal;
|}) => {

  const dispatch = useDispatch();
  const [assignToAll, setAssignToAll] = useState(true);
  const [targetId, setTargetId] = useState('');
  const [targetTitle, setTargetTitle] = useState('');
  const [targetOptions, setTargetOptions] = useState([]);
  const [step, setStep] = useState(STEPS.SELECT_DATA_SET);

  const assignPermissionsToDataSetRS :?RequestState = useRequestState([PERMISSIONS, ASSIGN_PERMISSIONS_TO_DATA_SET]);
  const searchDataSetsRS :?RequestState = useRequestState([SEARCH, SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS]);

  const searchPage :number = useSelector(selectSearchPage(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
  const searchQuery :string = useSelector(selectSearchQuery(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
  const searchTotalHits :Map = useSelector(selectSearchTotalHits(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
  const searchHits :Map = useSelector(selectSearchHits(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));

  const atlasDataSetIds :Set<UUID> = searchHits.get(ATLAS_DATA_SET_IDS, Set());
  const entitySetIds :Set<UUID> = searchHits.get(ENTITY_SET_IDS, Set());
  const pageAtlasDataSets :Map<UUID, Map> = useSelector(selectAtlasDataSets(atlasDataSetIds));
  const pageEntitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets(entitySetIds));

  const handleOnClose = () => {
    if (_isFunction(onClose)) {
      onClose();
    }
    // the timeout avoids rendering the modal with new state before the transition animation finishes
    setTimeout(() => {
      dispatch(clearSearchState(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
      dispatch(resetRequestState([ASSIGN_PERMISSIONS_TO_DATA_SET]));
    }, 1000);
  };

  const dispatchDataSetSearch = (params :{ page ?:number, query ?:string, start ?:number } = {}) => {
    const { page = 0, query = searchQuery, start = 0 } = params;
    if (isNonEmptyString(query)) {
      dispatch(
        searchDataSetsToAssignPermissions({
          organizationId,
          page,
          query,
          start,
          all: true,
          maxHits: MAX_PER_PAGE,
        })
      );
    }
    else {
      dispatch(clearSearchState(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
    }
  };

  const handleOnClickBack = () => {
    if (step !== STEPS.SELECT_DATA_SET) {
      setStep(step - 1);
    }
  };

  const handleOnChangeSelectDataSet = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const id = event.currentTarget.dataset.id;
    const title = event.currentTarget.dataset.title;
    setTargetId(id);
    setTargetTitle(title);
  };

  const handleOnChangeSelectPermissions = (options :?ReactSelectOption[]) => {
    if (!options) {
      setTargetOptions([]);
    }
    else {
      setTargetOptions(options);
    }
  };

  const handleOnClickContinue = () => {
    if (step === STEPS.CONFIRM) {
      dispatch(
        assignPermissionsToDataSet({
          principal,
          dataSetId: targetId,
          permissionTypes: targetOptions.map((o) => o.value),
          withProperties: assignToAll,
        })
      );
    }
    else {
      setStep(step + 1);
    }
  };

  let onClickPrimary = handleOnClickContinue;
  let textPrimary = step === STEPS.CONFIRM ? 'Confirm' : 'Continue';
  let textSecondary = step === STEPS.SELECT_DATA_SET ? '' : 'Back';
  if (step === STEPS.CONFIRM && assignPermissionsToDataSetRS === RequestStates.SUCCESS) {
    textPrimary = 'Close';
    textSecondary = '';
    onClickPrimary = handleOnClose;
  }

  const withFooter = (
    <ModalFooter
        isPendingPrimary={step === STEPS.CONFIRM && assignPermissionsToDataSetRS === RequestStates.PENDING}
        onClickPrimary={onClickPrimary}
        onClickSecondary={handleOnClickBack}
        shouldStretchButtons
        textPrimary={textPrimary}
        textSecondary={textSecondary} />
  );

  const permissions = targetOptions
    .map((o :ReactSelectOption) => (o.value :any))
    .map(_capitalize)
    .join(', ');

  return (
    <Modal
        isVisible
        onClose={handleOnClose}
        shouldCloseOnOutsideClick={false}
        shouldStretchButtons
        textTitle={MODAL_TITLES[step]}
        viewportScrolling
        withFooter={withFooter}>
      <ModalBody>
        {
          step === STEPS.SELECT_DATA_SET && (
            <StackGrid gap={32}>
              <StackGrid>
                <Typography>
                  Search for a data set to assign permissions.
                </Typography>
                <SearchForm
                    onSubmit={(query :string) => dispatchDataSetSearch({ query })}
                    searchRequestState={searchDataSetsRS} />
              </StackGrid>
              {
                searchDataSetsRS === RequestStates.PENDING && (
                  <Spinner />
                )
              }
              {
                searchDataSetsRS === RequestStates.SUCCESS && (
                  <StackGrid>
                    <PaginationWrapper>
                      <Typography variant="h4">Entity Sets</Typography>
                      <PaginationToolbar
                          count={searchTotalHits.get(ENTITY_SET_IDS)}
                          onPageChange={({ page, start }) => dispatchDataSetSearch({ page, start })}
                          page={searchPage}
                          rowsPerPage={MAX_PER_PAGE} />
                    </PaginationWrapper>
                    {
                      !pageEntitySets.isEmpty() && (
                        <div>
                          {
                            pageEntitySets.valueSeq().map((dataSet :EntitySet) => (
                              <GridCardSegment key={dataSet.id} padding="8px 0">
                                <div>
                                  <DataSetTitle isAtlasDataSet={false}>{dataSet.title || dataSet.name}</DataSetTitle>
                                  <Typography variant="caption">{dataSet.id}</Typography>
                                </div>
                                <Radio
                                    checked={targetId === dataSet.id}
                                    data-id={dataSet.id}
                                    data-title={dataSet.title}
                                    name="select-data-set"
                                    onChange={handleOnChangeSelectDataSet} />
                              </GridCardSegment>
                            ))
                          }
                        </div>
                      )
                    }
                  </StackGrid>
                )
              }
              {
                searchDataSetsRS === RequestStates.SUCCESS && (
                  <StackGrid>
                    <PaginationWrapper>
                      <Typography variant="h4">Atlas Data Sets</Typography>
                      <PaginationToolbar
                          count={searchTotalHits.get(ATLAS_DATA_SET_IDS)}
                          onPageChange={({ page, start }) => dispatchDataSetSearch({ page, start })}
                          page={searchPage}
                          rowsPerPage={MAX_PER_PAGE} />
                    </PaginationWrapper>
                    {
                      !pageAtlasDataSets.isEmpty() && (
                        <div>
                          {
                            pageAtlasDataSets.valueSeq().map((dataSet :EntitySet | Map) => {
                              const id :UUID = getIn(dataSet, ['table', 'id']);
                              const name :string = getIn(dataSet, ['table', 'name']);
                              const title :UUID = getIn(dataSet, ['table', 'title']);
                              return (
                                <GridCardSegment key={id} padding="8px 0">
                                  <div>
                                    <DataSetTitle isAtlasDataSet>{title || name}</DataSetTitle>
                                    <Typography variant="caption">{id}</Typography>
                                  </div>
                                  <Radio
                                      checked={targetId === id}
                                      data-id={id}
                                      data-title={title}
                                      name="select-data-set"
                                      onChange={handleOnChangeSelectDataSet} />
                                </GridCardSegment>
                              );
                            })
                          }
                        </div>
                      )
                    }
                  </StackGrid>
                )
              }
            </StackGrid>
          )
        }
        {
          step === STEPS.SELECT_PERMISSIONS && (
            <StackGrid>
              <Typography>
                {`Select permissions to assign to "${targetTitle}".`}
              </Typography>
              <Select
                  isMulti
                  onChange={handleOnChangeSelectPermissions}
                  options={PERMISSIONS_OPTIONS}
                  value={targetOptions} />
            </StackGrid>
          )
        }
        {
          step === STEPS.SELECT_PROPERTIES && (
            <StackGrid>
              <Typography>
                {`You have selected to assign ${permissions} to "${targetTitle}".`}
              </Typography>
              <Typography>
                You can assign permissions to either the data set and all properties, or just the data set itself.
                Permissions on individual properties can be assigned later.
              </Typography>
              <GridCardSegment padding="0">
                <Typography variant="body1">
                  {`Assign ${permissions} to all properties:`}
                </Typography>
                <IconButton
                    aria-label="permissions toggle for all properties"
                    onClick={() => setAssignToAll(!assignToAll)}>
                  <FontAwesomeIcon
                      color={assignToAll ? PURPLE.P300 : NEUTRAL.N500}
                      fixedWidth
                      icon={faToggleOn}
                      transform={{ rotate: assignToAll ? 0 : 180 }}
                      size="lg" />
                </IconButton>
              </GridCardSegment>
            </StackGrid>
          )
        }
        {
          step === STEPS.CONFIRM && assignPermissionsToDataSetRS === RequestStates.STANDBY && (
            <StackGrid>
              {
                assignToAll
                  ? (
                    <Typography>
                      {`Please confirm you want to assign ${permissions} to "${targetTitle}" and all its properties.`}
                    </Typography>
                  )
                  : (
                    <Typography>
                      {`Please confirm you want to assign ${permissions} to "${targetTitle}".`}
                    </Typography>
                  )
              }
            </StackGrid>
          )
        }
        {
          step === STEPS.CONFIRM && assignPermissionsToDataSetRS === RequestStates.SUCCESS && (
            <Typography>Success!</Typography>
          )
        }
        {
          step === STEPS.CONFIRM && assignPermissionsToDataSetRS === RequestStates.FAILURE && (
            <BasicErrorComponent />
          )
        }
      </ModalBody>
    </Modal>
  );
};

export default DataSetPermissionsModal;
