/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { faTrashAlt } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  ActionModal,
  Card,
  CardSegment,
  IconButton,
  Input,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { Match } from 'react-router';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as OrgsActions from './OrgsActions';
import * as ReduxActions from '../../core/redux/ReduxActions';
import * as RoutingActions from '../../core/router/RoutingActions';
import {
  OrgDescriptionSection,
  OrgDomainsSection,
  OrgIntegrationSection,
  OrgMembersSection,
  OrgTrustedOrgsSection,
} from './components';
import { CardSegmentNoBorder, SectionGrid } from '../../components';
import { getIdFromMatch } from '../../core/router/RouterUtils';
import { isNonEmptyString } from '../../utils/LangUtils';
import type { GoToRoot } from '../../core/router/RoutingActions';

const {
  ADD_MEMBER_TO_ORG,
  DELETE_ORGANIZATION,
} = OrganizationsApiActions;

const {
  GET_ORGANIZATION_DETAILS,
} = OrgsActions;

const OrgDescriptionSegment = styled(CardSegment)`
  justify-content: space-between;
`;

const DeleteOrgButton = styled(IconButton)`
  align-self: center;
  margin: 20px 0 50px 0;
  width: 300px;
`;

const TrashIcon = (
  <FontAwesomeIcon icon={faTrashAlt} />
);

type Props = {
  actions :{
    deleteOrganization :RequestSequence;
    getOrganizationDetails :RequestSequence;
    goToRoot :GoToRoot;
    resetRequestState :(actionType :string) => void;
  };
  isOwner :boolean;
  match :Match;
  org :Map;
  requestStates :{
    ADD_MEMBER_TO_ORG :RequestState;
    DELETE_ORGANIZATION :RequestState;
    GET_ORGANIZATION_DETAILS :RequestState;
  };
};

type State = {
  deleteConfirmationText :string;
  isValidConfirmation :boolean;
  isVisibleDeleteModal :boolean;
};

