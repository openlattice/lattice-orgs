/*
 * @flow
 */

import React, { Component } from 'react';

import styled, { css } from 'styled-components';
import {
  faCopy,
  faMinus,
  faPlus,
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  Button,
  Card,
  CardSegment,
  Colors,
  Input,
  Select,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { Match } from 'react-router';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import DeleteOrgModal from './components/DeleteOrgModal';
import OrgDomainsSection from './components/OrgDomainsSection';
import OrgMembersSection from './components/OrgMembersSection';
import OrgRolesSection from './components/OrgRolesSection';
import Logger from '../../utils/Logger';
import * as OrgsActions from './OrgsActions';
import * as ReduxActions from '../../core/redux/ReduxActions';
import * as Routes from '../../core/router/Routes';
import * as RoutingActions from '../../core/router/RoutingActions';
import { isNonEmptyString } from '../../utils/LangUtils';
import { isValidUUID } from '../../utils/ValidationUtils';
import type { GoToRoot } from '../../core/router/RoutingActions';

const LOG :Logger = new Logger('OrgContainer');

const { NEUTRALS } = Colors;

const {
  ADD_MEMBER_TO_ORG,
  DELETE_ORGANIZATION,
  GRANT_TRUST_TO_ORG,
  REVOKE_TRUST_FROM_ORG,
} = OrganizationsApiActions;

const {
  GET_ORGANIZATION_DETAILS,
} = OrgsActions;

const OrgTitle = styled.h1`
  font-size: 28px;
  font-weight: normal;
  margin: 20px 0 0 0;
  padding: 0;
`;

const OrgDescription = styled.h3`
  font-size: 20px;
  font-weight: normal;
  margin: 0;
  padding: 0;
`;

const Tabs = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: 30px 0 50px 0;
`;

const CompactCardSegment = styled(CardSegment)`
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 3px 3px 3px 10px;

  > span {
    overflow: hidden;
    padding-right: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const SectionItem = styled.div`
  position: relative;
  ${({ marginTop }) => {
    const finalMarginTop = (marginTop >= 0) ? marginTop : 32;
    return css`
      margin: ${finalMarginTop}px 0 0 0;
    `;
  }}
`;

const SectionGrid = styled.section`
  display: grid;
  flex: 1;
  grid-auto-rows: min-content;
  ${({ columns }) => {
    if (columns > 0) {
      return css`
        grid-column-gap: 30px;
        grid-template-columns: repeat(${columns}, 1fr);
      `;
    }
    return null;
  }}

  > h2 {
    font-size: 22px;
    font-weight: 600;
    margin: 0;
  }

  > h4 {
    color: ${NEUTRALS[1]};
    font-size: 16px;
    font-weight: normal;
    margin: 16px 0 0 0;
  }

  > h5 {
    color: ${NEUTRALS[1]};
    font-size: 14px;
    font-weight: normal;
    margin: 16px 0 0 0;
  }

  i {
    color: ${NEUTRALS[1]};
    font-size: 16px;
    font-weight: normal;
    margin: 32px 0 0 0;
  }

  pre {
    margin: 0;
  }

  ${SectionItem} {
    /*
     * !!! IMPORTANT !!!
     *
     * https://www.w3.org/TR/css-flexbox-1/
     *   | By default, flex items won’t shrink below their minimum content size (the length of the longest word or
     *   | fixed-size element). To change this, set the min-width or min-height property.
     *
     * https://dfmcphee.com/flex-items-and-min-width-0/
     * https://css-tricks.com/flexbox-truncated-text/
     *
     * !!! IMPORTANT !!!
     */
    min-width: 0; /* setting min-width fixes the text truncation issue */
  }
`;

const SpinnerOverlayCard = styled(Card)`
  display: flex;
  height: 100%;
  justify-content: center;
  position: absolute;
  top: 0;
  width: 100%;
`;

const ActionControlWithButton = styled.div`
  display: grid;
  grid-gap: 5px;
  grid-template-columns: 1fr auto;

  > button {
    margin-right: 4px;
  }
`;

const SelectControlWithButton = styled(ActionControlWithButton)`
  > div {
    display: flex;

    > div {
      flex: 1;
    }
  }
`;

const ORG_NAV_LINK_ACTIVE :string = 'org-nav-link-active';

const OrgNavLink = styled(NavLink).attrs({
  activeClassName: ORG_NAV_LINK_ACTIVE
})`
  align-items: center;
  border-bottom: 2px solid transparent;
  color: ${NEUTRALS[1]};
  font-size: 18px;
  font-weight: 600;
  line-height: 70px;
  margin-right: 40px;
  outline: none;
  text-decoration: none;

  &:focus {
    text-decoration: none;
  }

  &:hover {
    color: ${NEUTRALS[0]};
    cursor: pointer;
    outline: none;
    text-decoration: none;
  }

  &.${ORG_NAV_LINK_ACTIVE} {
    border-bottom: 2px solid #674fef;
    color: #674fef;
  }
`;

const TRUSTED_ORGS_SUB_TITLE = `
Organizations listed here and all their members will be able to see this organization and all its roles.
`;

type Props = {
  actions :{
    getOrganizationDetails :RequestSequence;
    deleteOrganization :RequestSequence;
    goToRoot :GoToRoot;
    grantTrustToOrganization :RequestSequence;
    resetRequestState :(actionType :string) => void;
    revokeTrustFromOrganization :RequestSequence;
  };
  isOwner :boolean;
  match :Match;
  org :Map;
  orgs :Map;
  requestStates :{
    ADD_MEMBER_TO_ORG :RequestState;
    DELETE_ORGANIZATION :RequestState;
    GET_ORGANIZATION_DETAILS :RequestState;
    GRANT_TRUST_TO_ORG :RequestState;
    REVOKE_TRUST_FROM_ORG :RequestState;
  };
  trustedOrgs :Map;
};

type State = {
  orgToTrustSelectedOption :?{
    label :string;
    value :UUID;
  };
};

class OrgContainer extends Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      orgToTrustSelectedOption: null,
    };
  }

  componentDidMount() {

    const { actions, match } = this.props;
    const { params: { id: orgId = null } = {} } = match;

    if (!isValidUUID(orgId)) {
      actions.goToRoot();
    }
    else {
      actions.getOrganizationDetails(orgId);
    }
  }

  componentDidUpdate(prevProps :Props) {

    const { actions, match, requestStates } = this.props;
    const { params: { id: orgId = null } = {} } = match;
    const { params: { id: prevOrgId = null } = {} } = prevProps.match;

    if (!isValidUUID(orgId)) {
      actions.goToRoot();
    }
    else {
      if (orgId !== prevOrgId) {
        actions.getOrganizationDetails(orgId);
      }
      if (requestStates[GET_ORGANIZATION_DETAILS] === RequestStates.SUCCESS
          && prevProps.requestStates[GET_ORGANIZATION_DETAILS] === RequestStates.PENDING) {
        actions.resetRequestState(GET_ORGANIZATION_DETAILS);
      }
      else if (requestStates[GET_ORGANIZATION_DETAILS] === RequestStates.FAILURE
          && prevProps.requestStates[GET_ORGANIZATION_DETAILS] === RequestStates.PENDING) {
        actions.goToRoot();
      }
      if (requestStates[ADD_MEMBER_TO_ORG] === RequestStates.SUCCESS
          && prevProps.requestStates[ADD_MEMBER_TO_ORG] === RequestStates.PENDING) {
        actions.getOrganizationDetails(orgId);
      }
      if (requestStates[DELETE_ORGANIZATION] === RequestStates.SUCCESS
          && prevProps.requestStates[DELETE_ORGANIZATION] === RequestStates.PENDING) {
        actions.goToRoot();
      }
      if (requestStates[GRANT_TRUST_TO_ORG] === RequestStates.SUCCESS
          && prevProps.requestStates[GRANT_TRUST_TO_ORG] === RequestStates.PENDING) {
        this.setState({ orgToTrustSelectedOption: null });
      }
    }
  }

  componentWillUnmount() {

    const { actions } = this.props;
    actions.resetRequestState(GET_ORGANIZATION_DETAILS);
  }

  handleOnClickCopyCredential = () => {

    const { isOwner, org } = this.props;

    if (isOwner) {
      // TODO: consider using https://github.com/zenorocha/clipboard.js
      if (navigator.clipboard) {
        navigator.clipboard.writeText(org.getIn(['integration', 'credential'], ''));
      }
      else {
        LOG.error('cannot copy credential, navigator.clipboard is not available');
      }
    }
  }

  /*
   * trusted orgs related handlers
   */

  handleOnChangeTrustedOrg = (rsOption :?Object, actionMeta :Object = {}) => {

    const { isOwner } = this.props;

    if (isOwner) {
      if (rsOption) {
        this.setState({ orgToTrustSelectedOption: rsOption });
      }
      else if (actionMeta.action === 'clear') {
        this.setState({ orgToTrustSelectedOption: null });
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
    const { orgToTrustSelectedOption } = this.state;

    if (isOwner && orgToTrustSelectedOption) {

      const thisOrgId :UUID = org.get('id');
      const selectedOrgId :UUID = orgToTrustSelectedOption.value;
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

  renderAddButton = (onClick :Function, isPending :boolean = false) => (
    <Button isLoading={isPending} mode="positive" onClick={onClick}>
      <FontAwesomeIcon icon={faPlus} />
    </Button>
  )

  renderRemoveButton = (onClick :Function, isPending :boolean = false) => (
    <Button isLoading={isPending} mode="negative" onClick={onClick}>
      <FontAwesomeIcon icon={faMinus} />
    </Button>
  )

  renderSpinnerOverlayCard = () => (
    <SpinnerOverlayCard>
      <Spinner size="2x" />
    </SpinnerOverlayCard>
  )

  renderOrgDetails = () => {

    const { org } = this.props;
    const description :string = org.get('description', '');

    return (
      <Card>
        {
          isNonEmptyString(description) && (
            <CardSegment noBleed>
              <OrgDescription>{description}</OrgDescription>
            </CardSegment>
          )
        }
        {this.renderIntegrationSegment()}
        {this.renderDomainsAndTrustedOrgsSegment()}
        {this.renderRolesAndMembersSegment()}
      </Card>
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

    const orgIdClean = org.get('id').replace(/-/g, '');

    return (
      <CardSegment noBleed vertical>
        <SectionGrid>
          <h2>Integration Account Details</h2>
          <h5>JDBC URL</h5>
          <pre>{`jdbc:postgresql://atlas.openlattice.com:30001/org_${orgIdClean}`}</pre>
          <h5>USER</h5>
          <pre>{org.getIn(['integration', 'user'], '')}</pre>
          <h5>CREDENTIAL</h5>
        </SectionGrid>
        <SectionGrid columns={2}>
          <SectionItem marginTop={4}>
            <ActionControlWithButton>
              <Input disabled type="password" value="********************************" />
              <Button onClick={this.handleOnClickCopyCredential}>
                <FontAwesomeIcon icon={faCopy} />
              </Button>
            </ActionControlWithButton>
          </SectionItem>
        </SectionGrid>
      </CardSegment>
    );
  }

  renderDomainsAndTrustedOrgsSegment = () => {

    const { isOwner, org } = this.props;

    return (
      <CardSegment noBleed vertical>
        <SectionGrid columns={2}>
          <OrgDomainsSection isOwner={isOwner} org={org} />
          {this.renderTrustedOrgsSection()}
        </SectionGrid>
      </CardSegment>
    );
  }

  renderTrustedOrgsSection = () => {

    const {
      isOwner,
      org,
      orgs,
      requestStates,
      trustedOrgs,
    } = this.props;
    const { orgToTrustSelectedOption } = this.state;

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
            this.renderRemoveButton(() => this.handleOnClickRevokeTrustFromOrg(trustedOrg))
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
            <SectionItem>
              <SelectControlWithButton>
                <Select
                    isClearable
                    isLoading={requestStates[GRANT_TRUST_TO_ORG] === RequestStates.PENDING}
                    options={notYetTrustedOrgs}
                    onChange={this.handleOnChangeTrustedOrg}
                    placeholder="Select an organization to trust"
                    value={orgToTrustSelectedOption} />
                {
                  this.renderAddButton(
                    this.handleOnClickGrantTrustToOrg,
                    requestStates[GRANT_TRUST_TO_ORG] === RequestStates.PENDING
                  )
                }
              </SelectControlWithButton>
            </SectionItem>
          )
        }
        <SectionItem>
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
            !orgCardSegments.isEmpty() && requestStates[REVOKE_TRUST_FROM_ORG] === RequestStates.PENDING && (
              this.renderSpinnerOverlayCard()
            )
          }
        </SectionItem>
      </SectionGrid>
    );
  }

  renderRolesAndMembersSegment = () => {

    const { isOwner, org } = this.props;

    return (
      <CardSegment noBleed vertical>
        <SectionGrid columns={2}>
          <OrgRolesSection isOwner={isOwner} org={org} />
          <OrgMembersSection isOwner={isOwner} org={org} />
        </SectionGrid>
        {
          isOwner && (
            <DeleteOrgModal org={org} />
          )
        }
      </CardSegment>
    );
  }

  renderPermissions = () => {

    return (
      <Card>
        <CardSegment vertical>
          Manage Permissions
        </CardSegment>
      </Card>
    );
  }

  renderEntitySets = () => {

    return (
      <Card>
        <CardSegment vertical>
          Entity Set
        </CardSegment>
      </Card>
    );
  }

  render() {

    const { org, requestStates } = this.props;

    if (requestStates[GET_ORGANIZATION_DETAILS] === RequestStates.PENDING) {
      return (
        <Spinner size="2x" />
      );
    }

    return (
      <>
        <OrgTitle>{org.get('title')}</OrgTitle>
        <Tabs>
          <OrgNavLink exact to={Routes.ORG.replace(Routes.ID_PATH, org.get('id'))}>
            Organization Details
          </OrgNavLink>
          <OrgNavLink exact to={Routes.ORG_PERMISSIONS.replace(Routes.ID_PATH, org.get('id'))}>
            Permissions
          </OrgNavLink>
          <OrgNavLink exact to={Routes.ORG_ENTITY_SETS.replace(Routes.ID_PATH, org.get('id'))}>
            Entity Sets
          </OrgNavLink>
        </Tabs>
        <Switch>
          <Route path={Routes.ORG_PERMISSIONS} render={this.renderPermissions} />
          <Route path={Routes.ORG_ENTITY_SETS} render={this.renderEntitySets} />
          <Route render={this.renderOrgDetails} />
        </Switch>
      </>
    );
  }
}

