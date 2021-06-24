/*
 * @flow
 */

import React, { useEffect } from 'react';

import { List, Map } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import {
  AppContentWrapper,
  Typography,
} from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';
import { COLLABORATIONS } from '../../core/redux/constants';
import {
  ActionsGrid,
  SearchButton,
  MinusButton,
  PlusButton,
  StackGrid,
} from '../../components';
import {
  selectUsersCollaborations,
  selectCollaborationDatabaseDetails,
  selectCollaborationDataSetMap
} from '../../core/redux/selectors';
import {
  CREATE_NEW_COLLABORATION,
  GET_DATA_SETS_IN_COLLABORATION,
  createNewCollaboration,
  getDataSetsInCollaboration,
} from './actions';

const { isPending, isStandby } = ReduxUtils;
const {
  ADD_DATA_SET_TO_COLLABORATION,
  ADD_ORGANIZATIONS_TO_COLLABORATION,
  DELETE_COLLABORATION,
  GET_COLLABORATIONS,
  GET_COLLABORATION_DATABASE_INFO,
  REMOVE_DATA_SET_FROM_COLLABORATION,
  REMOVE_ORGANIZATIONS_FROM_COLLABORATION,
  RENAME_COLLABORATION_DATABASE,
  addDataSetToCollaboration,
  addOrganizationsToCollaboration,
  deleteCollaboration,
  getCollaborationDatabaseInfo,
  getCollaborations,
  removeDataSetFromCollaboration,
  removeOrganizationsFromCollaboration,
  renameCollaborationDatabase
} = CollaborationsApiActions;

