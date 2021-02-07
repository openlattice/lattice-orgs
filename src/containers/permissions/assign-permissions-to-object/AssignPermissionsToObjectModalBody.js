/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import _capitalize from 'lodash/capitalize';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Models, Types } from 'lattice';
import { ModalFooter as LUKModalFooter } from 'lattice-ui-kit';
import { ReduxUtils, ValidationUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
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
import {
  ASSIGN_PERMISSIONS_TO_DATA_SET,
  UPDATE_PERMISSIONS,
  assignPermissionsToDataSet,
  updatePermissions
} from '../../../core/permissions/actions';
import { resetRequestState } from '../../../core/redux/actions';
import { PERMISSIONS } from '../../../core/redux/constants';
import { getPrincipal } from '../../../utils';

const { AceBuilder } = Models;
const { ActionTypes } = Types;

const { isPending, isSuccess } = ReduxUtils;
const { isValidUUID } = ValidationUtils;

const ModalFooter = styled(LUKModalFooter)`
  padding: 30px 0;
`;

const AssignPermissionsToObjectModalBody = ({
  existingPermissions,
  dataSetId,
  onClose,
  objectKey,
  organizationId
} :{
  existingPermissions :Map<Principal, Map<List<UUID>, Ace>>;
  dataSetId :?UUID;
  onClose :() => void;
  objectKey :List<UUID>;
  organizationId :UUID;
}) => {

  const dispatch = useDispatch();

  const [assignPermissionsToAllProperties, setAssignPermissionsToAllProperties] = useState(true);
  const [targetRoleOrUserPrincipleId, setRoleOrUserPrincipleId] = useState('');
  const [targetRoleOrUserPrincipleType, setTargetRoleOrUserPrincipleType] = useState('');
  const [targetRoleOrUserTitle, setTargetRoleOrUserTitle] = useState('');
  const [targetPermissionOptions, setTargetPermissionOptions] = useState([]);

  const isDataSet :boolean = isValidUUID(dataSetId);

  const assignPermissionsToDataSetRS :?RequestState = useRequestState([PERMISSIONS, ASSIGN_PERMISSIONS_TO_DATA_SET]);
  const updatePermissionsRS :?RequestState = useRequestState([PERMISSIONS, UPDATE_PERMISSIONS]);
  const permissionTypes = targetPermissionOptions.map((option) => option.value);

  const targetRoleOrUserPrincipal :?Principal = getPrincipal({
    id: targetRoleOrUserPrincipleId,
    type: targetRoleOrUserPrincipleType
  });

  const flattenedPermissions :List<Ace> = existingPermissions.valueSeq().flatten();

  useEffect(() => () => {
    dispatch(resetRequestState([ASSIGN_PERMISSIONS_TO_DATA_SET]));
    dispatch(resetRequestState([UPDATE_PERMISSIONS]));
  }, [dispatch]);

  const onConfirm = () => {
    if (dataSetId) {
      dispatch(
        assignPermissionsToDataSet({
          principal: targetRoleOrUserPrincipal,
          dataSetId,
          permissionTypes: targetPermissionOptions.map((option) => option.value),
          withColumns: assignPermissionsToAllProperties,
        })
      );
    }
    else if (targetRoleOrUserPrincipal) {
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
  const assignPermissionsRS :?RequestState = isDataSet ? assignPermissionsToDataSetRS : updatePermissionsRS;
  const updateIsPending = isPending(assignPermissionsRS);
  const updateIsSuccess = isSuccess(assignPermissionsRS);

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
                        existingPermissions={flattenedPermissions}
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
                        assignPermissionsToAllProperties={assignPermissionsToAllProperties}
                        isDataSet={isDataSet}
                        setAssignPermissionsToAllProperties={setAssignPermissionsToAllProperties}
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
                        requestState={assignPermissionsRS}
                        confirmText={confirmText} />
                  </ModalBody>
                  <ModalFooter
                      isPendingPrimary={updateIsPending}
                      onClickPrimary={updateIsSuccess ? onClose : onConfirm}
                      onClickSecondary={stepBack}
                      shouldStretchButtons
                      textPrimary={updateIsSuccess ? 'Close' : 'Confirm'}
                      textSecondary={updateIsSuccess ? '' : 'Back'} />
                </>
              )
            }
          </>
        )
      }
    </StepsController>
  );
};

export default AssignPermissionsToObjectModalBody;
