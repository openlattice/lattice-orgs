/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { List, Map } from 'immutable';
import { Modal, Select, Typography } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState, useStepState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import SearchOrgDataSetsContainer from '../../org/components/dataset/SearchOrgDataSetsContainer';
import StyledFooter from '../../org/components/styled/StyledFooter';
import { ModalBody, ResetOnUnmount, StackGrid } from '../../../components';
import { COLLABORATIONS } from '../../../core/redux/constants';
import { selectOrganizations } from '../../../core/redux/selectors';
import { ADD_DATA_SETS_TO_COLLABORATION, addDataSetsToCollaboration } from '../actions';
import type { ReactSelectOption } from '../../../types';

const { isPending, isStandby, isSuccess } = ReduxUtils;

const RESET_ACTIONS = [ADD_DATA_SETS_TO_COLLABORATION];

const AddDataSetToCollaborationModalBody = ({
  collaborationId,
  existingDataSets,
  isVisible,
  onClose,
  organizationIds,
  ...rest
} :{
  collaborationId :UUID;
  existingDataSets :List;
  isVisible :boolean;
  onClose :() => void;
  organizationIds :List<UUID>;
}) => {
  const dispatch = useDispatch();
  const [modalTitle, setModalTitle] = useState(<Typography variant="h3">Select Organization</Typography>);
  const [step, stepBack, stepNext, setStep] = useStepState(3);
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [selectedDataSets, setSelectedDataSets] = useState(List());
  const [selectedDataSetTitles, setSelectedDataSetTitles] = useState(List());
  const addDataSetToCollaborationRS :?RequestState = useRequestState([COLLABORATIONS, ADD_DATA_SETS_TO_COLLABORATION]);

  const organizations :Map<UUID, Organization> = useSelector(selectOrganizations());

  const pending = isPending(addDataSetToCollaborationRS);
  const standby = isStandby(addDataSetToCollaborationRS);
  const success = isSuccess(addDataSetToCollaborationRS);

  const orgOptions = organizationIds.filter((orgId) => organizations.has(orgId))
    .map((orgId) => {
      const organization = organizations.get(orgId);
      const label = organization.title;
      const value = organization.id;
      return { label, value };
    }).toJS();

  useEffect(() => {
    if (step === 0) {
      setModalTitle(<Typography variant="h3">Select Organization</Typography>);
    }
    else if (step === 1) {
      setModalTitle(<Typography variant="h3">Add Data Sets</Typography>);
    }
    else if (standby && step === 2) {
      setModalTitle(<Typography variant="h3">Add these data sets?</Typography>);
    }
    else if (success && step === 2) {
      setModalTitle(<Typography variant="h3">Data Sets Added!</Typography>);
    }
  }, [setModalTitle, standby, step, success]);

  const handleOrgSelect = (organizationOption :ReactSelectOption<Object>) => {
    setSelectedOrganization(organizationOption.value);
  };

  const closeModal = () => {
    onClose();
    setStep(0);
  };

  const handleOnClickPrimary = () => {
    dispatch(
      addDataSetsToCollaboration({
        collaborationId,
        dataSetIdsByOrgId: Map({
          [selectedOrganization]: selectedDataSets
        })
      })
    );
  };

  return (
    <Modal
      // eslint-disable-next-line
        {...rest}
        isVisible={isVisible}
        onClose={closeModal}
        textTitle={modalTitle}>
      {
        step === 0 && (
          <>
            <ModalBody>
              <StackGrid gap={16}>
                <Typography gutterBottom htmlFor="selectOrganization">
                  Which organization would you like to add a dataset from?
                </Typography>
                <Select
                    id="select organization"
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (provided) => ({ ...provided, zIndex: 9999 }) }}
                    onChange={handleOrgSelect}
                    options={orgOptions}
                    placeholder="select organization" />
              </StackGrid>
            </ModalBody>
            <StyledFooter
                isDisabledPrimary={!selectedOrganization}
                onClickPrimary={stepNext}
                textPrimary="Next: Select Data Sets" />
          </>
        )
      }
      {
        step === 1 && (
          <>
            <ModalBody>
              <StackGrid gap={16}>
                <Typography gutterBottom>Search and select data set(s) to add to this collaboration.</Typography>
                <SearchOrgDataSetsContainer
                    excludedDataSets={existingDataSets}
                    organizationId={selectedOrganization}
                    ownerRequired
                    setTargetDataSetIds={setSelectedDataSets}
                    setTargetDataSetTitles={setSelectedDataSetTitles}
                    targetDataSetIds={selectedDataSets}
                    targetDataSetTitles={selectedDataSetTitles} />
              </StackGrid>
            </ModalBody>
            <StyledFooter
                isDisabledPrimary={!selectedDataSets.size}
                onClickPrimary={stepNext}
                textPrimary="Next: Review Selection" />

          </>
        )
      }
      {
        step === 2 && (
          <>
            <ModalBody>
              <ResetOnUnmount actions={RESET_ACTIONS}>
                <StackGrid gap={16}>
                  {
                    success
                      ? (
                        <>
                          <Typography>
                            {`${selectedDataSetTitles.size} data set(s) successfully added to collaboration.`}
                          </Typography>
                        </>
                      )
                      : (
                        <>
                          <ol>
                            {
                              selectedDataSetTitles.map((title) => <li>{title}</li>)
                            }
                          </ol>
                        </>
                      )
                  }
                </StackGrid>
              </ResetOnUnmount>
            </ModalBody>
            <StyledFooter
                isPendingPrimary={pending}
                onClickPrimary={success ? onClose : handleOnClickPrimary}
                onClickSecondary={stepBack}
                shouldStretchButtons
                textPrimary={success ? 'Close' : 'Add DataSets'}
                textSecondary={success ? '' : 'Change Selection'} />
          </>
        )
      }
    </Modal>
  );
};

export default AddDataSetToCollaborationModalBody;
