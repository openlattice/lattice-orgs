/*
 * @flow
 */

import React, { useMemo } from 'react';

import { Map } from 'immutable';
import { Types } from 'lattice';
import { OrganizationsApiActions } from 'lattice-sagas';
import { ActionModal } from 'lattice-ui-kit';
import { Logger, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { ActionType, Role, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBodyMinWidth } from '../../../components';
import { ReduxActions } from '../../../core/redux';
import { REDUCERS } from '../../../core/redux/constants';
import { PersonUtils } from '../../../utils';

const { ActionTypes } = Types;

const {
  ADD_ROLE_TO_MEMBER,
  REMOVE_ROLE_FROM_MEMBER,
  addRoleToMember,
  removeRoleFromMember,
} = OrganizationsApiActions;

const { getUserId, getUserProfileLabel } = PersonUtils;
const { resetRequestState } = ReduxActions;

type Props = {
  action :?ActionType;
  isOwner :boolean;
  member :Map;
  onClose :() => void;
  organizationId :UUID;
  role :Role;
};

const LOG = new Logger('AddOrRemoveMemberRoleModal');

const AddOrRemoveMemberRoleModal = ({
  action,
  isOwner,
  member,
  onClose,
  organizationId,
  role,
} :Props) => {

  const dispatch = useDispatch();
  const addRoleRS :?RequestState = useRequestState([REDUCERS.ORGS, ADD_ROLE_TO_MEMBER]);
  const removeRoleRS :?RequestState = useRequestState([REDUCERS.ORGS, REMOVE_ROLE_FROM_MEMBER]);

  let actionRS :RequestState;
  if (action === ActionTypes.ADD) {
    // $FlowFixMe - ActionModal
    actionRS = addRoleRS;
  }
  else if (action === ActionTypes.REMOVE) {
    // $FlowFixMe - ActionModal
    actionRS = removeRoleRS;
  }

  const modalTitle = useMemo(() => {
    if (action === ActionTypes.ADD) {
      return 'Add Role To Member';
    }
    if (action === ActionTypes.REMOVE) {
      return 'Remove Role From Member';
    }
    return '';
  }, [action]);

  const memberId :string = getUserId(member);
  const userProfileLabel :string = getUserProfileLabel(member) || memberId;
  const rsComponents = useMemo(() => ({
    [RequestStates.STANDBY]: (
      <ModalBodyMinWidth>
        <span>
          {
            action === ActionTypes.ADD && (
              `Are you sure you want to add ${role.title} to ${userProfileLabel}?`
            )
          }
          {
            action === ActionTypes.REMOVE && (
              `Are you sure you want to remove ${role.title} from ${userProfileLabel}?`
            )
          }
        </span>
      </ModalBodyMinWidth>
    ),
  }), [action, userProfileLabel, role]);

  const handleOnClickPrimary = () => {
    if (isOwner) {
      if (action === ActionTypes.ADD) {
        dispatch(
          addRoleToMember({
            memberId,
            organizationId,
            roleId: role.id,
          })
        );
      }
      else if (action === ActionTypes.REMOVE) {
        dispatch(
          removeRoleFromMember({
            memberId,
            organizationId,
            roleId: role.id,
          })
        );
      }
    }
    else {
      LOG.warn('only owners can change member roles');
    }
  };

  const handleOnClose = () => {
    onClose();
    // the timeout avoids rendering the modal with new state before the transition animation finishes
    setTimeout(() => {
      dispatch(resetRequestState([ADD_ROLE_TO_MEMBER]));
      dispatch(resetRequestState([REMOVE_ROLE_FROM_MEMBER]));
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

export default AddOrRemoveMemberRoleModal;
