/*
 * @flow
 */

import React, { Component } from 'react';

import { List, Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  Card,
  MinusButton,
  PlusButton,
  Select,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import {
  CompactCardSegment,
  SelectControlWithButton,
  SpinnerOverlayCard,
} from './styled';

import * as ReduxActions from '../../../core/redux/ReduxActions';
import { SectionGrid } from '../../../components';

const {
  GRANT_TRUST_TO_ORGANIZATION,
  REVOKE_TRUST_FROM_ORGANIZATION,
} = OrganizationsApiActions;

const TRUSTED_ORGS_SUB_TITLE = `
Organizations listed here and all their members will be able to see this organization and all its roles.
`;

type Props = {
  actions :{
    grantTrustToOrganization :RequestSequence;
    resetRequestState :(actionType :string) => void;
    revokeTrustFromOrganization :RequestSequence;
  };
  isOwner :boolean;
  org :Map;
  orgs :Map;
  requestStates :{
    GRANT_TRUST_TO_ORGANIZATION :RequestState;
    REVOKE_TRUST_FROM_ORGANIZATION :RequestState;
  };
  trustedOrgs :Map;
};

type State = {
  selectedOption :?{
    label :string;
    value :UUID;
  };
};

class OrgTrustedOrgsSection extends Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      selectedOption: null,
    };
  }

  componentDidUpdate(prevProps :Props) {

    const { requestStates } = this.props;

    if (requestStates[GRANT_TRUST_TO_ORGANIZATION] === RequestStates.SUCCESS
        && prevProps.requestStates[GRANT_TRUST_TO_ORGANIZATION] === RequestStates.PENDING) {
      this.setState({ selectedOption: null });
    }
  }

  handleOnChangeTrustedOrg = (rsOption :?Object, actionMeta :Object = {}) => {

    const { isOwner } = this.props;

    if (isOwner) {
      if (rsOption) {
        this.setState({ selectedOption: rsOption });
      }
      else if (actionMeta.action === 'clear') {
        this.setState({ selectedOption: null });
      }
    }
  }

  handleOnClickGrantTrustToOrg = () => {

    const {
      actions,
      isOwner,
      org,
      orgs,
      trustedOrgs,
    } = this.props;
    const { selectedOption } = this.state;

    if (isOwner && selectedOption) {

      const thisOrgId :UUID = org.get('id');
      const selectedOrgId :UUID = selectedOption.value;
      const selectedOrg :Map = orgs
        .filter((o :Map, id :UUID) => !trustedOrgs.has(id) && id !== thisOrgId)
        .get(selectedOrgId, Map());

      actions.grantTrustToOrganization({
        // required for the request
        organizationId: thisOrgId,
        principalId: selectedOrg.getIn(['principal', 'id']),
        // only needed locally for redux
        trustedOrgId: selectedOrgId,
      });
    }
  }

  handleOnClickRevokeTrustFromOrg = (trustedOrg :Map) => {

    const { actions, isOwner, org } = this.props;

    if (isOwner) {
      actions.revokeTrustFromOrganization({
        // required for the request
        organizationId: org.get('id'),
        principalId: trustedOrg.getIn(['principal', 'id']),
        // only needed locally for redux
        trustedOrgId: trustedOrg.get('id'),
      });
    }
  }

  render() {

    const {
      isOwner,
      org,
      orgs,
      requestStates,
      trustedOrgs,
    } = this.props;
    const { selectedOption } = this.state;

    const thisOrgId :UUID = org.get('id');
    const notYetTrustedOrgs :Object[] = orgs
      .filter((o :Map, id :UUID) => !trustedOrgs.has(id) && id !== thisOrgId)
      .valueSeq()
      .map((o :Map) => ({
        label: o.get('title'),
        value: o.get('id'),
      }))
      .toJS();

    const orgCardSegments = trustedOrgs.valueSeq().map((trustedOrg :Map) => (
      <CompactCardSegment key={trustedOrg.get('id')}>
        <span title={trustedOrg.get('title')}>{trustedOrg.get('title')}</span>
        {
          isOwner && (
            <MinusButton mode="negative" onClick={() => this.handleOnClickRevokeTrustFromOrg(trustedOrg)} />
          )
        }
      </CompactCardSegment>
    ));

    return (
      <SectionGrid>
        <h2>Trusted Organizations</h2>
        {
          isOwner && (
            <h4>{TRUSTED_ORGS_SUB_TITLE}</h4>
          )
        }
        {
          isOwner && (
            <div>
              <SelectControlWithButton>
                <Select
                    isClearable
                    isLoading={requestStates[GRANT_TRUST_TO_ORGANIZATION] === RequestStates.PENDING}
                    options={notYetTrustedOrgs}
                    onChange={this.handleOnChangeTrustedOrg}
                    placeholder="Select an organization to trust"
                    value={selectedOption} />
                <PlusButton
                    isLoading={requestStates[GRANT_TRUST_TO_ORGANIZATION] === RequestStates.PENDING}
                    mode="positive"
                    onClick={this.handleOnClickGrantTrustToOrg} />
              </SelectControlWithButton>
            </div>
          )
        }
        <div>
          {
            orgCardSegments.isEmpty()
              ? (
                <i>No trusted organizations</i>
              )
              : (
                <Card>{orgCardSegments}</Card>
              )
          }
          {
            !orgCardSegments.isEmpty() && requestStates[REVOKE_TRUST_FROM_ORGANIZATION] === RequestStates.PENDING && (
              <SpinnerOverlayCard />
            )
          }
        </div>
      </SectionGrid>
    );
  }
}

const mapStateToProps = (state :Map, props) => {

  const orgs :Map = state.getIn(['orgs', 'orgs'], Map());
  const trustedOrgIds :List = props.org.get('trustedOrgIds', List());
  const trustedOrgs :Map = orgs.filter((org :Map) => trustedOrgIds.includes(org.get('id')));

  return {
    orgs,
    trustedOrgs,
    requestStates: {
      [GRANT_TRUST_TO_ORGANIZATION]: state.getIn(['orgs', GRANT_TRUST_TO_ORGANIZATION, 'requestState']),
      [REVOKE_TRUST_FROM_ORGANIZATION]: state.getIn(['orgs', REVOKE_TRUST_FROM_ORGANIZATION, 'requestState']),
    },
  };
};

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    grantTrustToOrganization: OrganizationsApiActions.grantTrustToOrganization,
    resetRequestState: ReduxActions.resetRequestState,
    revokeTrustFromOrganization: OrganizationsApiActions.revokeTrustFromOrganization,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgTrustedOrgsSection);