class OrgDetailsContainer extends Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      deleteConfirmationText: '',
      isValidConfirmation: true,
      isVisibleDeleteModal: false,
    };
  }

  componentDidUpdate(prevProps :Props) {

    const { actions, match, requestStates } = this.props;
    const orgId :?UUID = getIdFromMatch(match);

    if (prevProps.requestStates[ADD_MEMBER_TO_ORG] === RequestStates.PENDING
        && requestStates[ADD_MEMBER_TO_ORG] === RequestStates.SUCCESS) {
      actions.getOrganizationDetails(orgId);
    }

    if (prevProps.requestStates[DELETE_ORGANIZATION] === RequestStates.PENDING
        && requestStates[DELETE_ORGANIZATION] === RequestStates.SUCCESS) {
      actions.goToRoot();
    }
  }

  componentWillUnmount() {

    const { actions } = this.props;
    actions.resetRequestState(DELETE_ORGANIZATION);
  }

  closeDeleteModal = () => {

    const { actions } = this.props;
    actions.resetRequestState(DELETE_ORGANIZATION);

    this.setState({
      deleteConfirmationText: '',
      isValidConfirmation: true,
      isVisibleDeleteModal: false,
    });
  }

  openDeleteModal = () => {

    this.setState({
      isVisibleDeleteModal: true,
    });
  }

  deleteOrganization = () => {

    const { actions, org } = this.props;
    const { deleteConfirmationText } = this.state;

    if (deleteConfirmationText === org.get('title')) {
      actions.deleteOrganization(org.get('id'));
      this.setState({
        deleteConfirmationText: '',
      });
    }
    else {
      this.setState({
        isValidConfirmation: false,
      });
    }
  }

  handleOnChangeDeleteConfirmation = (event :SyntheticInputEvent<HTMLInputElement>) => {

    this.setState({
      deleteConfirmationText: event.target.value || '',
      isValidConfirmation: true,
    });
  }

  renderOrgDescriptionSegment = () => {

    const { isOwner, org } = this.props;
    const description :string = org.get('description', '');

    if (!isOwner && !isNonEmptyString(description)) {
      return null;
    }

    return (
      <OrgDescriptionSegment noBleed>
        <OrgDescriptionSection isOwner={isOwner} org={org} />
      </OrgDescriptionSegment>
    );
  }

  renderIntegrationSegment = () => {

    const { isOwner, org } = this.props;
    if (!isOwner) {
      return null;
    }

    const integration :Map = org.get('integration', Map());
    if (integration.isEmpty()) {
      return null;
    }

    return (
      <CardSegment noBleed vertical>
        <OrgIntegrationSection isOwner={isOwner} org={org} />
      </CardSegment>
    );
  }

  renderDomainsAndTrustedOrgsSegment = () => {

    const { isOwner, org } = this.props;

    return (
      <CardSegment noBleed vertical>
        <SectionGrid columns={2}>
          <OrgDomainsSection isOwner={isOwner} org={org} />
          <OrgTrustedOrgsSection isOwner={isOwner} org={org} />
        </SectionGrid>
      </CardSegment>
    );
  }

  renderRolesAndMembersSegment = () => {

    const { isOwner, org } = this.props;

    return (
      <CardSegmentNoBorder noBleed vertical>
        <OrgMembersSection isOwner={isOwner} org={org} />
      </CardSegmentNoBorder>
    );
  }

  renderDeleteSegment = () => {

    const { requestStates } = this.props;
    const { isValidConfirmation, isVisibleDeleteModal } = this.state;

    const requestStateComponents = {
      [RequestStates.STANDBY]: (
        <>
          <span>Are you absolutely sure you want to delete this organization?</span>
          <br />
          <span>To confirm, please type the organization name.</span>
          <Input invalid={!isValidConfirmation} onChange={this.handleOnChangeDeleteConfirmation} />
        </>
      ),
      [RequestStates.FAILURE]: (
        <span>Failed to delete the organization. Please try again.</span>
      ),
    };

    return (
      <CardSegment noBleed vertical>
        <DeleteOrgButton icon={TrashIcon} mode="negative" onClick={this.openDeleteModal}>
          <span>Delete Organization</span>
        </DeleteOrgButton>
        <ActionModal
            isVisible={isVisibleDeleteModal}
            onClickPrimary={this.deleteOrganization}
            onClose={this.closeDeleteModal}
            requestState={requestStates[DELETE_ORGANIZATION]}
            requestStateComponents={requestStateComponents}
            textPrimary="Yes, delete"
            textSecondary="No, cancel"
            textTitle="Delete Organization" />
      </CardSegment>
    );
  }

  render() {

    return (
      <Card>
        {this.renderOrgDescriptionSegment()}
        {this.renderIntegrationSegment()}
        {this.renderDomainsAndTrustedOrgsSegment()}
        {this.renderRolesAndMembersSegment()}
        {this.renderDeleteSegment()}
      </Card>
    );
  }
}

const mapStateToProps = (state :Map, props :Object) => {

  const orgId :?UUID = getIdFromMatch(props.match);

  return {
    isOwner: state.hasIn(['orgs', 'isOwnerOfOrgIds', orgId], false),
    org: state.getIn(['orgs', 'orgs', orgId], Map()),
    orgs: state.getIn(['orgs', 'orgs'], Map()),
    requestStates: {
      [ADD_MEMBER_TO_ORG]: state.getIn(['orgs', ADD_MEMBER_TO_ORG, 'requestState']),
      [DELETE_ORGANIZATION]: state.getIn(['orgs', DELETE_ORGANIZATION, 'requestState']),
      [GET_ORGANIZATION_DETAILS]: state.getIn(['orgs', GET_ORGANIZATION_DETAILS, 'requestState']),
    },
  };
};

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    deleteOrganization: OrganizationsApiActions.deleteOrganization,
    getOrganizationDetails: OrgsActions.getOrganizationDetails,
    goToRoot: RoutingActions.goToRoot,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgDetailsContainer);
