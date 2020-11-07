/*
 * @flow
 */

import React, { useCallback, useEffect, useReducer } from 'react';

import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import {
  ModalFooter as LUKModalFooter,
  ModalHeader as LUKModalHeader,
} from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import StepSelectDataSet from './StepSelectDataSet';

import { ModalBody } from '../../../../components';
import { ASSIGN_PERMISSIONS_TO_DATA_SET } from '../../../../core/permissions/actions';
import { resetRequestState } from '../../../../core/redux/actions';
import { SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS, clearSearchState } from '../../../../core/search/actions';

const ModalHeader = styled(LUKModalHeader)`
  padding: 30px 0;
`;

const ModalFooter = styled(LUKModalFooter)`
  padding: 30px 0;
`;

const AssignPermissionsToDataSetModal = ({
  organizationId,
  step,
  stepBack,
  stepNext,
} :{
  organizationId :UUID;
  step :number;
  stepBack :() => void;
  stepNext :() => void;
}) => {

  const dispatch = useDispatch();

  const onCleanUp = useCallback(() => {
    dispatch(clearSearchState(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
    dispatch(resetRequestState([ASSIGN_PERMISSIONS_TO_DATA_SET]));
  }, [dispatch]);

  let stepComponent;
  if (step === 0) {
    stepComponent = <StepSelectDataSet organizationId={organizationId} />;
  }
  // else if (step === 1) {
  //   stepComponent = <StepSelectPermissions />;
  // }
  // else if (step === 2) {
  //   stepComponent = <StepSelectProperties />;
  // }
  // else if (step === 3) {
  //   stepComponent = <StepConfirm />;
  // }

  return (
    <>
      <ModalHeader textTitle="Assign Permissions To Data Set" />
      <ModalBody onCleanUp={onCleanUp}>
        <div>{stepComponent}</div>
      </ModalBody>
      <ModalFooter
          onClickPrimary={stepNext}
          onClickSecondary={stepBack}
          shouldStretchButtons
          textPrimary="Primary"
          textSecondary="Secondary" />
    </>
  );
};

export default AssignPermissionsToDataSetModal;
