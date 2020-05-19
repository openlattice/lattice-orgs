/*
 * @flow
 */

import React, { Component } from 'react';

import { List, Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  Card,
  Input,
  MinusButton,
  PlusButton,
} from 'lattice-ui-kit';
import { LangUtils } from 'lattice-utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import {
  ActionControlWithButton,
  CompactCardSegment,
  SpinnerOverlayCard,
} from './styled';

import * as ReduxActions from '../../../core/redux/ReduxActions';
import { SectionGrid } from '../../../components';
import { isValidEmailDomain } from '../OrgsUtils';

const { isNonEmptyString } = LangUtils;
const {
  ADD_DOMAINS_TO_ORGANIZATION,
  REMOVE_DOMAINS_FROM_ORGANIZATION,
} = OrganizationsApiActions;

const DOMAINS_SUB_TITLE = `
Users from these domains will automatically be approved when requesting to join this organization.
`;

type Props = {
  actions :{
    addDomainsToOrganization :RequestSequence;
    removeDomainsFromOrganization :RequestSequence;
    resetRequestState :(actionType :string) => void;
  };
  isOwner :boolean;
  org :Map;
  requestStates :{
    ADD_DOMAINS_TO_ORGANIZATION :RequestState;
    REMOVE_DOMAINS_FROM_ORGANIZATION :RequestState;
  };
};

type State = {
  isValidDomain :boolean;
  valueOfDomain :string;
};

class OrgDomainsSection extends Component<Props, State> {

  state = {
    isValidDomain: true,
    valueOfDomain: '',
  }

  handleOnChangeDomain = (event :SyntheticInputEvent<HTMLInputElement>) => {

    const { isOwner } = this.props;

    if (isOwner) {
      const valueOfDomain :string = event.target.value || '';
      // always set isValidDomain to true when typing
      this.setState({ valueOfDomain, isValidDomain: true });
    }
  }

  handleOnClickAddDomain = () => {

    const { actions, isOwner, org } = this.props;
    const { valueOfDomain } = this.state;

    if (isOwner) {
      if (!isNonEmptyString(valueOfDomain)) {
        // set to false only when the button was clicked
        this.setState({ isValidDomain: false });
        return;
      }

      const isValidDomain :boolean = isValidEmailDomain(valueOfDomain);
      const isNewDomain :boolean = !org.get('emails', List()).includes(valueOfDomain);

      if (isValidDomain && isNewDomain) {
        actions.addDomainsToOrganization({ domains: [valueOfDomain], organizationId: org.get('id') });
      }
      else {
        // set to false only when the button was clicked
        this.setState({ isValidDomain: false });
      }
    }
  }

  handleOnClickRemoveDomain = (domain :string) => {

    const { actions, isOwner, org } = this.props;

    if (isOwner) {
      actions.removeDomainsFromOrganization({
        domains: [domain],
        organizationId: org.get('id'),
      });
    }
  }

  render() {

    const { isOwner, org, requestStates } = this.props;
    const { isValidDomain } = this.state;

    const domains = org.get('emails', List());
    const domainCardSegments = domains.map((emailDomain :string) => (
      <CompactCardSegment key={emailDomain}>
        <span title={emailDomain}>{emailDomain}</span>
        {
          isOwner && (
            <MinusButton mode="negative" onClick={() => this.handleOnClickRemoveDomain(emailDomain)} />
          )
        }
      </CompactCardSegment>
    ));

    return (
      <SectionGrid>
        <h2>Domains</h2>
        {
          isOwner && (
            <h4>{DOMAINS_SUB_TITLE}</h4>
          )
        }
        {
          isOwner && (
            <div>
              <ActionControlWithButton>
                <Input
                    invalid={!isValidDomain}
                    placeholder="Add a new domain"
                    onChange={this.handleOnChangeDomain} />
                <PlusButton
                    isLoading={requestStates[ADD_DOMAINS_TO_ORGANIZATION] === RequestStates.PENDING}
                    mode="positive"
                    onClick={this.handleOnClickAddDomain} />
              </ActionControlWithButton>
            </div>
          )
        }
        <div>
          {
            domainCardSegments.isEmpty()
              ? (
                <i>No domains</i>
              )
              : (
                <Card>{domainCardSegments}</Card>
              )
          }
          {
            !domainCardSegments.isEmpty()
            && requestStates[REMOVE_DOMAINS_FROM_ORGANIZATION] === RequestStates.PENDING
            && (
              <SpinnerOverlayCard />
            )
          }
        </div>
      </SectionGrid>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  requestStates: {
    [ADD_DOMAINS_TO_ORGANIZATION]: state.getIn(['orgs', ADD_DOMAINS_TO_ORGANIZATION, 'requestState']),
    [REMOVE_DOMAINS_FROM_ORGANIZATION]: state.getIn(['orgs', REMOVE_DOMAINS_FROM_ORGANIZATION, 'requestState']),
  },
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    addDomainsToOrganization: OrganizationsApiActions.addDomainsToOrganization,
    removeDomainsFromOrganization: OrganizationsApiActions.removeDomainsFromOrganization,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgDomainsSection);
