/*
 * @flow
 */

import React, { useMemo } from 'react';

import { Types } from 'lattice';
import { ActionModal } from 'lattice-ui-kit';
import { Logger, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { ActionType, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBodyMinWidth } from '../../../components';
import { ReduxActions } from '../../../core/redux';
import { ORGANIZATIONS } from '../../../core/redux/constants';
import {
  ADD_ROLE_TO_ORGANIZATION,
  REMOVE_ROLE_FROM_ORGANIZATION,
  addRoleToOrganization,
  removeRoleFromOrganization,
} from '../OrgsActions';

const { resetRequestState } = ReduxActions;
const { ActionTypes } = Types;

type Props = {
  action :?ActionType;
  isOwner :boolean;
  onClose :() => void;
  organizationId :UUID;
  roleId :?UUID;
  roleTitle :string;
};

const LOG = new Logger('AddOrRemoveOrgRoleModal');

const AddOrRemoveOrgRoleModal = ({
  action,
  isOwner,
  onClose,
  organizationId,
  roleId,
  roleTitle,
} :Props) => {

  const dispatch = useDispatch();
  const addRoleRS :?RequestState = useRequestState([ORGANIZATIONS, ADD_ROLE_TO_ORGANIZATION]);
  const removeRoleRS :?RequestState = useRequestState([ORGANIZATIONS, REMOVE_ROLE_FROM_ORGANIZATION]);

  let actionRS :?RequestState;
  if (action === ActionTypes.ADD) {
    actionRS = addRoleRS;
  }
  else if (action === ActionTypes.REMOVE) {
    actionRS = removeRoleRS;
  }

  const modalTitle = useMemo(() => {
    if (action === ActionTypes.ADD) {
      return 'Add Role To Organization';
    }
    if (action === ActionTypes.REMOVE) {
      return 'Remove Role From Organization';
    }
    return '';
  }, [action]);

  const rsComponents = useMemo(() => ({
    [RequestStates.STANDBY]: (
      <ModalBodyMinWidth>
        <span>
          {
            action === ActionTypes.ADD && (
              `Are you sure you want to add ${roleTitle} to this organization?`
            )
          }
          {
            action === ActionTypes.REMOVE && (
              `Are you sure you want to remove ${roleTitle} from this organization?`
            )
          }
        </span>
      </ModalBodyMinWidth>
    ),
  }), [action, roleTitle]);

  const handleOnClickPrimary = () => {
    if (isOwner) {
      if (action === ActionTypes.ADD) {
        dispatch(
          addRoleToOrganization({
            organizationId,
            roleTitle,
          })
        );
      }
      else if (action === ActionTypes.REMOVE) {
        dispatch(
          removeRoleFromOrganization({
            roleId,
            organizationId,
          })
        );
      }
    }
    else {
      LOG.warn('only owners can change organization members');
    }
  };

  const handleOnClose = () => {
    onClose();
    // the timeout avoids rendering the modal with new state before the transition animation finishes
    setTimeout(() => {
      dispatch(resetRequestState([ADD_ROLE_TO_ORGANIZATION]));
      dispatch(resetRequestState([REMOVE_ROLE_FROM_ORGANIZATION]));
    }, 1000);
  };

  return (
    <ActionModal
        isVisible
        onClickPrimary={handleOnClickPrimary}
        onClose={handleOnClose}
        requestState={actionRS}
        requestStateComponents={rsComponents}
        textTitle={modalTitle} />
  );
};

export default AddOrRemoveOrgRoleModal;
