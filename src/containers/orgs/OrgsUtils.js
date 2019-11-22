/*
 * @flow
 */

import { List, Map } from 'immutable';

const getRoleSelectOptions = (org :Map) :ReactSelectOption[] => {

  const roles :List = org.get('roles', List());
  const roleSelectOptions :ReactSelectOption[] = roles.map((role :Map) => ({
    label: role.get('title'),
    value: role.get('id'),
  })).toJS();

  return roleSelectOptions;
};

export {
  getRoleSelectOptions,
};
