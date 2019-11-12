/*
 * @flow
 */

import randomUUID from 'uuid/v4';

function genRandomBoolean() :boolean {

  return Math.random() >= 0.5;
}

function genRandomString() :string {

  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  // not meant to be a cryptographically strong random id, useful in unit tests
  return Math.random().toString(36).slice(2);
}

function genRandomUUID() :UUID {

  return randomUUID();
}

export {
  genRandomBoolean,
  genRandomString,
  genRandomUUID,
};
