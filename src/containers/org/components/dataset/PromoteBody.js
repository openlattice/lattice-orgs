// @flow
import React, { useEffect } from 'react';

import styled from 'styled-components';
import { Map, getIn } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  Button,
  Typography,
} from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBody } from '../../../../components';
import { resetRequestState } from '../../../../core/redux/actions';

const {
  promoteStagingTable,
  PROMOTE_STAGING_TABLE,
} = OrganizationsApiActions;

const StyledBody = styled(ModalBody)`
  padding-bottom: 30px;
`;

type Props = {
  dataSet :Map;
  organizationId :UUID;
  requestState :?RequestState;
}

const PromoteBody = ({ dataSet, organizationId, requestState } :Props) => {
  const dispatch = useDispatch();

  useEffect(() => () => {
    dispatch(resetRequestState([PROMOTE_STAGING_TABLE]));
  }, [dispatch]);

  const dataSetId = getIn(dataSet, ['table', 'id']);
  const tableName = getIn(dataSet, ['table', 'name']);

  const handleSubmit = (e :SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(promoteStagingTable({
      dataSetId,
      organizationId,
      tableName,
    }));
  };

  return (
    <StyledBody>
      <Typography
          color="textSecondary"
          gutterBottom>
        {`Promote the ${tableName} data set to the OpenLattice schema.`}
      </Typography>
      <Button
          color="primary"
          fullWidth
          isLoading={requestState === RequestStates.PENDING}
          onClick={handleSubmit}
          type="submit">
        Promote
      </Button>
    </StyledBody>
  );
};

export default PromoteBody;
