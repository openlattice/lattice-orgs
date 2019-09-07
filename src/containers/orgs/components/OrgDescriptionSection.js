/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { Form } from 'lattice-fabricate';
import { Colors, EditButton } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as ReduxActions from '../../../core/redux/ReduxActions';
import { isNonEmptyString } from '../../../utils/LangUtils';

const { NEUTRALS } = Colors;
const { UPDATE_ORG_DESCRIPTION } = OrganizationsApiActions;

const EditButtonAligned = styled(EditButton)`
  align-self: flex-start;
`;

const dataSchema = {
  properties: {
    description: {
      title: 'Edit organization\'s description',
      type: 'string',
    },
  },
  title: '',
  type: 'object',
};

export const uiSchema = {
  description: {
    classNames: 'column-span-12',
    'ui:widget': 'textarea',
  },
};

const OrgDescriptionHeader = styled.h3`
  font-size: 20px;
  font-weight: normal;
  margin: 0;
  updateOrganizationDescription: 0;
`;

const FormInCardSegment = styled(Form)`
  flex: 1;
  margin: -30px;
`;

const NoDescription = styled.i`
  color: ${NEUTRALS[1]};
  font-size: 16px;
  font-weight: normal;
`;

type Props = {
  actions :{
    resetRequestState :(actionType :string) => void;
    updateOrganizationDescription :RequestSequence;
  };
  isOwner :boolean;
  org :Map;
  requestStates :{
    UPDATE_ORG_DESCRIPTION :RequestState;
  };
};

type State = {
  data :{
    description :string;
  };
  isEditing :boolean;
};

class OrgDescriptionSection extends Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      data: {
        description: props.org.get('description', ''),
      },
      isEditing: false,
    };
  }

  componentDidUpdate(prevProps :Props) {

    const { requestStates } = this.props;

    if (requestStates[UPDATE_ORG_DESCRIPTION] === RequestStates.SUCCESS
        && prevProps.requestStates[UPDATE_ORG_DESCRIPTION] === RequestStates.PENDING) {
      this.setState({ isEditing: false });
    }
  }

  handleOnChange = ({ formData } :Object) => {

    this.setState({
      data: {
        description: formData.description || '',
      },
    });
  }

  handleOnClickDiscard = () => {

    this.setState({ isEditing: false });
  }

  handleOnClickEdit = () => {

    const { isOwner } = this.props;
    if (isOwner) this.setState({ isEditing: true });
  }

  handleOnClickSubmit = ({ formData } :Object) => {

    const { actions, isOwner, org } = this.props;
    if (isOwner) {
      actions.updateOrganizationDescription({
        description: formData.description,
        organizationId: org.get('id'),
      });
    }
  }

  render() {

    const { isOwner, org, requestStates } = this.props;
    const { data, isEditing } = this.state;
    const description :string = org.get('description', '');

    if (isOwner && isEditing) {
      return (
        <FormInCardSegment
            formData={data}
            isSubmitting={requestStates[UPDATE_ORG_DESCRIPTION] === RequestStates.PENDING}
            onChange={this.handleOnChange}
            onDiscard={this.handleOnClickDiscard}
            onSubmit={this.handleOnClickSubmit}
            schema={dataSchema}
            uiSchema={uiSchema} />
      );
    }

    if (isOwner) {
      return (
        <>
          {
            isNonEmptyString(description)
              ? <OrgDescriptionHeader>{description}</OrgDescriptionHeader>
              : <NoDescription>No description</NoDescription>
          }
          <EditButtonAligned onClick={this.handleOnClickEdit} />
        </>
      );
    }

    return (
      <OrgDescriptionHeader>{description}</OrgDescriptionHeader>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => ({
  requestStates: {
    [UPDATE_ORG_DESCRIPTION]: state.getIn(['orgs', UPDATE_ORG_DESCRIPTION, 'requestState']),
  },
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    updateOrganizationDescription: OrganizationsApiActions.updateOrganizationDescription,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgDescriptionSection);
