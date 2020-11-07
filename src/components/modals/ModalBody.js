/*
 * @flow
 */

import React, { useEffect } from 'react';

import _isFunction from 'lodash/isFunction';
import styled from 'styled-components';

const ModalBodyWrapper = styled.div`
  max-width: 100%;
  width: ${({ width }) => ((typeof width === 'number' && width > 0) ? width : 720)}px;
`;

const ModalBody = ({
  children,
  onCleanUp,
  width,
} :{|
  children :any;
  onCleanUp :() => void;
  width ?:number;
|}) => {

  useEffect(() => () => {
    if (_isFunction(onCleanUp)) {
      onCleanUp();
    }
  }, [onCleanUp]);

  return (
    <ModalBodyWrapper width={width}>
      {children}
    </ModalBodyWrapper>
  );
};

ModalBody.defaultProps = {
  width: 720,
};

export default ModalBody;
