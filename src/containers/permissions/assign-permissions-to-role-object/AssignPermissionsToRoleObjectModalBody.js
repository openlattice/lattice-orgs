/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import _capitalize from 'lodash/capitalize';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Models, Types } from 'lattice';
import { ModalFooter as LUKModalFooter } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type {
  Ace,
  Principal,
  UUID
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import StepSelectRoleOrUser from './StepSelectRoleOrUser';

import StepConfirm from '../StepConfirm';
import StepSelectPermissions from '../StepSelectPermissions';
import { ModalBody, StepsController } from '../../../components';
import { UPDATE_PERMISSIONS, updatePermissions } from '../../../core/permissions/actions';
import { resetRequestState } from '../../../core/redux/actions';
import { PERMISSIONS } from '../../../core/redux/constants';
import { selectPermissionsByPrincipal } from '../../../core/redux/selectors';
import { getPrincipal } from '../../../utils';

const { AceBuilder } = Models;
const { ActionTypes } = Types;

const ModalFooter = styled(LUKModalFooter)`
  padding: 30px 0;
`;

const AssignPermissionsToRoleObjectModalBody = ({
  onClose,
  objectKey,
  organizationId
} :{
  onClose :() => void;
  objectKey :List<UUID>;
  organizationId :UUID;
}) => {

  const dispatch = useDispatch();

  const [targetRoleOrUserPrincipleId, setRoleOrUserPrincipleId] = useState('');
  const [targetRoleOrUserPrincipleType, setTargetRoleOrUserPrincipleType] = useState('');
  const [targetRoleOrUserTitle, setTargetRoleOrUserTitle] = useState('');
  const [targetPermissionOptions, setTargetPermissionOptions] = useState([]);

  const updatePermissionsRS :?RequestState = useRequestState([PERMISSIONS, UPDATE_PERMISSIONS]);
  const permissionTypes = targetPermissionOptions.map((option) => option.value);

  const targetRoleOrUserPrincipal :?Principal = getPrincipal({
    id: targetRoleOrUserPrincipleId,
    type: targetRoleOrUserPrincipleType
  });

  const existingPermissions :Map<Principal, Map<List<UUID>, Ace>> = useSelector(
    selectPermissionsByPrincipal(List([objectKey]))
  ).valueSeq().flatten();

  useEffect(() => () => {
    dispatch(resetRequestState([UPDATE_PERMISSIONS]));
  }, [dispatch]);

  const onConfirm = () => {
    if (targetRoleOrUserPrincipal) {
      const ace = (new AceBuilder())
        .setPermissions(permissionTypes)
        .setPrincipal(targetRoleOrUserPrincipal)
        .build();
      const permissions = Map().set(objectKey, ace);
      dispatch(
        updatePermissions({
          actionType: ActionTypes.ADD,
          permissions
        })
      );
    }
  };

  const isSuccess = updatePermissionsRS === RequestStates.SUCCESS;

  const permissionsString = targetPermissionOptions
    .map((option) => option.value)
    .map(_capitalize)
    .join(', ');

  const confirmText = `Please confirm you want to assign ${permissionsString} to "${targetRoleOrUserTitle}".`;

  return (
    <StepsController>
      {
        ({ step, stepBack, stepNext }) => (
          <>
            {
              step === 0 && (
                <>
                  <ModalBody>
                    <StepSelectRoleOrUser
                        existingPermissions={existingPermissions}
                        organizationId={organizationId}
                        setRoleOrUserPrincipleId={setRoleOrUserPrincipleId}
                        setTargetRoleOrUserPrincipleType={setTargetRoleOrUserPrincipleType}
                        setTargetRoleOrUserTitle={setTargetRoleOrUserTitle}
                        targetRoleOrUserPrincipal={targetRoleOrUserPrincipal} />
                  </ModalBody>
                  <ModalFooter
                      isDisabledPrimary={!targetRoleOrUserPrincipal}
                      onClickPrimary={stepNext}
                      onClickSecondary={stepBack}
                      shouldStretchButtons
                      textPrimary="Continue"
                      textSecondary="" />
                </>
              )
            }
            {
              step === 1 && (
                <>
                  <ModalBody>
                    <StepSelectPermissions
                        setTargetPermissionOptions={setTargetPermissionOptions}
                        targetTitle={targetRoleOrUserTitle}
                        targetPermissionOptions={targetPermissionOptions} />
                  </ModalBody>
                  <ModalFooter
                      onClickPrimary={stepNext}
                      onClickSecondary={stepBack}
                      shouldStretchButtons
                      textPrimary="Continue"
                      textSecondary="Back" />
                </>
              )
            }
            {
              step === 2 && (
                <>
                  <ModalBody>
                    <StepConfirm
                        assignPermissionsRS={updatePermissionsRS}
                        confirmText={confirmText} />
                  </ModalBody>
                  <ModalFooter
                      isPendingPrimary={updatePermissionsRS === RequestStates.PENDING}
                      onClickPrimary={isSuccess ? onClose : onConfirm}
                      onClickSecondary={stepBack}
                      shouldStretchButtons
                      textPrimary={isSuccess ? 'Close' : 'Confirm'}
                      textSecondary={isSuccess ? '' : 'Back'} />
                </>
              )
            }
          </>
        )
      }
    </StepsController>
  );
};

export default AssignPermissionsToRoleObjectModalBody;
