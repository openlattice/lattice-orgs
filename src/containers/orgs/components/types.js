/*
 * @flow
 */

type UserActionObject = {
  color :string;
  faIcon :any;
  onClick :(userId :string) => void;
};

export type {
  UserActionObject,
};
