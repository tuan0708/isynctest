import React from 'react';
import htmlParse from 'html-react-parser';
import { checkSession, login, verifyOTP, refreshOTP, refreshCaptcha } from './api/isync';
import { App } from './app';
import { AppAdmin } from './appAdmin';
import { Redirect } from 'react-router-dom';
import { AppPropTrading } from './appPropTrading';

var userObj = null;

class Login extends React.Component {
  state = {
    captcha: '',
    redirectToOTP: false
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    refreshCaptcha().then(res => {
      this.setState({ captcha: res.d });
    });
  }

  loginClick = () => {
    var username = $('#username').val().toString().trim();
    var password = $('#password').val().toString().trim();
    var captcha = $('#captcha').val().toString().trim();
    if (username === '' || password === '') {
      $('#login-feedback').text('Vui lòng nhập đầy đủ thông tin').show();
      return;
    }
    $('#btnLogin').attr('disabled', '');
    login(username, password, captcha).then(res => {
      $('#btnLogin').removeAttr('disabled');
      if (res.s === 'ok') {
        userObj = res.d;
        this.setState({
          redirectToOTP: true
        });
      } else {
        $('#login-feedback').text(res.msg).show();
        if (res.newCaptcha !== undefined) {
          this.setState({ captcha: res.newCaptcha });
        }
      }
    });
  }
  render() {
    if (this.state.redirectToOTP === true) {
      if (userObj.accType === 'admin')
        return <AppAdmin userObj={userObj} />;
      else if (userObj.accType === 'propTrader')
        return <AppPropTrading userObj={userObj} />;
      return <OTP />
    }
    return (
      <div id='login'>
        <div className="header"></div>
        <div className="content-wrapper">
          <div className="logo-container mt-5 mb-4">
            <img id="logo-img" className="logo-img" src={require('./images/logo.png')} />
            <span className="logo-sub">iSync</span>
          </div>
          <div className="login-container">
            <div className="login-1stdiv">
              Xác thực tài khoản
                </div>
            <img className="login-2nddiv" src={require('./images/logo-login.png')} />
            <div className="login-3rddiv">
              <div className="input-container">
                <img className="input-icon" src={require('./images/input_user.png')} />
                <input type="text" id="username" className="input-text" placeholder="Username/Email" autoFocus
                  onKeyPress={e => {
                    if ((e.which || e.keyCode) === 13) this.loginClick();
                  }} />
              </div>
              <div className="input-container">
                <img className="input-icon" src={require('./images/input_pwd.png')} />
                <input type="password" id="password" className="input-text" placeholder="Mật khẩu"
                  onKeyPress={e => {
                    if ((e.which || e.keyCode) === 13) this.loginClick();
                  }} />
              </div>
              <div className="mt-1 text-center">
                {htmlParse(this.state.captcha)}
                <i className="lnr lnr-sync ml-3 font-weight-bold cursor-pointer" style={{ fontSize: '1.5em' }}
                  onClick={e => {
                    refreshCaptcha().then(res => {
                      this.setState({ captcha: res.d });
                    });
                  }}></i>
              </div>
              <div className="input-container">
                <img className="input-icon" src={require('./images/input_pwd.png')} />
                <input type="text" id="captcha" className="input-text" placeholder="Mã captcha" autoComplete="off"
                  onKeyPress={e => {
                    if ((e.which || e.keyCode) === 13) this.loginClick();
                  }} />
              </div>
              <div id="login-feedback" style={{ display: 'none', color: 'red', textAlign: 'center', marginTop: '10px' }}></div>
              <button id='btnLogin' className="login-btn btn-loading" onClick={this.loginClick}>Đăng nhập<div className="spiner"></div></button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

var countdownOTPInterval = null;

class OTP extends React.Component {
  state = {
    redirectToApp: false,
    countdownOTP: 100
  }
  componentDidMount() {
    if (countdownOTPInterval === null) {
      countdownOTPInterval = setInterval(() => {
        if (this.state.countdownOTP === 0) {
          clearInterval(countdownOTPInterval);
          countdownOTPInterval = null;
        }
        this.setState({ countdownOTP: this.state.countdownOTP - 1 });
      }, 1000);
    }
  }

  refreshClick = () => {
    this.setState({ countdownOTP: 100 });
    if (countdownOTPInterval === null) {
      countdownOTPInterval = setInterval(() => {
        if (this.state.countdownOTP === 0) {
          clearInterval(countdownOTPInterval);
          countdownOTPInterval = null;
        }
        this.setState({ countdownOTP: this.state.countdownOTP - 1 });
      }, 1000);
      refreshOTP(userObj.phone);
    }
  }

  verifyClick = () => {
    var otp = $('#otp').val().toString().trim();
    if (otp === '') {
      $('#login-feedback').text('Vui lòng nhập đầy đủ thông tin').show();
      return;
    }
    $('#btnVerify').attr('disabled', '');
    verifyOTP(userObj, otp).then(res => {
      $('#btnVerify').removeAttr('disabled');
      if (res.s === 'ok') {
        this.setState({
          redirectToApp: true
        });
      } else {
        $('#login-feedback').text(res.msg).show();
      }
    });

  }
  render() {
    if (this.state.redirectToApp === true) {
      clearInterval(countdownOTPInterval);
      return <App userObj={userObj} />;
    }
    return (
      <div id='login'>
        <div className="header"></div>
        <div className="content-wrapper">
          <div className="logo-container">
            <img id="logo-img" className="logo-img" src={require('./images/logo.png')} />
          </div>
          <div className="login-container">
            <div className="login-1stdiv">
              Xác thực OTP
                </div>
            <img className="login-2nddiv" src={require('./images/logo-login.png')} />
            <div className="login-3rddiv">
              <div className="input-container">
                <img className="input-icon" src={require('./images/input_pwd.png')} />
                <input type="text" id="otp" className="input-text" placeholder="Mã OTP" maxLength={6} autoFocus autoComplete='off'
                  onKeyPress={e => {
                    if ((e.which || e.keyCode) === 13) this.verifyClick();
                  }} />
                <span id="refresh-icon" className="ml-3 cursor-pointer">
                  {this.state.countdownOTP >= 0 ? (this.state.countdownOTP + 's') : (<i className="fas fa-redo" onClick={this.refreshClick}></i>)}
                </span>
              </div>
              <div id="login-feedback" style={{ display: 'none', color: 'red', textAlign: 'center', marginTop: '10px' }}></div>
              <button id='btnVerify' className="login-btn btn-loading" onClick={this.verifyClick}>Xác nhận<div className="spiner"></div></button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default function (ComposedComponent) {

  class RequireAuth extends React.Component {

    state = {
      isAuthenticated: null,
      userObj: null
    }

    componentWillMount() {
      checkSession().then(res => {
        if (res.s === 'ok' && res.d !== undefined) {
          this.setState({ isAuthenticated: true, userObj: res.d });
        } else {
          this.setState({ isAuthenticated: false });
        }
      });
    }

    render() {

      if (this.state.isAuthenticated === null)
        return (
          <div id='initLoading' className='loading-data'>
            <div className='spiner'></div>
          </div>
        )
      else if (!this.state.isAuthenticated) {
        return <Login />;
      }
      else if (this.state.userObj.accType !== 'admin' && window.location.pathname === '/admin') {
        return <Redirect to='/' />;
      }
      else if (this.state.userObj.accType === 'admin') {
        return <AppAdmin userObj={this.state.userObj} />;
      }
      else if (this.state.userObj.accType === 'propTrader') {
        return <AppPropTrading userObj={this.state.userObj} />;
      }
      return <ComposedComponent userObj={this.state.userObj} {...this.props} />
    }

  }

  return RequireAuth

}