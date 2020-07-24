/*
 * @flow
 */

const ORG_ID_PARAM :':organizationId' = ':organizationId';

export {
  ORG_ID_PARAM,
};

const ROOT :'/' = '/';
const ORGS :'/orgs' = '/orgs';

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG :'/orgs/:organizationId' = `${ORGS}/${ORG_ID_PARAM}`;
// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG_MEMBERS :'/orgs/:organizationId/members' = `${ORGS}/${ORG_ID_PARAM}/members`;

export {
  ORG,
  ORGS,
  ORG_MEMBERS,
  ROOT,
};
