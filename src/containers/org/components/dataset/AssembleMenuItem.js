// @flow
import React from 'react';

import { OrganizationsApiActions } from 'lattice-sagas';
import { MenuItem } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import AssembleMenuItemContent from './AssembleMenuItemContent';

import { EDM } from '../../../../core/redux/constants';

const { isPending } = ReduxUtils;
const {
  DESTROY_TRANSPORTED_ORGANIZATION_ENTITY_SET,
  TRANSPORT_ORGANIZATION_ENTITY_SET,
  destroyTransportedOrganizationEntitySet,
  transportOrganizationEntitySet,
} = OrganizationsApiActions;

type Props = {
  disabled :boolean;
  entitySetId :UUID;
  isAssembled :boolean;
  organizationId :UUID;
};

const AssembleMenuItem = ({
  disabled,
  entitySetId,
  isAssembled,
  organizationId,
} :Props) => {
  const dispatch = useDispatch();
  const destroyRS :?RequestState = useRequestState([EDM, DESTROY_TRANSPORTED_ORGANIZATION_ENTITY_SET]);
  const transportRS :?RequestState = useRequestState([EDM, TRANSPORT_ORGANIZATION_ENTITY_SET]);
  const isLoading = isPending(destroyRS) || isPending(transportRS);

  const handleClick = () => {
    if (isAssembled) {
      dispatch(destroyTransportedOrganizationEntitySet({
        entitySetId,
        organizationId,
      }));
    }
    else {
      dispatch(transportOrganizationEntitySet({
        entitySetId,
        organizationId,
      }));
    }
  };

  return (
    <MenuItem
        disabled={disabled}
        onClick={handleClick}>
      <AssembleMenuItemContent isAssembled={isAssembled} isLoading={isLoading} />
    </MenuItem>
  );
};

export default AssembleMenuItem;
