/*
 * @flow
 */

import _has from 'lodash/has';
import type { Match } from 'react-router';

const getIdFromMatch = (match :Match) :?string => {

  const {
    params: {
      id = null,
    } = {},
  } = match;

  return id;
};

const getParamFromMatch = (match :Match, param :string) :?string => {

  const { params = {} } = match;
  let targetParam = param;
  if (param.startsWith(':')) {
    targetParam = param.slice(1);
  }

  if (_has(params, targetParam)) {
    return params[targetParam];
  }
  return null;
};

export {
  getIdFromMatch,
  getParamFromMatch,
};
