import * as React from 'react';
import { connect } from 'react-redux';
import { State } from '../../reducers';
import { Header } from './page';

const mapStateToProps = (state: State, ownProps: any) => ({
  
});

const mapDispatchToProps = (dispatch) => ({
  
});

export const HeaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Header);
