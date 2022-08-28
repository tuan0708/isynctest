import * as React from 'react';
import { AdminManagerContainer } from './components'

interface Props {
  userObj: any
}

export class AppAdmin extends React.Component<Props> {

  render() {
    return (
      <div id="wrapper">
        <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
          <a className="sidebar-brand d-flex align-items-center justify-content-center" href="index.html">
            <div className="sidebar-brand-icon rotate-n-15">
              <i className="fas fa-laugh-wink"></i>
            </div>
            <div className="sidebar-brand-text mx-3">iSync Admin</div>
          </a>
          <hr className="sidebar-divider my-0" />
          <li className="nav-item active">
            <a className="nav-link" href="#">
              <i className="fas fa-fw fa-tachometer-alt"></i>
              <span>Dashboard</span></a>
          </li>
          <hr className="sidebar-divider" />
          <div className="sidebar-heading">
            Interface
          </div>
          <li className="nav-item">
            <a className="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
              <i className="fas fa-fw fa-cog"></i>
              <span>Users</span>
            </a>
            <div id="collapseTwo" className="collapse" aria-labelledby="headingTwo" data-parent="#accordionSidebar">
            </div>
          </li>

          
        </ul>
        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow" >
              <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
                <i className="fa fa-bars"></i>
              </button>
              <ul className="navbar-nav ml-auto">
                <div className="topbar-divider d-none d-sm-block"></div>
                <li className="nav-item dropdown no-arrow">
                  <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span className="mr-2 d-none d-lg-inline text-gray-600 small">Admin</span>
                    <img className="img-profile rounded-circle" src="assets/images/logo-login.png" />
                  </a>
                  <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                    <a className="dropdown-item" href={location.origin + '/isync/logout'}>
                      <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                      Logout
                  </a>
                  </div>
                </li>
              </ul>
            </nav>
            <div className="container-fluid">
              <div className="row">
                <div className="col-xl">
                  <div className="card border-left-success shadow h-100 py-2">
                    <div className="card-body">
                      <div className={"tab-pane"} id={"group-"}>
                        <AdminManagerContainer userObj={this.props.userObj} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <footer className="sticky-footer bg-white">
              <div className="container my-auto">
                <div className="copyright text-center my-auto">
                  <span>Copyright &copy; BSC 2020</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    )
  }
}
