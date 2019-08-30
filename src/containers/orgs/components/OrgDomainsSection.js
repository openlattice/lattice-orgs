/*
 * @flow
 */

import React, { Component } from 'react';

import { faMinus, faPlus } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { Button, Card, Input } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import ActionControlWithButton from './styled/ActionControlWithButton';
import CompactCardSegment from './styled/CompactCardSegment';
import OrgDetailSectionGrid from './styled/OrgDetailSectionGrid';
import OrgDetailSectionGridItem from './styled/OrgDetailSectionGridItem';
import SpinnerOverlayCard from './styled/SpinnerOverlayCard';
import * as ReduxActions from '../../../core/redux/ReduxActions';
import { isNonEmptyString } from '../../../utils/LangUtils';
import { isValidEmailDomain } from '../../../utils/ValidationUtils';

const {
  ADD_DOMAIN_TO_ORG,
  REMOVE_DOMAIN_FROM_ORG,
} = OrganizationsApiActions;

const DOMAINS_SUB_TITLE = `
Users from these domains will automatically be approved when requesting to join this organization.
`;

type Props = {
  actions :{
    addDomainToOrganization :RequestSequence;
    removeDomainFromOrganization :RequestSequence;
    resetRequestState :(actionType :string) => void;
  };
  isOwner :boolean;
  org :Map;
  requestStates :{
    ADD_DOMAIN_TO_ORG :RequestState;
    REMOVE_DOMAIN_FROM_ORG :RequestState;
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
        actions.addDomainToOrganization({ domain: valueOfDomain, organizationId: org.get('id') });
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
      actions.removeDomainFromOrganization({
        domain,
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
            <Button mode="negative" onClick={() => this.handleOnClickRemoveDomain(emailDomain)}>
              <FontAwesomeIcon icon={faMinus} />
            </Button>
          )
        }
      </CompactCardSegment>
    ));

    return (
      <OrgDetailSectionGrid>
        <h2>Domains</h2>
        {
          isOwner && (
            <h4>{DOMAINS_SUB_TITLE}</h4>
          )
        }
        {
          isOwner && (
            <OrgDetailSectionGridItem>
              <ActionControlWithButton>
                <Input
                    invalid={!isValidDomain}
                    placeholder="Add a new domain"
                    onChange={this.handleOnChangeDomain} />
                {
                  <Button
                      isLoading={requestStates[ADD_DOMAIN_TO_ORG] === RequestStates.PENDING}
                      mode="positive"
                      onClick={this.handleOnClickAddDomain}>
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
                }
              </ActionControlWithButton>
            </OrgDetailSectionGridItem>
          )
        }
        <OrgDetailSectionGridItem>
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
            !domainCardSegments.isEmpty() && requestStates[REMOVE_DOMAIN_FROM_ORG] === RequestStates.PENDING && (
              <SpinnerOverlayCard />
            )
          }
        </OrgDetailSectionGridItem>
      </OrgDetailSectionGrid>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => ({
  requestStates: {
    [ADD_DOMAIN_TO_ORG]: state.getIn(['orgs', ADD_DOMAIN_TO_ORG, 'requestState']),
    [REMOVE_DOMAIN_FROM_ORG]: state.getIn(['orgs', REMOVE_DOMAIN_FROM_ORG, 'requestState']),
  },
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    addDomainToOrganization: OrganizationsApiActions.addDomainToOrganization,
    removeDomainFromOrganization: OrganizationsApiActions.removeDomainFromOrganization,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgDomainsSection);
