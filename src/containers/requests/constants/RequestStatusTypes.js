/*
 * @flow
 */

type RequestStatusTypesEnum = {|
  APPROVED :'APPROVED';
  PENDING :'PENDING';
  REJECTED :'REJECTED';
|};

const RequestStatusTypes :{| ...RequestStatusTypesEnum |} = Object.freeze({
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
});

type RequestStatusType = $Values<typeof RequestStatusTypes>;

export default RequestStatusTypes;
export type { RequestStatusType };
