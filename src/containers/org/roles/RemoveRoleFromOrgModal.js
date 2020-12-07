// @flow
import React, { useEffect } from 'react';

import { ActionModal } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, Role, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBody } from '../../../components';
import { resetRequestState } from '../../../core/redux/actions';
import { goToRoute } from '../../../core/router/actions';
import { ORG_ID_PARAM, ORG_MEMBERS } from '../../../core/router/Routes';
import { ORGANIZATIONS } from '../../../core/redux/constants';
import { REMOVE_ROLE_FROM_ORGANIZATION, removeRoleFromOrganization } from '../actions';

type Props = {
  isVisible :boolean;
  onClose :() => void;
  organization :Organization;
  role :Role;
};

const RoleDetailsModal = ({
  isVisible,
  onClose,
  organization,
  role
} :Props) => {
  const dispatch = useDispatch();
  const roleId :UUID = role?.id || '';
  const organizationId :string = organization?.id || '';
  const requestState :?RequestState = useRequestState([ORGANIZATIONS, REMOVE_ROLE_FROM_ORGANIZATION]);
  const rolePath = ORG_MEMBERS.replace(ORG_ID_PARAM, organizationId);

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <ModalBody>
        <span>Are you sure you want to delete this role? This action cannot be undone.</span>
      </ModalBody>
    ),
    [RequestStates.SUCCESS]: (
      <ModalBody>
        <span>This role has been deleted.</span>
      </ModalBody>
    ),
    [RequestStates.FAILURE]: (
      <ModalBody>
        <span>Failed to remove role. Please try again.</span>
      </ModalBody>
    ),
  };

  const handleOnClickPrimary = () => {
    dispatch(
      removeRoleFromOrganization({
        organizationId,
        roleId,
      })
    );
    dispatch(goToRoute(rolePath));
  };

  useEffect(() => {
    if (requestState === RequestStates.SUCCESS) {
      onClose();
      // the timeout avoids rendering the modal with new state before the transition animation finishes
      setTimeout(() => {
        dispatch(resetRequestState([REMOVE_ROLE_FROM_ORGANIZATION]));
      }, 1000);
    }
  }, [dispatch, requestState, rolePath, onClose]);

  return (
    <ActionModal
        isVisible={isVisible}
        textPrimary="Delete"
        onClickPrimary={handleOnClickPrimary}
        onClose={onClose}
        requestState={requestState}
        requestStateComponents={rsComponents}
        textTitle="Delete Role" />
  );
};

export default RoleDetailsModal;
