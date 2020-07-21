/*
 * @flow
 */

import isEmail from 'validator/lib/isEmail';
import { List, Map, get } from 'immutable';

import type { ReactSelectOption } from '../../types';

const getRoleSelectOptions = (org :Map) :ReactSelectOption[] => {

  const roles :List = get(org, 'roles', List());
  const roleSelectOptions :ReactSelectOption[] = roles.map((role :Map) => ({
    label: get(role, 'title'),
    value: get(role, 'id'),
  })).toJS();

  return roleSelectOptions;
};

function isValidEmailDomain(value :any) :boolean %checks {

  return isEmail(`test@${value}`);
}

export {
  getRoleSelectOptions,
  isValidEmailDomain,
};
