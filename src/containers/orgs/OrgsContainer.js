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
  ActionModal,
  Button,
  Card,
  CardHeader,
  CardSegment,
  Colors,
  Input,
  Label,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as OrgsActions from './OrgsActions';
import * as Routes from '../../core/router/Routes';
import * as ReduxActions from '../../core/redux/ReduxActions';
import * as RoutingActions from '../../core/router/RoutingActions';
import { ModalBodyMinWidth } from '../../components';
import { Logger } from '../../utils';
import { isNonEmptyString } from '../../utils/LangUtils';
import { isValidUUID } from '../../utils/ValidationUtils';
import type { ResetRequestStateAction } from '../../core/redux/ReduxActions';
import type { GoToRoute } from '../../core/router/RoutingActions';

const LOG = new Logger('OrgsContainer');

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

/* stylelint-disable value-no-vendor-prefix, property-no-vendor-prefix */
const OrgDescription = styled.p`
  color: ${NEUTRALS[1]};
  font-size: 14px;
  font-weight: normal;
  margin: 0;
  overflow: hidden;
  overflow-wrap: break-word;
  padding: 0;
  text-overflow: ellipsis;

  /* https://css-tricks.com/line-clampin */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
`;
/* stylelint-enable */

const Error = styled.div`
  text-align: center;
`;

type Props = {
  actions :{
    createOrganization :RequestSequence;
    goToRoute :GoToRoute;
    resetRequestState :ResetRequestStateAction;
  };
  orgs :Map<UUID, Map>;
  newlyCreatedOrgId :?UUID;
  requestStates :{
    CREATE_ORGANIZATION :RequestState;
    GET_ORGS_AND_PERMISSIONS :RequestState;
  };
};

type State = {
  isValidOrgTitle :boolean;
  isVisibleNewOrgModal :boolean;
  newOrgTitle :string;
};

class OrgsContainer extends Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      isValidOrgTitle: true,
      isVisibleNewOrgModal: false,
      newOrgTitle: '',
    };
  }

  componentDidUpdate(props :Props) {

    const { newlyCreatedOrgId, requestStates } = this.props;

    if (props.requestStates[CREATE_ORGANIZATION] === RequestStates.PENDING
        && requestStates[CREATE_ORGANIZATION] === RequestStates.SUCCESS) {
      this.goToOrg(newlyCreatedOrgId);
    }
  }

  componentWillUnmount() {

    const { actions } = this.props;
    actions.resetRequestState(CREATE_ORGANIZATION);
  }

  goToOrg = (orgId :?UUID) => {

    const { actions } = this.props;

    if (isValidUUID(orgId) && orgId) {
      actions.goToRoute(Routes.ORG.replace(Routes.ID_PARAM, orgId));
    }
    else {
      LOG.error('organization id is not a valid UUID', orgId);
    }
  }

  handleOnChangeNewOrgTitle = (event :SyntheticInputEvent<HTMLInputElement>) => {

    this.setState({
      isValidOrgTitle: true,
      newOrgTitle: event.target.value || '',
    });
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
    else {
      this.setState({
        isValidOrgTitle: false,
      });
    }
  }

  closeNewOrgModal = () => {

    const { actions } = this.props;

    this.setState({
      isVisibleNewOrgModal: false,
      newOrgTitle: '',
    });
    actions.resetRequestState(CREATE_ORGANIZATION);
  }

  openNewOrgModal = () => {

    this.setState({
      isVisibleNewOrgModal: true,
      newOrgTitle: '',
    });
  }

  renderOrgCard = (org :Map) => {

    const orgId :UUID = org.get('id');
    const description :string = org.get('description', '');

    return (
      <Card key={orgId} onClick={() => this.goToOrg(orgId)}>
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
    const { isValidOrgTitle, isVisibleNewOrgModal, newOrgTitle } = this.state;

    const requestStateComponents = {
      [RequestStates.STANDBY]: (
        <ModalBodyMinWidth>
          <Label htmlFor="new-org-title">Organization title*</Label>
          <Input
              id="new-org-title"
              invalid={!isValidOrgTitle}
              onChange={this.handleOnChangeNewOrgTitle}
              value={newOrgTitle} />
        </ModalBodyMinWidth>
      ),
      [RequestStates.FAILURE]: (
        <ModalBodyMinWidth>
          <span>Failed to create the organization. Please try again.</span>
        </ModalBodyMinWidth>
      ),
    };

    return (
      <ActionModal
          isVisible={isVisibleNewOrgModal}
          onClickPrimary={this.handleOnClickCreateOrg}
          onClose={this.closeNewOrgModal}
          requestState={requestStates[CREATE_ORGANIZATION]}
          requestStateComponents={requestStateComponents}
          textPrimary="Create"
          textSecondary="Cancel"
          textTitle="New Organization" />
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
  newlyCreatedOrgId: state.getIn(['orgs', 'newlyCreatedOrgId']),
  requestStates: {
    [CREATE_ORGANIZATION]: state.getIn(['orgs', CREATE_ORGANIZATION, 'requestState']),
    [GET_ORGS_AND_PERMISSIONS]: state.getIn(['orgs', GET_ORGS_AND_PERMISSIONS, 'requestState']),
  },
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    createOrganization: OrganizationsApiActions.createOrganization,
    goToRoute: RoutingActions.goToRoute,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgsContainer);
