/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { AuthActions } from 'lattice-auth';
import { Button, Colors, Input } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import OpenLatticeLogo from '../../assets/images/logo_v2.png';
import * as AppActions from './AppActions';
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
  height: 100%;
  justify-content: flex-start;
`;

const CenterContentWrapper = styled.div`
  display: flex;
  flex: 1 0 auto;
  height: 100%;
  justify-content: center;
`;

const RightSideContentWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-end;
`;

const LogoTitleWrapperLink = styled(Link)`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex: 0 0 auto;
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
  margin: 0 0 0 10px;
`;

// total button height
// line-height + padding + border
// 18 + 2*8px + 2*1px = 36px
const LogoutButton = styled(Button)`
  border: solid 1px ${NEUTRALS[4]};
  font-size: 12px;
  line-height: 18px;
  margin-left: 30px;
  padding: 8px 16px;
  width: 100px;
`;

const LogoutButtonWrapper = styled.div`
  padding: 12px 0;
`;

const SearchInput = styled(Input)`
  font-size: 12px;
  line-height: 18px;
  padding: 8px 16px;
`;

const SearchInputWrapper = styled.div`
  flex: 1 0 auto;
  max-width: 600px;
  padding: 12px 0;
`;

type Props = {
  logout :() => void;
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
    </LeftSideContentWrapper>
  )

  renderRightSideContent = () => {

    const { logout } = this.props;
    return (
      <RightSideContentWrapper>
        <LogoutButtonWrapper>
          <LogoutButton onClick={logout}>Log Out</LogoutButton>
        </LogoutButtonWrapper>
      </RightSideContentWrapper>
    );
  }

  renderSearch = () => (
    <CenterContentWrapper>
      <SearchInputWrapper>
        <SearchInput />
      </SearchInputWrapper>
    </CenterContentWrapper>
  )

  render() {

    return (
      <AppHeaderOuterWrapper>
        <AppHeaderInnerWrapper>
          { this.renderLeftSideContent() }
          { this.renderSearch() }
          { this.renderRightSideContent() }
        </AppHeaderInnerWrapper>
      </AppHeaderOuterWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => ({
  initAppRequestState: state.getIn(['app', AppActions.INITIALIZE_APPLICATION, 'requestState']),
});

// $FlowFixMe
export default withRouter(
  connect(mapStateToProps, {
    logout: AuthActions.logout,
  })(AppHeaderContainer)
);
