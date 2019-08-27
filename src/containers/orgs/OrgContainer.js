/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import {
  faCopy,
  faMinus,
  faPlus,
  faSearch,
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import { Models, Types } from 'lattice';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  Button,
  Card,
  CardSegment,
  Colors,
  Input,
  SearchInput,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import DeleteOrgModal from './components/DeleteOrgModal';
import Logger from '../../utils/Logger';
import * as OrgsActions from './OrgsActions';
import * as ReduxActions from '../../core/redux/ReduxActions';
import * as Routes from '../../core/router/Routes';
import * as RoutingActions from '../../core/router/RoutingActions';
import { isNonEmptyString } from '../../utils/LangUtils';
import { getUserProfileLabel } from '../../utils/PersonUtils';
import { isValidEmailDomain, isValidUUID } from '../../utils/ValidationUtils';
import type { GoToRoot } from '../../core/router/RoutingActions';

const LOG :Logger = new Logger('OrgContainer');

const { NEUTRALS } = Colors;

const {
  Principal,
  PrincipalBuilder,
  Role,
  RoleBuilder,
} = Models;

const {
  PermissionTypes,
  PrincipalTypes,
} = Types;

const {
  ADD_DOMAIN_TO_ORG,
  ADD_MEMBER_TO_ORG,
  DELETE_ORGANIZATION,
  REMOVE_DOMAIN_FROM_ORG,
} = OrganizationsApiActions;

const {
  GET_ORGANIZATION_DETAILS,
  SEARCH_MEMBERS_TO_ADD_TO_ORG,
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

const InputWithButtonWrapper = styled.div`
  display: grid;
  grid-gap: 5px;
  grid-template-columns: 1fr auto;

  > button {
    margin-right: 4px;
  }
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

const SectionGrid = styled.section`
  display: grid;
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

  > div {
    margin: 32px 0 0 0;
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

  i {
    color: ${NEUTRALS[1]};
    font-size: 16px;
    font-weight: normal;
    margin: 32px 0 0 0;
  }

  pre {
    margin: 0;
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

const DOMAINS_SUB_TITLE = `
Users from these domains will automatically be approved when requesting to join this organization.
`;

const TRUSTED_ORGS_SUB_TITLE = `
Organizations listed here and all their members will be able to see this organization and all its roles.
`;

const ROLES_SUB_TITLE = `
You will be able to use the Roles below to manage permissions on Entity Sets that you own.
`;

const MEMBERS_SUB_TITLE = `
Click on a member to view their roles. To add members to this organization, search for users in the system.
`;

type Props = {
  actions :{
    addDomainToOrganization :RequestSequence;
    addMemberToOrganization :RequestSequence;
    getOrganizationDetails :RequestSequence;
    createRole :RequestSequence;
    deleteOrganization :RequestSequence;
    deleteRole :RequestSequence;
    goToRoot :GoToRoot;
    removeDomainFromOrganization :RequestSequence;
    removeMemberFromOrganization :RequestSequence;
    resetRequestState :(actionType :string) => void;
    searchMembersToAddToOrg :RequestSequence;
  };
  isOwner :boolean;
  memberSearchResults :Map;
  org :Map;
  orgId :UUID;
  requestStates :{
    ADD_DOMAIN_TO_ORG :RequestState;
    ADD_MEMBER_TO_ORG :RequestState;
    DELETE_ORGANIZATION :RequestState;
    GET_ORGANIZATION_DETAILS :RequestState;
    REMOVE_DOMAIN_FROM_ORG :RequestState;
    SEARCH_MEMBERS_TO_ADD_TO_ORG :RequestState;
  };
};

type State = {
  domain :string;
  isValidDomain :boolean;
  isValidRole :boolean;
  memberSearchQuery :string;
  roleTitle :string;
};

class OrgContainer extends Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      domain: '',
      isValidDomain: true,
      isValidRole: true,
      memberSearchQuery: '',
      roleTitle: '',
    };
  }

  componentDidMount() {

    const { actions, orgId } = this.props;

    if (!isValidUUID(orgId)) {
      actions.goToRoot();
    }
    else {
      actions.getOrganizationDetails(orgId);
    }
  }

  componentDidUpdate(prevProps :Props) {

    const { actions, orgId, requestStates } = this.props;

    if (!isValidUUID(orgId)) {
      actions.goToRoot();
    }
    else {
      if (orgId !== prevProps.orgId) {
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
   * domain related handlers
   */

  handleOnChangeDomain = (event :SyntheticInputEvent<HTMLInputElement>) => {

    const { isOwner } = this.props;

    if (isOwner) {
      const domain :string = event.target.value || '';
      // always set isValidDomain to true when typing
      this.setState({ domain, isValidDomain: true });
    }
  }

  handleOnClickAddDomain = () => {

    const { actions, isOwner, org } = this.props;
    const { domain } = this.state;

    if (isOwner) {
      if (!isNonEmptyString(domain)) {
        // set to false only when the button was clicked
        this.setState({ isValidDomain: false });
        return;
      }

      const isValidDomain :boolean = isValidEmailDomain(domain);
      const isNewDomain :boolean = !org.get('emails', List()).includes(domain);

      if (isValidDomain && isNewDomain) {
        actions.addDomainToOrganization({ domain, organizationId: org.get('id') });
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

  /*
   * member related handlers
   */

  handleOnChangeMemberSearch = (event :SyntheticInputEvent<HTMLInputElement>) => {

    const { actions, isOwner, org } = this.props;
    const memberSearchQuery = event.target.value || '';

    if (isOwner) {
      actions.searchMembersToAddToOrg({
        organizationId: org.get('id'),
        query: memberSearchQuery,
      });
      this.setState({ memberSearchQuery });
    }
  }

  handleOnClickAddMember = (memberId :string) => {

    const { actions, isOwner, org } = this.props;

    if (isOwner) {
      actions.addMemberToOrganization({
        memberId,
        organizationId: org.get('id'),
      });
    }
  }

  handleOnClickMemberSearch = () => {

    const { actions, isOwner, org } = this.props;
    const { memberSearchQuery } = this.state;

    if (isOwner) {
      actions.searchMembersToAddToOrg({
        organizationId: org.get('id'),
        query: memberSearchQuery,
      });
      this.setState({ memberSearchQuery });
    }
  }

  handleOnClickRemoveMember = (memberId :string) => {

    const { actions, isOwner, org } = this.props;

    if (isOwner) {
      actions.removeMemberFromOrganization({
        memberId,
        organizationId: org.get('id'),
      });
    }
  }

  /*
   * role related handlers
   */

  handleOnChangeRole = (event :SyntheticInputEvent<HTMLInputElement>) => {

    const { isOwner } = this.props;
    const roleTitle :string = event.target.value || '';

    if (isOwner) {
      // always set isValidRole to true when typing
      this.setState({ roleTitle, isValidRole: true });
    }
  }

  handleOnClickAddRole = () => {

    const { actions, isOwner, org } = this.props;
    const { roleTitle } = this.state;

    if (isOwner) {
      if (!isNonEmptyString(roleTitle)) {
        // set to false only when the button was clicked
        this.setState({ isValidRole: false });
        return;
      }

      const principal :Principal = (new PrincipalBuilder())
        .setType(PrincipalTypes.ROLE)
        .setId(`${org.get('id')}|${roleTitle.replace(/\W/g, '')}`)
        .build();

      const newRole :Role = (new RoleBuilder())
        .setOrganizationId(org.get('id'))
        .setPrincipal(principal)
        .setTitle(roleTitle)
        .build();

      const isNewRole :boolean = org.get('roles', List())
        .filter((role :Map) => role.getIn(['principal', 'id']) === newRole.principal.id)
        .isEmpty();

      if (isNewRole) {
        actions.createRole(newRole);
      }
      else {
        // set isValidDomain to false only when the button was clicked
        this.setState({ isValidRole: false });
      }
    }
  }

  handleOnClickRemoveRole = (role :Map) => {

    const { actions, isOwner, org } = this.props;

    if (isOwner) {
      actions.deleteRole({
        organizationId: org.get('id'),
        roleId: role.get('id'),
      });
    }
  }

  renderAddButton = (onClick :Function) => (
    <Button mode="positive" onClick={onClick}>
      <FontAwesomeIcon icon={faPlus} />
    </Button>
  )

  renderRemoveButton = (onClick :Function) => (
    <Button mode="negative" onClick={onClick}>
      <FontAwesomeIcon icon={faMinus} />
    </Button>
  )

  renderOrgDetails = () => {

    const { org } = this.props;

    return (
      <Card>
        <CardSegment noBleed>
          <OrgDescription>{org.get('description')}</OrgDescription>
        </CardSegment>
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
          <InputWithButtonWrapper>
            <Input disabled type="password" value="********************************" />
            <Button onClick={this.handleOnClickCopyCredential}>
              <FontAwesomeIcon icon={faCopy} />
            </Button>
          </InputWithButtonWrapper>
        </SectionGrid>
      </CardSegment>
    );
  }

  renderDomainsAndTrustedOrgsSegment = () => (
    <CardSegment noBleed>
      <SectionGrid columns={2}>
        {this.renderDomainsSection()}
        {this.renderTrustedOrgsSection()}
      </SectionGrid>
    </CardSegment>
  )

  renderDomainsSection = () => {

    const { isOwner, org } = this.props;
    const { isValidDomain } = this.state;

    const domains = org.get('emails', List());
    const domainCardSegments = domains.map((emailDomain :string) => (
      <CompactCardSegment key={emailDomain}>
        <span>{emailDomain}</span>
        {
          isOwner && (
            this.renderRemoveButton(() => {
              this.handleOnClickRemoveDomain(emailDomain);
            })
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
            <InputWithButtonWrapper>
              <Input
                  invalid={!isValidDomain}
                  placeholder="Add a new domain"
                  onChange={this.handleOnChangeDomain} />
              {this.renderAddButton(this.handleOnClickAddDomain)}
            </InputWithButtonWrapper>
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
        </div>
      </SectionGrid>
    );
  }

  renderTrustedOrgsSection = () => {

    const { isOwner } = this.props;

    return (
      <SectionGrid>
        <h2>Trusted Organizations</h2>
        {
          isOwner && (
            <h4>{TRUSTED_ORGS_SUB_TITLE}</h4>
          )
        }
        <div>
          <i>No trusted organizations</i>
        </div>
      </SectionGrid>
    );
  }

  renderRolesAndMembersSegment = () => {

    const { isOwner, org } = this.props;

    return (
      <CardSegment noBleed vertical>
        <SectionGrid columns={2}>
          {this.renderRolesSection()}
          {this.renderMembersSection()}
        </SectionGrid>
        {
          isOwner && (
            <DeleteOrgModal org={org} />
          )
        }
      </CardSegment>
    );
  }

  renderRolesSection = () => {

    const { isOwner, org } = this.props;
    const { isValidRole } = this.state;

    const roles = org.get('roles', List());
    const roleCardSegments = roles.map((role :Map) => (
      <CompactCardSegment key={role.get('id')}>
        <span>{role.get('title')}</span>
        {
          isOwner && (
            this.renderRemoveButton(() => {
              this.handleOnClickRemoveRole(role);
            })
          )
        }
      </CompactCardSegment>
    ));

    return (
      <SectionGrid>
        <h2>Roles</h2>
        {
          isOwner && (
            <h4>{ROLES_SUB_TITLE}</h4>
          )
        }
        {
          isOwner && (
            <InputWithButtonWrapper>
              <Input
                  invalid={!isValidRole}
                  onChange={this.handleOnChangeRole}
                  placeholder="Add a new role" />
              {this.renderAddButton(this.handleOnClickAddRole)}
            </InputWithButtonWrapper>
          )
        }
        <div>
          {
            roleCardSegments.isEmpty()
              ? (
                <i>No roles</i>
              )
              : (
                <Card>{roleCardSegments}</Card>
              )
          }
        </div>
      </SectionGrid>
    );
  }

  renderMembersSection = () => {

    const {
      isOwner,
      org,
      memberSearchResults,
      requestStates,
    } = this.props;
    const { memberSearchQuery } = this.state;

    const members = org.get('members', List());
    const memberCardSegments = members.map((member :Map) => {
      const memberId :string = member.getIn(['profile', 'user_id'], member.get('id'));
      return (
        <CompactCardSegment key={memberId}>
          <span>{getUserProfileLabel(member)}</span>
          {
            isOwner && (
              this.renderRemoveButton(() => {
                this.handleOnClickRemoveMember(memberId);
              })
            )
          }
        </CompactCardSegment>
      );
    });

    const shouldShowSpinner = isNonEmptyString(memberSearchQuery)
      && requestStates[SEARCH_MEMBERS_TO_ADD_TO_ORG] === RequestStates.PENDING;

    const searchResultCardSegments = memberSearchResults.valueSeq().map((member :Map) => (
      <CompactCardSegment key={member.get('user_id')}>
        <span>{getUserProfileLabel(member)}</span>
        {this.renderAddButton(() => {
          this.handleOnClickAddMember(member.get('user_id'));
        })}
      </CompactCardSegment>
    ));

    return (
      <SectionGrid>
        <h2>Members</h2>
        {
          isOwner && (
            <h4>{MEMBERS_SUB_TITLE}</h4>
          )
        }
        {
          isOwner && (
            <InputWithButtonWrapper>
              <SearchInput
                  onChange={this.handleOnChangeMemberSearch}
                  placeholder="Search for a member to add" />
              <Button isLoading={shouldShowSpinner} onClick={this.handleOnClickMemberSearch}>
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            </InputWithButtonWrapper>
          )
        }
        {
          isOwner && isNonEmptyString(memberSearchQuery) && !searchResultCardSegments.isEmpty() && (
            <div>
              <Card>{searchResultCardSegments}</Card>
            </div>
          )
        }
        {
          !memberCardSegments.isEmpty() && (
            <div>
              <Card>{memberCardSegments}</Card>
            </div>
          )
        }
      </SectionGrid>
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

  return {
    orgId,
    isOwner: state.getIn(['orgs', 'orgPermissions', orgId, PermissionTypes.OWNER], false),
    memberSearchResults: state.getIn(['orgs', 'memberSearchResults'], Map()),
    org: state.getIn(['orgs', 'orgs', orgId], Map()),
    requestStates: {
      [ADD_DOMAIN_TO_ORG]: state.getIn(['orgs', ADD_DOMAIN_TO_ORG, 'requestState']),
      [ADD_MEMBER_TO_ORG]: state.getIn(['orgs', ADD_MEMBER_TO_ORG, 'requestState']),
      [DELETE_ORGANIZATION]: state.getIn(['orgs', DELETE_ORGANIZATION, 'requestState']),
      [GET_ORGANIZATION_DETAILS]: state.getIn(['orgs', GET_ORGANIZATION_DETAILS, 'requestState']),
      [REMOVE_DOMAIN_FROM_ORG]: state.getIn(['orgs', REMOVE_DOMAIN_FROM_ORG, 'requestState']),
      [SEARCH_MEMBERS_TO_ADD_TO_ORG]: state.getIn(['orgs', SEARCH_MEMBERS_TO_ADD_TO_ORG, 'requestState']),
    },
  };
};

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    addDomainToOrganization: OrganizationsApiActions.addDomainToOrganization,
    addMemberToOrganization: OrganizationsApiActions.addMemberToOrganization,
    getOrganizationDetails: OrgsActions.getOrganizationDetails,
    createRole: OrganizationsApiActions.createRole,
    deleteOrganization: OrganizationsApiActions.deleteOrganization,
    deleteRole: OrganizationsApiActions.deleteRole,
    goToRoot: RoutingActions.goToRoot,
    removeDomainFromOrganization: OrganizationsApiActions.removeDomainFromOrganization,
    removeMemberFromOrganization: OrganizationsApiActions.removeMemberFromOrganization,
    resetRequestState: ReduxActions.resetRequestState,
    searchMembersToAddToOrg: OrgsActions.searchMembersToAddToOrg,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgContainer);