const mapStateToProps = (state :Map<*, *>, props) => {

  const {
    params: {
      id: orgId = null,
    } = {},
  } = props.match;

  const orgs :Map = state.getIn(['orgs', 'orgs'], Map());
  const org :Map = orgs.get(orgId, Map());
  const trustedOrgIds :List = org.get('trustedOrgIds', List());
  const trustedOrgs :Map = orgs.filter((anOrg :Map) => trustedOrgIds.includes(anOrg.get('id')));

  return {
    org,
    orgs,
    trustedOrgs,
    isOwner: state.hasIn(['orgs', 'isOwnerOfOrgIds', orgId], false),
    requestStates: {
      [ADD_MEMBER_TO_ORG]: state.getIn(['orgs', ADD_MEMBER_TO_ORG, 'requestState']),
      [DELETE_ORGANIZATION]: state.getIn(['orgs', DELETE_ORGANIZATION, 'requestState']),
      [GET_ORGANIZATION_DETAILS]: state.getIn(['orgs', GET_ORGANIZATION_DETAILS, 'requestState']),
      [GRANT_TRUST_TO_ORG]: state.getIn(['orgs', GRANT_TRUST_TO_ORG, 'requestState']),
      [REVOKE_TRUST_FROM_ORG]: state.getIn(['orgs', REVOKE_TRUST_FROM_ORG, 'requestState']),
    },
  };
};

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    getOrganizationDetails: OrgsActions.getOrganizationDetails,
    grantTrustToOrganization: OrganizationsApiActions.grantTrustToOrganization,
    deleteOrganization: OrganizationsApiActions.deleteOrganization,
    goToRoot: RoutingActions.goToRoot,
    resetRequestState: ReduxActions.resetRequestState,
    revokeTrustFromOrganization: OrganizationsApiActions.revokeTrustFromOrganization,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgContainer);
