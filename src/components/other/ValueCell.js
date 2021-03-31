/*
 * @flow
 */

import React from 'react';

import { LangUtils } from 'lattice-utils';

const { isNonEmptyArray } = LangUtils;

const ValueCell = ({
  component: Cell,
  value,
} :{
  component :any;
  value :mixed;
}) => {

  let finalValue = value;
  if (typeof value === 'boolean') {
    finalValue = String(value);
  }
  else if (isNonEmptyArray(value)) {
    // TODO: allow caller to decide how to handle arrays
    finalValue = value.join(', ');
  }

  return (
    <Cell>{finalValue}</Cell>
  );
};

export default ValueCell;
