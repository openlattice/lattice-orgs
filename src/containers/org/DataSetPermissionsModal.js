/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { Modal, Typography } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

const DataSetPermissionsModal = ({
  isVisible,
  onClose,
} :{|
  isVisible :boolean;
  onClose :() => void;
|}) => {
  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        textPrimary="Yo Yo Yo"
        textTitle="Add Data Set"
        viewportScrolling>
      <Typography>Search for a data set to assign permissions.</Typography>
    </Modal>
  );
};

export default DataSetPermissionsModal;
