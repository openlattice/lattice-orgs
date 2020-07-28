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

import { ModalBodyMinWidth } from '../../../components';
import { ReduxActions } from '../../../core/redux';
import { REDUCERS } from '../../../core/redux/constants';
import { PersonUtils } from '../../../utils';

const { ActionTypes } = Types;

const {
  ADD_MEMBER_TO_ORGANIZATION,
  REMOVE_MEMBER_FROM_ORGANIZATION,
  addMemberToOrganization,
  removeMemberFromOrganization,
} = OrganizationsApiActions;

const { getUserId, getUserProfileLabel } = PersonUtils;
const { resetRequestState } = ReduxActions;

type Props = {
  action :?ActionType;
  isOwner :boolean;
  isVisible :boolean;
  onClose :() => void;
  organizationId :UUID;
  user :Map | Object;
};

const LOG = new Logger('AddOrRemoveOrgMemberModal');

const AddOrRemoveOrgMemberModal = ({
  action,
  isOwner,
  isVisible,
  onClose,
  organizationId,
  user,
} :Props) => {

  const dispatch = useDispatch();
  const addMemberRS :?RequestState = useRequestState([REDUCERS.ORGS, ADD_MEMBER_TO_ORGANIZATION]);
  const removeMemberRS :?RequestState = useRequestState([REDUCERS.ORGS, REMOVE_MEMBER_FROM_ORGANIZATION]);

  let actionRS :?RequestState;
  if (action === ActionTypes.ADD) {
    actionRS = addMemberRS;
  }
  else if (action === ActionTypes.REMOVE) {
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

  const userId :string = getUserId(user);
  const userProfileLabel :string = getUserProfileLabel(user) || userId;
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
  }), [action, getUserProfileLabel]);

  const handleOnClickPrimary = () => {
    if (isOwner) {
      if (action === ActionTypes.ADD) {
        dispatch(
          addMemberToOrganization({
            organizationId,
            user,
            memberId: userId,
          })
        );
      }
      else if (action === ActionTypes.REMOVE) {
        dispatch(
          removeMemberFromOrganization({
            organizationId,
            memberId: userId,
          })
        );
      }
    }
    else {
      LOG.warn('only owners can change an organization\'s members');
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
        isVisible={isVisible}
        onClickPrimary={handleOnClickPrimary}
        onClose={handleOnClose}
        requestState={actionRS}
        requestStateComponents={rsComponents}
        textTitle={modalTitle} />
  );
};

export default AddOrRemoveOrgMemberModal;
