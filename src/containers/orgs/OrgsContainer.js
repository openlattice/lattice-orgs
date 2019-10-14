/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/pro-solid-svg-icons';
import { List, Map } from 'immutable';
import { Models, Types } from 'lattice';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  Button,
  Card,
  CardHeader,
  CardSegment,
  Colors,
  Input,
  Label,
  Modal,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { isNonEmptyString } from '../../utils/LangUtils';
import * as OrgsActions from './OrgsActions';
import * as Routes from '../../core/router/Routes';
import * as ReduxActions from '../../core/redux/ReduxActions';
import * as RoutingActions from '../../core/router/RoutingActions';
import type { ResetRequestState } from '../../core/redux/ReduxActions';
import type { GoToRoute } from '../../core/router/RoutingActions';

// const LOG = new Logger('OrgsContainer');

const { NEUTRALS } = Colors;

const { OrganizationBuilder, PrincipalBuilder } = Models;
const { PrincipalTypes } = Types;

const { GET_ORGS_AND_PERMISSIONS } = OrgsActions;
const { CREATE_ORGANIZATION } = OrganizationsApiActions;

const TitleSection = styled.section`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin: 20px 0 0 0;

  > h1 {
    font-size: 28px;
    font-weight: normal;
    margin: 0;
    padding: 0;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-gap: 30px;
  grid-template-columns: 1fr 1fr; /* the goal is to have 2 equal-width columns */
  margin-top: 50px;

  ${Card} {
    min-width: 0; /* setting min-width ensures cards do not overflow the grid column */
  }
`;

const OrgName = styled.h2`
  font-size: 18px;
  font-weight: normal;
  margin: 0;
  padding: 0;
`;

const OrgSegment = styled.div`
  display: grid;
  grid-auto-rows: min-content;
  grid-gap: 15px;
  grid-template-columns: 1fr;
`;

const OrgMetaWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  font-size: 14px;
`;

const UserIcon = styled(FontAwesomeIcon).attrs({
  icon: faUser
})`
  margin-right: 10px;
`;

const OrgDescription = styled.p`
  color: ${NEUTRALS[1]};
  font-size: 14px;
  font-weight: normal;
  margin: 0;
  overflow: hidden;
  overflow-wrap: break-word;
  padding: 0;
  text-overflow: ellipsis;
`;

const Error = styled.div`
  text-align: center;
`;

const MinWidth = styled.div`
  min-width: 500px;
