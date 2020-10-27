/*
 * @flow
 */

import React, { useState } from 'react';

import _capitalize from 'lodash/capitalize';
import _isFunction from 'lodash/isFunction';
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
import type { EntitySet, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { SearchDataSetsForm } from './components';

import {
  GridCardSegment,
  ModalBody,
  Spinner,
  StackGrid,
} from '../../components';
import { SEARCH } from '../../core/redux/constants';
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

const MAX_PER_PAGE = 10;

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

const DataSetPermissionsModal = ({
  onClose,
} :{|
  onClose :() => void;
|}) => {

  const dispatch = useDispatch();
  const [isPermissionAssignedToAll, setIsPermissionAssignedToAll] = useState(true);
  const [targetDataSetId, setTargetDataSetId] = useState('');
  const [targetDataSetTitle, setTargetDataSetTitle] = useState('');
  const [targetOptions, setTargetOptions] = useState([]);
  const [step, setStep] = useState(STEPS.SELECT_DATA_SET);

  const searchDataSetsRS :?RequestState = useRequestState([SEARCH, SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS]);

  const searchPage :number = useSelector(selectSearchPage(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
  const searchQuery :string = useSelector(selectSearchQuery(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
  const searchTotalHits :number = useSelector(selectSearchTotalHits(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
  const searchHits :Set<UUID> = useSelector(selectSearchHits(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));

  const pageAtlasDataSets :Map<UUID, Map> = useSelector(selectAtlasDataSets(searchHits));
  const pageEntitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets(searchHits));
  const pageDataSets :Map<UUID, EntitySet | Map> = Map().merge(pageAtlasDataSets).merge(pageEntitySets);

  const handleOnClose = () => {
    if (_isFunction(onClose)) {
      onClose();
    }
    // the timeout avoids rendering the modal with new state before the transition animation finishes
    setTimeout(() => {
      dispatch(clearSearchState(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
    }, 1000);
  };

  const dispatchDataSetSearch = (params :{ page ?:number, query ?:string, start ?:number } = {}) => {
    const { page = 0, query = searchQuery, start = 0 } = params;
    if (isNonEmptyString(query)) {
      dispatch(
        searchDataSetsToAssignPermissions({
          page,
          query,
          start,
          maxHits: MAX_PER_PAGE,
        })
      );
    }
    else {
      dispatch(clearSearchState(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
    }
    setTargetDataSetId('');
    setTargetDataSetTitle('');
  };

  const handleOnClickBack = () => {
    if (step !== STEPS.SELECT_DATA_SET) {
      setStep(step - 1);
    }
  };

  const handleOnChangeSelectDataSet = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const id = event.currentTarget.dataset.id;
    const title = event.currentTarget.dataset.title;
    setTargetDataSetId(id);
    setTargetDataSetTitle(title);
  };

  const handleOnClickContinue = () => {
    if (step !== STEPS.CONFIRM) {
      setStep(step + 1);
    }
  };

  const handleOnClickConfirm = () => {

  };

  let withFooter = (
    <ModalFooter
        onClickPrimary={handleOnClickContinue}
        onClickSecondary={handleOnClickBack}
        shouldStretchButtons
        textPrimary="Continue"
        textSecondary="Back" />
  );

  if (step === STEPS.SELECT_DATA_SET) {
    withFooter = (
      <ModalFooter
          shouldStretchButtons
          onClickPrimary={handleOnClickContinue}
          textPrimary="Continue"
          textSecondary="" />
    );
  }
  else if (step === STEPS.CONFIRM) {
    withFooter = (
      <ModalFooter
          onClickPrimary={handleOnClickConfirm}
          shouldStretchButtons
          textPrimary="Confirm"
          textSecondary="" />
    );
  }

  const selectedPermissionsJoined = targetOptions
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
            <StackGrid>
              <Typography>
                Search for a data set to assign permissions.
              </Typography>
              <SearchDataSetsForm
                  onSubmit={(query :string) => dispatchDataSetSearch({ query })}
                  searchRequestState={searchDataSetsRS} />
              {
                searchDataSetsRS !== RequestStates.STANDBY && (
                  <PaginationToolbar
                      count={searchTotalHits}
                      onPageChange={({ page, start }) => dispatchDataSetSearch({ page, start })}
                      page={searchPage}
                      rowsPerPage={MAX_PER_PAGE} />
                )
              }
              {
                searchDataSetsRS === RequestStates.PENDING && (
                  <Spinner />
                )
              }
              {
                searchDataSetsRS === RequestStates.SUCCESS && !pageDataSets.isEmpty() && (
                  <div>
                    {
                      pageDataSets.valueSeq().map((dataSet :EntitySet | Map) => {
                        const id :UUID = dataSet.id || getIn(dataSet, ['table', 'id']);
                        const title :UUID = dataSet.title || getIn(dataSet, ['table', 'title']);
                        return (
                          <GridCardSegment key={id} padding="0">
                            <div>
                              <Typography>{title}</Typography>
                              <Typography variant="caption">{id}</Typography>
                            </div>
                            <Radio
                                checked={targetDataSetId === id}
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
        {
          step === STEPS.SELECT_PERMISSIONS && (
            <StackGrid>
              <Typography>
                {`Select permissions to assign to "${targetDataSetTitle}".`}
              </Typography>
              <Select
                  isMulti
                  onChange={(options) => setTargetOptions(options)}
                  options={PERMISSIONS_OPTIONS}
                  value={targetOptions} />
            </StackGrid>
          )
        }
        {
          step === STEPS.SELECT_PROPERTIES && (
            <StackGrid>
              <Typography>
                {`You have selected to assign ${selectedPermissionsJoined} to "${targetDataSetTitle}".`}
              </Typography>
              <Typography>
                You can assign permissions to either the data set and all properties, or just the data set itself.
                Permissions on individual properties can be assigned later.
              </Typography>
              <GridCardSegment padding="8px 0">
                <Typography variant="body1">
                  {`Assign ${selectedPermissionsJoined} to all properties:`}
                </Typography>
                <IconButton
                    aria-label="permissions toggle for all properties"
                    onClick={() => setIsPermissionAssignedToAll(!isPermissionAssignedToAll)}>
                  <FontAwesomeIcon
                      color={isPermissionAssignedToAll ? PURPLE.P300 : NEUTRAL.N500}
                      fixedWidth
                      icon={faToggleOn}
                      transform={{ rotate: isPermissionAssignedToAll ? 0 : 180 }}
                      size="lg" />
                </IconButton>
              </GridCardSegment>
            </StackGrid>
          )
        }
      </ModalBody>
    </Modal>
  );
};

export default DataSetPermissionsModal;
