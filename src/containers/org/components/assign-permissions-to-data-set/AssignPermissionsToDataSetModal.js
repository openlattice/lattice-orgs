/*
 * @flow
 */

import React, { useCallback, useState } from 'react';

import styled from 'styled-components';
import {
  ModalFooter as LUKModalFooter,
  ModalHeader as LUKModalHeader,
} from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Principal, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import StepConfirm from './StepConfirm';
import StepSelectDataSet from './StepSelectDataSet';
import StepSelectPermissions from './StepSelectPermissions';
import StepSelectProperties from './StepSelectProperties';

import { ModalBody } from '../../../../components';
import { ASSIGN_PERMISSIONS_TO_DATA_SET, assignPermissionsToDataSet } from '../../../../core/permissions/actions';
import { resetRequestState } from '../../../../core/redux/actions';
import { PERMISSIONS } from '../../../../core/redux/constants';
import { SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS, clearSearchState } from '../../../../core/search/actions';

const ModalHeader = styled(LUKModalHeader)`
  padding: 30px 0;
`;

const ModalFooter = styled(LUKModalFooter)`
  padding: 30px 0;
`;

const AssignPermissionsToDataSetModal = ({
  onClose,
  organizationId,
  principal,
  step,
  stepBack,
  stepNext,
} :{
  onClose :() => void;
  organizationId :UUID;
  principal :Principal;
  step :number;
  stepBack :() => void;
  stepNext :() => void;
}) => {

  const dispatch = useDispatch();

  const [assignPermissionsToAllProperties, setAssignPermissionsToAllProperties] = useState(true);
  const [targetDataSetId, setTargetDataSetId] = useState('');
  const [targetDataSetTitle, setTargetDataSetTitle] = useState('');
  const [targetPermissionOptions, setTargetPermissionOptions] = useState([]);

  const assignPermissionsToDataSetRS :?RequestState = useRequestState([PERMISSIONS, ASSIGN_PERMISSIONS_TO_DATA_SET]);

  const onCleanUp = useCallback(() => {
    dispatch(clearSearchState(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
    dispatch(resetRequestState([ASSIGN_PERMISSIONS_TO_DATA_SET]));
  }, [dispatch]);

  const onConfirm = () => {
    dispatch(
      assignPermissionsToDataSet({
        principal,
        dataSetId: targetDataSetId,
        permissionTypes: targetPermissionOptions.map((option) => option.value),
        withProperties: assignPermissionsToAllProperties,
      })
    );
  };

  if (step === 0) {
    return (
      <>
        <ModalHeader onClickClose={onClose} textTitle="Assign Permissions To Data Set" />
        <ModalBody onCleanUp={onCleanUp}>
          <StepSelectDataSet
              organizationId={organizationId}
              setTargetDataSetId={setTargetDataSetId}
              setTargetDataSetTitle={setTargetDataSetTitle}
              targetDataSetId={targetDataSetId} />
        </ModalBody>
        <ModalFooter
            onClickPrimary={stepNext}
            onClickSecondary={stepBack}
            shouldStretchButtons
            textPrimary="Continue"
            textSecondary="" />
      </>
    );
  }

  if (step === 1) {
    return (
      <>
        <ModalHeader onClickClose={onClose} textTitle="Assign Permissions To Data Set" />
        <ModalBody onCleanUp={onCleanUp}>
          <StepSelectPermissions
              setTargetPermissionOptions={setTargetPermissionOptions}
              targetDataSetTitle={targetDataSetTitle}
              targetPermissionOptions={targetPermissionOptions} />
        </ModalBody>
        <ModalFooter
            onClickPrimary={stepNext}
            onClickSecondary={stepBack}
            shouldStretchButtons
            textPrimary="Continue"
            textSecondary="Back" />
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        <ModalHeader onClickClose={onClose} textTitle="Assign Permissions To Data Set" />
        <ModalBody onCleanUp={onCleanUp}>
          <StepSelectProperties
              assignPermissionsToAllProperties={assignPermissionsToAllProperties}
              setAssignPermissionsToAllProperties={setAssignPermissionsToAllProperties}
              targetDataSetTitle={targetDataSetTitle}
              targetPermissionOptions={targetPermissionOptions} />
        </ModalBody>
        <ModalFooter
            onClickPrimary={stepNext}
            onClickSecondary={stepBack}
            shouldStretchButtons
            textPrimary="Continue"
            textSecondary="Back" />
      </>
    );
  }

  if (step === 3) {
    let onClickPrimary = onConfirm;
    let textPrimary = 'Confirm';
    let textSecondary = 'Back';
    if (assignPermissionsToDataSetRS === RequestStates.SUCCESS) {
      textPrimary = 'Close';
      textSecondary = '';
      onClickPrimary = onClose;
    }
    return (
      <>
        <ModalHeader onClickClose={onClose} textTitle="Assign Permissions To Data Set" />
        <ModalBody onCleanUp={onCleanUp}>
          <StepConfirm
              assignPermissionsToAllProperties={assignPermissionsToAllProperties}
              assignPermissionsToDataSetRS={assignPermissionsToDataSetRS}
              targetDataSetTitle={targetDataSetTitle}
              targetPermissionOptions={targetPermissionOptions} />
        </ModalBody>
        <ModalFooter
            isPendingPrimary={assignPermissionsToDataSetRS === RequestStates.PENDING}
            onClickPrimary={onClickPrimary}
            onClickSecondary={stepBack}
            shouldStretchButtons
            textPrimary={textPrimary}
            textSecondary={textSecondary} />
      </>
    );
  }

  return null;
};

export default AssignPermissionsToDataSetModal;
