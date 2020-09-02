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
import type { ActionType, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBodyMinWidth } from '../../../../components';
import { resetRequestState } from '../../../../core/redux/actions';
import { ORGANIZATIONS } from '../../../../core/redux/constants';
import { PersonUtils } from '../../../../utils';

const {
  ADD_MEMBER_TO_ORGANIZATION,
  REMOVE_MEMBER_FROM_ORGANIZATION,
  addMemberToOrganization,
  removeMemberFromOrganization,
} = OrganizationsApiActions;

const { getUserId, getUserProfileLabel } = PersonUtils;
const { ActionTypes } = Types;

type Props = {
  action :?ActionType;
  isOwner :boolean;
  onClose :() => void;
  organizationId :UUID;
  member :Map;
};

const LOG = new Logger('AddOrRemoveOrgMemberModal');

const AddOrRemoveOrgMemberModal = ({
  action,
  isOwner,
  onClose,
  organizationId,
  member,
} :Props) => {

  const dispatch = useDispatch();
  const addMemberRS :?RequestState = useRequestState([ORGANIZATIONS, ADD_MEMBER_TO_ORGANIZATION]);
  const removeMemberRS :?RequestState = useRequestState([ORGANIZATIONS, REMOVE_MEMBER_FROM_ORGANIZATION]);

  let actionRS :RequestState;
  if (action === ActionTypes.ADD) {
    // $FlowFixMe - ActionModal
    actionRS = addMemberRS;
  }
  else if (action === ActionTypes.REMOVE) {
    // $FlowFixMe - ActionModal
    actionRS = removeMemberRS;
  }

  const modalTitle = useMemo(() => {
    if (action === ActionTypes.ADD) {
      return 'Add Member To Organization';
    }
    if (action === ActionTypes.REMOVE) {
      return 'Remove Member From Organization';
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
              `Are you sure you want to add ${userProfileLabel} to this organization?`
            )
          }
          {
            action === ActionTypes.REMOVE && (
              `Are you sure you want to remove ${userProfileLabel} from this organization?`
            )
          }
        </span>
      </ModalBodyMinWidth>
    ),
  }), [action, userProfileLabel]);

  const handleOnClickPrimary = () => {
    if (isOwner) {
      if (action === ActionTypes.ADD) {
        dispatch(
          addMemberToOrganization({
            memberId,
            organizationId,
          })
        );
      }
      else if (action === ActionTypes.REMOVE) {
        dispatch(
          removeMemberFromOrganization({
            memberId,
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
      dispatch(resetRequestState([ADD_MEMBER_TO_ORGANIZATION]));
      dispatch(resetRequestState([REMOVE_MEMBER_FROM_ORGANIZATION]));
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

export default AddOrRemoveOrgMemberModal;
