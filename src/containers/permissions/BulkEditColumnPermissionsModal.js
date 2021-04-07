/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { List, Map } from 'immutable';
import { Models, Types } from 'lattice';
import { Button, Modal, Typography } from 'lattice-ui-kit';
import { DataUtils, ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type {
  FQN,
  PermissionType,
  Principal,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import StepConfirm from './StepConfirm';

import GapGrid from '../../components/grids/GapGrid';
import { FQNS } from '../../core/edm/constants';
import { UPDATE_PERMISSIONS, updatePermissions } from '../../core/permissions/actions';
import { resetRequestStates } from '../../core/redux/actions';
import { PERMISSIONS } from '../../core/redux/constants';
import { selectMyKeys } from '../../core/redux/selectors';

const { AceBuilder } = Models;
const { ActionTypes } = Types;
const { getPropertyValue } = DataUtils;
const { isPending } = ReduxUtils;

const BulkEditColumnPermissionsModal = ({
  dataSetColumns,
  isVisible,
  objectKey,
  onClose,
  permissionType,
  principal,
} :{|
  dataSetColumns :List<Map<FQN, List>>;
  isVisible :boolean;
  objectKey :List<UUID>;
  onClose :() => void;
  permissionType :PermissionType;
  principal :Principal;
|}) => {

  const [actionType, setActionType] = useState('');

  const dispatch = useDispatch();

  const myKeys :Set<List<UUID>> = useSelector(selectMyKeys());
  const aceForUpdate = (new AceBuilder()).setPermissions([permissionType]).setPrincipal(principal).build();

  const updatePermissionsRS :?RequestState = useRequestState([PERMISSIONS, UPDATE_PERMISSIONS]);

  const handleOnChangePermission = (updateType :string) => {
    if (!isPending(updatePermissionsRS)) {
      const permissionsToUpdate = Map().withMutations((mutator) => {
        dataSetColumns.forEach((column :Map<FQN, List>) => {
          const columnId :UUID = getPropertyValue(column, [FQNS.OL_ID, 0]);
          const key :List<UUID> = List([objectKey.get(0), columnId]);
          if (myKeys.has(key)) {
            mutator.set(key, aceForUpdate);
          }
        });
      });
      dispatch(
        updatePermissions({
          actionType: updateType,
          permissions: permissionsToUpdate
        })
      );
      setActionType(updateType);
    }
  };

  useEffect(() => {
    if (!isPending(updatePermissionsRS)) {
      setActionType('');
    }
  }, [updatePermissionsRS]);

  const handleOnClose = () => {
    dispatch(resetRequestStates([UPDATE_PERMISSIONS]));
    onClose();
  };

  return (
    <Modal
        isVisible={isVisible}
        onClickSecondary={handleOnClose}
        onClose={handleOnClose}
        shouldStretchButtons
        textSecondary="Close"
        textTitle="Bulk Edit Column Permissions">
      <Typography gutterBottom>
        Selecting either option below will update permissions
        for all columns you are authorized to update.
      </Typography>
      <GapGrid>
        <Button
            isLoading={actionType === ActionTypes.ADD && isPending(updatePermissionsRS)}
            onClick={() => handleOnChangePermission(ActionTypes.ADD)}>
          Check All Columns
        </Button>
        <Button
            isLoading={actionType === ActionTypes.REMOVE && isPending(updatePermissionsRS)}
            onClick={() => handleOnChangePermission(ActionTypes.REMOVE)}>
          Uncheck All Columns
        </Button>
      </GapGrid>
      <StepConfirm
          confirmText=""
          requestState={updatePermissionsRS}
          successText="Success!" />
    </Modal>
  );
};

export default BulkEditColumnPermissionsModal;