`;

type Props = {
  actions :{
    createOrganization :RequestSequence;
    getOrgsAndPermissions :RequestSequence;
    goToRoute :GoToRoute;
    resetRequestState :ResetRequestState;
  };
  orgs :Map<UUID, Map>;
  requestStates :{
    CREATE_ORGANIZATION :RequestState;
    GET_ORGS_AND_PERMISSIONS :RequestState;
  };
};

type State = {
  isVisibleNewOrgModal :boolean;
  newOrgTitle :string;
};

class OrgsContainer extends Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      isVisibleNewOrgModal: false,
      newOrgTitle: '',
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getOrgsAndPermissions();
  }

  componentDidUpdate(props :Props) {

    const { actions, requestStates } = this.props;
    if (props.requestStates[GET_ORGS_AND_PERMISSIONS] === RequestStates.PENDING
        && requestStates[GET_ORGS_AND_PERMISSIONS] === RequestStates.SUCCESS) {
      actions.resetRequestState(OrgsActions.GET_ORGS_AND_PERMISSIONS);
    }

    if (props.requestStates[CREATE_ORGANIZATION] === RequestStates.PENDING
        && requestStates[CREATE_ORGANIZATION] === RequestStates.SUCCESS) {
      console.log('success! go to org...');
    }
  }

  componentWillUnmount() {

    const { actions } = this.props;
    actions.resetRequestState(CREATE_ORGANIZATION);
    actions.resetRequestState(OrgsActions.GET_ORGS_AND_PERMISSIONS);
  }

  goToOrg = (org :Map) => {

    const { actions } = this.props;
    const orgId :UUID = org.get('id');
    actions.goToRoute(Routes.ORG.replace(Routes.ID_PARAM, orgId));
  }

  handleOnChangeNewOrgTitle = (event :SyntheticInputEvent<HTMLInputElement>) => {

    this.setState({ newOrgTitle: event.target.value || '' });
  }

  handleOnClickCreateOrg = () => {

    const { actions } = this.props;
    const { newOrgTitle } = this.state;

    if (isNonEmptyString(newOrgTitle)) {

      const principal = (new PrincipalBuilder())
        .setType(PrincipalTypes.ORGANIZATION)
        .setId(newOrgTitle.replace(/\W/g, ''))
        .build();

      const org = (new OrganizationBuilder())
        .setTitle(newOrgTitle)
        .setPrincipal(principal)
        .build();

      actions.createOrganization(org);
    }
  }

  closeNewOrgModal = () => {

    const { actions } = this.props;

    this.setState({ isVisibleNewOrgModal: false, newOrgTitle: '' });
    actions.resetRequestState(CREATE_ORGANIZATION);
  }

  openNewOrgModal = () => {

    this.setState({ isVisibleNewOrgModal: true, newOrgTitle: '' });
  }

  renderOrgCard = (org :Map) => {

    let description :string = org.get('description', '');

    // TODO: refactor as a utility function
    if (description.length > 100) {
      let spaceIndex = description.indexOf(' ', 98);
      if (spaceIndex === -1) spaceIndex = 100;
      description = `${description.substr(0, spaceIndex)}...`;
    }

    return (
      <Card key={org.get('id')} onClick={() => this.goToOrg(org)}>
        <CardHeader padding="md">
          <OrgName>{org.get('title', '')}</OrgName>
        </CardHeader>
        <CardSegment>
          <OrgSegment>
            <OrgMetaWrapper>
              <UserIcon />
              <span>{org.get('members', List()).count()}</span>
            </OrgMetaWrapper>
            {
              isNonEmptyString(description) && (
                <OrgDescription>{description}</OrgDescription>
              )
            }
          </OrgSegment>
        </CardSegment>
      </Card>
    );
  }

  renderNewOrgModal = () => {

    const { requestStates } = this.props;
    const { isVisibleNewOrgModal, newOrgTitle } = this.state;

    let withFooter = true;
    let body = (
      <>
        <Label htmlFor="new-org-title">Organization title*</Label>
        <Input
            id="new-org-title"
            invalid={requestStates[CREATE_ORGANIZATION] === RequestStates.FAILURE}
            onChange={this.handleOnChangeNewOrgTitle}
            value={newOrgTitle} />
      </>
    );

    if (requestStates[CREATE_ORGANIZATION] === RequestStates.PENDING) {
      body = (
        <Spinner size="2x" />
      );
      withFooter = false;
    }

    return (
      <Modal
          isVisible={isVisibleNewOrgModal}
          onClickPrimary={this.handleOnClickCreateOrg}
          onClickSecondary={this.closeNewOrgModal}
          onClose={this.closeNewOrgModal}
          textPrimary="Create"
          textSecondary="Cancel"
          textTitle="New Organization"
          withFooter={withFooter}>
        {body}
        <MinWidth />
      </Modal>
    );
  }

  render() {

    const { orgs, requestStates } = this.props;

    if (requestStates[GET_ORGS_AND_PERMISSIONS] === RequestStates.PENDING) {
      return (
        <Spinner size="2x" />
      );
    }

    if (requestStates[GET_ORGS_AND_PERMISSIONS] === RequestStates.FAILURE) {
      return (
        <Error>
          Sorry, something went wrong. Please try refreshing the page, or contact support.
        </Error>
      );
    }

    return (
      <>
        <TitleSection>
          <h1>Organizations</h1>
          <Button mode="primary" onClick={this.openNewOrgModal}>Create Organization</Button>
        </TitleSection>
        {
          orgs.isEmpty()
            ? (
              <Error>
                Sorry, no organizations were found. Please try refreshing the page, or contact support.
              </Error>
            )
            : (
              <CardGrid>
                {orgs.valueSeq().map((org :Map) => this.renderOrgCard(org))}
              </CardGrid>
            )
        }
        {this.renderNewOrgModal()}
      </>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  orgs: state.getIn(['orgs', 'orgs']),
  requestStates: {
    [CREATE_ORGANIZATION]: state.getIn(['orgs', CREATE_ORGANIZATION, 'requestState']),
    [GET_ORGS_AND_PERMISSIONS]: state.getIn(['orgs', GET_ORGS_AND_PERMISSIONS, 'requestState']),
  },
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    createOrganization: OrganizationsApiActions.createOrganization,
    getOrgsAndPermissions: OrgsActions.getOrgsAndPermissions,
    goToRoute: RoutingActions.goToRoute,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgsContainer);
