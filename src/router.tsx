import * as React from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { App } from './app';
import { Provider } from 'react-redux';
import { store } from './store';
import RequireAuth from './RequireAuth';
import { AppAdmin } from './appAdmin';

import toastr from 'toastr';
toastr.options = {
  "closeButton": true,
}

const testComponent = () => {
  return (
    <iframe width='100%' src='https://www.bsc.com.vn/dang-ky'></iframe>
  )
}

export const AppRouter: React.StatelessComponent<{}> = () => {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route exact path='/' component={RequireAuth(App)} />
          <Route path='/admin' component={RequireAuth(AppAdmin)} />
          <Route path='/test' component={testComponent} />
        </Switch>
      </Router>
    </Provider>
  );
}