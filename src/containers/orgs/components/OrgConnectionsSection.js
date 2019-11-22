/*
 * @flow
 */

import React, { Component } from 'react';

import { List, Map } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import {
  Card,
  Input,
  MinusButton,
  PlusButton,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as OrgsActions from '../OrgsActions';
import * as ReduxActions from '../../../core/redux/ReduxActions';
import {
  ActionControlWithButton,
  CompactCardSegment,
  SpinnerOverlayCard,
} from './styled';
import { SectionGrid } from '../../../components';
import { isNonEmptyString } from '../../../utils/LangUtils';
import type { ResetRequestStateAction } from '../../../core/redux/ReduxActions';

const {
  ADD_CONNECTION,
  REMOVE_CONNECTION,
} = OrgsActions;

type Props = {
  actions :{
    addConnection :RequestSequence;
    removeConnection :RequestSequence;
    resetRequestState :ResetRequestStateAction;
  };
  isOwner :boolean;
  org :Map;
  requestStates :{
    ADD_CONNECTION :RequestState;
    REMOVE_CONNECTION :RequestState;
  };
};

type State = {
  isValidConnection :boolean;
  valueOfConnection :string;
};

class OrgConnectionsSection extends Component<Props, State> {

  state = {
    isValidConnection: true,
    valueOfConnection: '',
  }

  componentDidUpdate(props :Props) {

    const { requestStates } = this.props;
    if (props.requestStates[ADD_CONNECTION] === RequestStates.PENDING
        && requestStates[ADD_CONNECTION] === RequestStates.SUCCESS) {
      this.setState({
        isValidConnection: true,
        valueOfConnection: '',
      });
    }
  }

  handleOnChangeConnection = (event :SyntheticInputEvent<HTMLInputElement>) => {

    const { isOwner } = this.props;
    const valueOfConnection :string = event.target.value || '';

    if (AuthUtils.isAdmin() && isOwner) {
      // always set isValidConnection to true when typing
      this.setState({ valueOfConnection, isValidConnection: true });
    }
  }

  handleOnClickAddConnection = () => {

    const { actions, isOwner, org } = this.props;
    const { valueOfConnection } = this.state;

    if (AuthUtils.isAdmin() && isOwner) {

      if (!isNonEmptyString(valueOfConnection)) {
        // set to false only when the button was clicked
        this.setState({ isValidConnection: false });
        return;
      }

      const isNewConnection :boolean = org.get('connections', List())
        .filter((connection :string) => connection === valueOfConnection)
        .isEmpty();

      if (isNewConnection) {
        actions.addConnection({
          connection: valueOfConnection,
          organizationId: org.get('id'),
        });
      }
      else {
        // set isValidConnection to false only when the button was clicked
        this.setState({ isValidConnection: false });
      }
    }
  }

  handleOnClickRemoveConnection = (connection :string) => {

    const { actions, isOwner, org } = this.props;

    if (AuthUtils.isAdmin() && isOwner) {
      actions.removeConnection({
        connection,
        organizationId: org.get('id'),
      });
    }
  }

  render() {

    const { isOwner, org, requestStates } = this.props;
    const { isValidConnection } = this.state;

    if (!AuthUtils.isAdmin()) {
      return null;
    }

    const connections = org.get('connections', List());
    const connectionCardSegments = connections.map((connection :string) => (
      <CompactCardSegment key={connection}>
        <span title={connection}>{connection}</span>
        {
          isOwner && (
            <MinusButton mode="negative" onClick={() => this.handleOnClickRemoveConnection(connection)} />
          )
        }
      </CompactCardSegment>
    ));

    return (
      <SectionGrid>
        <h2>Connections</h2>
        {
          AuthUtils.isAdmin() && isOwner && (
            <div>
              <ActionControlWithButton>
                <Input
                    invalid={!isValidConnection}
                    onChange={this.handleOnChangeConnection}
                    placeholder="Add a new connection" />
                <PlusButton
                    isLoading={requestStates[ADD_CONNECTION] === RequestStates.PENDING}
                    mode="positive"
                    onClick={this.handleOnClickAddConnection} />
              </ActionControlWithButton>
            </div>
          )
        }
        <div>
          {
            connectionCardSegments.isEmpty()
              ? (
                <i>No connections</i>
              )
              : (
                <Card>{connectionCardSegments}</Card>
              )
          }
          {
            !connectionCardSegments.isEmpty() && requestStates[REMOVE_CONNECTION] === RequestStates.PENDING && (
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
    [ADD_CONNECTION]: state.getIn(['orgs', ADD_CONNECTION, 'requestState']),
    [REMOVE_CONNECTION]: state.getIn(['orgs', REMOVE_CONNECTION, 'requestState']),
  },
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    addConnection: OrgsActions.addConnection,
    removeConnection: OrgsActions.removeConnection,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgConnectionsSection);