const OrgsContainer = () => {

  // const [isVisibleAddCollaborationModal, setIsVisibleCreateCollaborationModal] = useState(false);
  const dispatch = useDispatch();

  const addDataSetToCollaborationRS :?RequestState = useRequestState([COLLABORATIONS, ADD_DATA_SET_TO_COLLABORATION]);
  const addOrganizationToCollaborationRS :?RequestState = useRequestState(
    [COLLABORATIONS, ADD_ORGANIZATIONS_TO_COLLABORATION]
  );
  const createNewCollaborationsRS :?RequestState = useRequestState([COLLABORATIONS, CREATE_NEW_COLLABORATION]);
  const deleteCollaborationsRS :?RequestState = useRequestState([COLLABORATIONS, DELETE_COLLABORATION]);
  const getCollaborationDatabaseInfoRS :?RequestState = useRequestState(
    [COLLABORATIONS, GET_COLLABORATION_DATABASE_INFO]
  );
  const getCollaborationsRS :?RequestState = useRequestState([COLLABORATIONS, GET_COLLABORATIONS]);
  const getDataSetsInCollaborationRS :?RequestState = useRequestState([COLLABORATIONS, GET_DATA_SETS_IN_COLLABORATION]);
  const removeDataSetFromCollaborationRS :?RequestState = useRequestState([
    COLLABORATIONS, REMOVE_DATA_SET_FROM_COLLABORATION
  ]);
  const removeOrgFromCollaborationsRS :?RequestState = useRequestState([
    COLLABORATIONS, REMOVE_ORGANIZATIONS_FROM_COLLABORATION
  ]);
  const renameCollaborationDatabaseRS :?RequestState = useRequestState([
    COLLABORATIONS, RENAME_COLLABORATION_DATABASE
  ]);

  useEffect(() => {
    if (isStandby(getCollaborationsRS)) {
      dispatch(getCollaborations());
    }
  }, [dispatch, getCollaborationsRS]);

  const createCollaboration = () => dispatch(
    createNewCollaboration({
      name: 'The Best Collaboration Name',
      organizationIds: ['e2c33ae5-9142-47b1-bc8d-cc4275f67871', 'e10fcb81-9854-4869-8db7-39ddcd65c646'],
      title: 'The Best Collaboration Title'
    })
  );
  const deleteExistingCollaboration = () => dispatch(
    deleteCollaboration('8b5dd6de-e4e3-4379-a5e8-f52b346bb96c')
  );
  const addOrgToCollaboration = () => dispatch(
    addOrganizationsToCollaboration({
      organizationIds: ['dafdc075-420a-44fb-afd2-6d605dff1ee2'],
      collaborationId: '3377ce08-f9eb-451d-92d7-c65e0d5ccb82'
    })
  );
  const removeOrgFromCollaboration = () => dispatch(
    removeOrganizationsFromCollaboration({
      organizationIds: ['dafdc075-420a-44fb-afd2-6d605dff1ee2'],
      collaborationId: '3377ce08-f9eb-451d-92d7-c65e0d5ccb82'
    })
  );
  const getDataSets = () => dispatch(
    getDataSetsInCollaboration('b0097c24-7ba8-4d06-ac21-e6713903e922')
  );
  const addDataSet = () => dispatch(
    addDataSetToCollaboration({
      collaborationId: 'b0097c24-7ba8-4d06-ac21-e6713903e922',
      dataSetId: '26a76dbf-cf2a-43b2-a497-f5f7880a8f73',
      organizationId: 'e2c33ae5-9142-47b1-bc8d-cc4275f67871'
    })
  );
  const removeDataSet = () => dispatch(
    removeDataSetFromCollaboration({
      collaborationId: 'b0097c24-7ba8-4d06-ac21-e6713903e922',
      dataSetId: '26a76dbf-cf2a-43b2-a497-f5f7880a8f73',
      organizationId: 'e2c33ae5-9142-47b1-bc8d-cc4275f67871'
    })
  );
  const renameCollaboration = () => dispatch(
    renameCollaborationDatabase({
      collaborationId: 'b0097c24-7ba8-4d06-ac21-e6713903e922',
      name: 'The Best Collaboration Name - Now changed',
    })
  );
  const getCollaborationDetails = () => dispatch(
    getCollaborationDatabaseInfo('b0097c24-7ba8-4d06-ac21-e6713903e922')
  );

  const collaborations :Map<UUID, Map> = useSelector(selectUsersCollaborations());
  const collaborationDatabaseInfo :Map<UUID, Map> = useSelector(
    selectCollaborationDatabaseDetails('b0097c24-7ba8-4d06-ac21-e6713903e922')
  );
  const collaborationDataSetMap :Map<UUID, List<UUID>> = useSelector(
    selectCollaborationDataSetMap('b0097c24-7ba8-4d06-ac21-e6713903e922')
  );

  console.log('collaborations');
  console.log(collaborations.toJS());
  console.log('renameCollaborationDatabaseRS');
  console.log(renameCollaborationDatabaseRS);
  // console.log('addDataSetToCollaborationRS');
  // console.log(addDataSetToCollaborationRS);
  // console.log('collaborationDataSetMap');
  // console.log(collaborationDataSetMap.toJS());
  // console.log('removeDataSetFromCollaborationsRS');
  // console.log(removeDataSetFromCollaborationRS);

  return (
    <>
      <AppContentWrapper>
        <StackGrid gap={32}>
          <StackGrid>
            <Typography variant="h1">Collaborations</Typography>
          </StackGrid>
          <ActionsGrid>
            <PlusButton
                aria-label="create collaboration"
                isPending={isPending(createNewCollaborationsRS)}
                onClick={createCollaboration}>
              <Typography component="span">Create Collaboration</Typography>
            </PlusButton>
            <MinusButton
                aria-label="delete collaboration"
                isPending={isPending(deleteCollaborationsRS)}
                onClick={deleteExistingCollaboration}>
              <Typography component="span">Delete Collaboration</Typography>
            </MinusButton>
          </ActionsGrid>
          <ActionsGrid>
            <PlusButton
                aria-label="add org to collaboration"
                isPending={isPending(addOrganizationToCollaborationRS)}
                onClick={addOrgToCollaboration}>
              <Typography component="span">Add Org To Collaboration</Typography>
            </PlusButton>
            <MinusButton
                aria-label="remove orgs from collaboration"
                isPending={isPending(removeOrgFromCollaborationsRS)}
                onClick={removeOrgFromCollaboration}>
              <Typography component="span">Remove Org From Collaboration</Typography>
            </MinusButton>
          </ActionsGrid>
          <ActionsGrid>
            <SearchButton
                aria-label="get datasets collaboration"
                isPending={isPending(getDataSetsInCollaborationRS)}
                onClick={getDataSets}>
              <Typography component="span">Get DataSets</Typography>
            </SearchButton>
            <PlusButton
                aria-label="add dataset to collaboration"
                isPending={isPending(addDataSetToCollaborationRS)}
                onClick={addDataSet}>
              <Typography component="span">Add DataSet To Collaboration</Typography>
            </PlusButton>
            <MinusButton
                aria-label="remove dataset to collaboration"
                isPending={isPending(removeDataSetFromCollaborationRS)}
                onClick={removeDataSet}>
              <Typography component="span">Remove DataSet From Collaboration</Typography>
            </MinusButton>
          </ActionsGrid>
          <ActionsGrid>
            <SearchButton
                aria-label="get collaboration info"
                isPending={isPending(getCollaborationDatabaseInfoRS)}
                onClick={getCollaborationDetails}>
              <Typography component="span">Get Collaboration Details</Typography>
            </SearchButton>
          </ActionsGrid>
          <ActionsGrid>
            <SearchButton
                aria-label="rename collaboration"
                isPending={isPending(renameCollaborationDatabaseRS)}
                onClick={renameCollaboration}>
              <Typography component="span">Rename Collaboration</Typography>
            </SearchButton>
          </ActionsGrid>
        </StackGrid>
      </AppContentWrapper>
      {
        // isVisibleAddCollaborationModal && (
        //   <CreateOrgModal onClose={() => setIsVisibleCreateCollaborationModal(false)} />
        // )
      }
    </>
  );
};

export default OrgsContainer;
