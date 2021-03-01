/*
 * @flow
 */

import React from 'react';

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

  return (
    <Cell>{finalValue}</Cell>
  );
};

export default ValueCell;
