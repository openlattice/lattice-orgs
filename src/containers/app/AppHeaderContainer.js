/*
 * @flow
 */

import React, { Component } from 'react';

import Select from 'react-select';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { AuthActionFactory } from 'lattice-auth';
import { Button, Colors } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import AppNavigationContainer from './AppNavigationContainer';
import OpenLatticeLogo from '../../assets/images/logo_v2.png';
import * as OrgsActions from '../orgs/OrgsActions';
import * as Routes from '../../core/router/Routes';
import {
  APP_CONTAINER_MAX_WIDTH,
  APP_CONTAINER_WIDTH,
  APP_CONTENT_PADDING,
} from '../../core/style/Sizes';

const { NEUTRALS, PURPLES, WHITE } = Colors;

// TODO: this should come from lattice-ui-kit, maybe after the next release. current version v0.1.1
const APP_HEADER_BORDER :string = '#e6e6eb';

const AppHeaderOuterWrapper = styled.header`
  background-color: ${WHITE};
  border-bottom: 1px solid ${APP_HEADER_BORDER};
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
`;

const AppHeaderInnerWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  justify-content: space-between;
  max-width: ${APP_CONTAINER_MAX_WIDTH}px;
  min-width: ${APP_CONTAINER_WIDTH}px;
  padding: 0 ${APP_CONTENT_PADDING}px;
`;

const LeftSideContentWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-start;
`;

const RightSideContentWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  justify-content: flex-end;
`;

const LogoTitleWrapperLink = styled(Link)`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex: 0 0 auto;
  padding: 15px 0;
  text-decoration: none;

  &:focus {
    text-decoration: none;
  }

  &:hover {
    outline: none;
    text-decoration: none;
  }
`;

const AppLogoIcon = styled.img.attrs({
  alt: 'OpenLattice Logo Icon',
  src: OpenLatticeLogo,
})`
  height: 26px;
`;

const AppTitle = styled.h1`
  color: ${NEUTRALS[0]};
  font-size: 14px;
  font-weight: 600;
  line-height: normal;
  margin: 0 0 0 10px;
`;

const LogoutButton = styled(Button)`
  font-size: 12px;
  line-height: 16px;
  margin-left: 30px;
  padding: 6px 29px;
`;

const orgSelectStyles = {
  container: styles => ({
    ...styles,
    width: '200px',
  }),
  control: (styles, { isFocused, isSelected }) => ({
    ...styles,
    backgroundColor: (isFocused || isSelected) ? WHITE : NEUTRALS[8],
    borderColor: (isFocused || isSelected) ? PURPLES[1] : styles.borderColor,
    boxShadow: 'none',
    color: NEUTRALS[1],
    fontSize: '12px',
    lineHeight: 'normal',
    height: '30px',
    minHeight: '30px',
    ':hover': {
      borderColor: (isFocused || isSelected) ? PURPLES[1] : styles.borderColor,
    },
  }),
  menu: styles => ({ ...styles, width: '300px' }),
  option: styles => ({
    ...styles,
    backgroundColor: WHITE,
    color: NEUTRALS[0],
    fontSize: '12px',
    ':hover': {
      backgroundColor: PURPLES[6],
    },
  }),
};

type Props = {
  isInitializingApplication :boolean;
  logout :() => void;
  organizations :List;
  selectedOrganizationId :UUID;
  switchOrganization :typeof OrgsActions.switchOrganization;
};

class AppHeaderContainer extends Component<Props> {

  renderLeftSideContent = () => (
    <LeftSideContentWrapper>
      <LogoTitleWrapperLink to={Routes.ROOT}>
        <AppLogoIcon />
        <AppTitle>
          OpenLattice
        </AppTitle>
      </LogoTitleWrapperLink>
      <AppNavigationContainer />
    </LeftSideContentWrapper>
  )

  renderRightSideContent = () => {

    const { logout } = this.props;
    return (
      <RightSideContentWrapper>
        { this.renderOrgSelect() }
        <LogoutButton onClick={logout}>
          Log Out
        </LogoutButton>
      </RightSideContentWrapper>
    );
  }

  // TODO: perhaps extract out into its own component?
  renderOrgSelect = () => {

    const {
      isInitializingApplication,
      organizations,
      selectedOrganizationId,
      switchOrganization,
    } = this.props;

    const organizationOptions = organizations
      .map((organization :Map<*, *>) => ({
        label: organization.get('title'),
        value: organization.get('id'),
      }))
      .toJS();

    const handleOnChange = ({ value: orgId }) => {
      if (orgId !== selectedOrganizationId) {
        switchOrganization(orgId);
      }
    };

    return (
      <Select
          value={organizationOptions.find(option => option.value === selectedOrganizationId)}
          isClearable={false}
          isLoading={isInitializingApplication}
          isMulti={false}
          onChange={handleOnChange}
          options={organizationOptions}
          placeholder="Select..."
          styles={orgSelectStyles} />
    );
  }

  render() {

    return (
      <AppHeaderOuterWrapper>
        <AppHeaderInnerWrapper>
          { this.renderLeftSideContent() }
          { this.renderRightSideContent() }
        </AppHeaderInnerWrapper>
      </AppHeaderOuterWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => ({
  isInitializingApplication: state.getIn(['app', 'isInitializingApplication']),
  organizations: state.getIn(['orgs', 'organizations']),
  selectedOrganizationId: state.getIn(['orgs', 'selectedOrganizationId']),
});

// $FlowFixMe
export default withRouter(
  connect(mapStateToProps, {
    logout: AuthActionFactory.logout,
    switchOrganization: OrgsActions.switchOrganization,
  })(AppHeaderContainer)
);
