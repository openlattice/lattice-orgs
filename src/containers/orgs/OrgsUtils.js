/*
 * @flow
 */

import { List, Map, get } from 'immutable';

const getRoleSelectOptions = (org :Map) :ReactSelectOption[] => {

  const roles :List = get(org, 'roles', List());
  const roleSelectOptions :ReactSelectOption[] = roles.map((role :Map) => ({
    label: get(role, 'title'),
    value: get(role, 'id'),
  })).toJS();

  return roleSelectOptions;
};

export {
  getRoleSelectOptions,
};
