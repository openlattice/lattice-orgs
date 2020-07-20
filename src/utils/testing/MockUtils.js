/*
 * @flow
 */

import { v4 as uuid } from 'uuid';
import type { UUID } from 'lattice';

function genRandomBoolean() :boolean {

  return Math.random() >= 0.5;
}

function genRandomString() :string {

  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  // not meant to be a cryptographically strong random id, useful in unit tests
  return Math.random().toString(36).slice(2);
}

function genRandomUUID() :UUID {

  return uuid();
}

export {
  genRandomBoolean,
  genRandomString,
  genRandomUUID,
};
