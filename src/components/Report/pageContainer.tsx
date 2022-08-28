import * as React from 'react';
import { connect } from 'react-redux';
import { State } from '../../reducers';
import { Report } from './page';

const mapStateToProps = (state: State, ownProps: any) => ({
  groups: state.accountManager.groups,
  allSubAccs: state.accountManager.allSubAccs
});

const mapDispatchToProps = (dispatch) => ({
  
});

export const ReportContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Report);
