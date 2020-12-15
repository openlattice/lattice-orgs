// @flow
import React from 'react';

import { Modal } from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';
import type { Organization, Role, UUID } from 'lattice';

import ResetOnUnmount from '../components/ResetOnUnmount';
import { REMOVE_ROLE_FROM_ORGANIZATION, removeRoleFromOrganization } from '../actions';


const resetStatePath = [REMOVE_ROLE_FROM_ORGANIZATION];

type Props = {
  isVisible :boolean;
  onClose :() => void;
  organization :Organization;
  role :Role;
};

const RemoveRoleFromOrgModal = ({
  isVisible,
  onClose,
  organization,
  role
} :Props) => {
  const dispatch = useDispatch();
  const roleId :UUID = role?.id || '';
  const organizationId :string = organization?.id || '';

  const handleOnClickPrimary = () => {
    dispatch(
      removeRoleFromOrganization({
        organizationId,
        roleId,
      })
    );
  };

  return (
    <Modal
        isVisible={isVisible}
        textPrimary="Delete"
        onClickPrimary={handleOnClickPrimary}
        onClose={onClose}
        textTitle="Delete Role">
      <ResetOnUnmount
          path={resetStatePath}
          message="Are you sure you want to delete this role? This action cannot be undone." />
    </Modal>
  );
};

export default RemoveRoleFromOrgModal;
