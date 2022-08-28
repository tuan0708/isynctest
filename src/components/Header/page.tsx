import * as React from 'react';
import { LARGE_SCREEN, showToast } from '../../common/constants/app';
import { changePass } from '../../api/isync';

interface Props {
  width: number
  userObj: any
}

export class Header extends React.Component<Props, {}> {

  constructor(props) {
    super(props);
    this.saveChangePass = this.saveChangePass.bind(this);
  }

  componentDidMount() {
    if (this.props.userObj.firstlogin !== 'N') {
      $('a[data-target="#changePassModal"]')[0].click();
    }
  }

  saveChangePass() {
    var oldPass = $('#oldPass').val().toString();
    var newPass = $('#newPass').val().toString();
    var confirmNewPass = $('#confirmNewPass').val();
    if (oldPass === '' || newPass === '' || confirmNewPass === '') {
      $('#oldPass, #newPass, #confirmNewPass').addClass('is-invalid');
      $('#changepass-feedback').text("Vui lòng điền đầy đủ thông tin").show();
      return;
    }
    var regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regexPass.test(newPass)){
      $('#newPass, #confirmNewPass').addClass('is-invalid');
      $('#changepass-feedback').text("Mật khẩu phải từ 8 ký tự trở lên, bao gồm chữ thường, chữ in hoa, số và ký tự đặc biệt").show();
      return;
    }
    if (newPass === oldPass) {
      $('#newPass').addClass('is-invalid');
      $('#changepass-feedback').text("Mật khẩu mới phải khác với mật khẩu hiện tại").show();
      return;
    }
    if (newPass !== confirmNewPass) {
      $('#confirmNewPass').addClass('is-invalid');
      $('#changepass-feedback').text("Xác nhận mật khẩu mới không đúng").show();
      return;
    }
    changePass(this.props.userObj.id, oldPass, newPass).then(res => {
      if (res.s === 'ok') {
        $('#changePassModal .close').click();
        showToast('Thông báo', res.msg, 'success');
      } else if (res.s === 'wrong') {
        $('#oldPass').addClass('is-invalid');
        $('#changepass-feedback').text(res.msg).show();
      } else {
        $('#changePassModal .close').click();
        showToast('Thông báo', res.msg, 'error', 1000000);
      }
    });
  }

  render() {
    var menuTab = null;
    if (this.props.width >= LARGE_SCREEN) {
      menuTab = (<ul className="nav nav-tabs float-left ml-4" role="tablist">
        <li className="nav-item">
          <a className="nav-link active" data-toggle="tab" href="#TransactionTab">
            Giao dịch</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" data-toggle="tab" href="#AccountManagerTab">Quản lý khách hàng</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" data-toggle="tab" href="#ReportTab">Báo cáo</a>
        </li>
      </ul>);
    } else {
      menuTab = (<ul className="nav nav-tabs float-left ml-4" role="tablist">
        <li className="nav-item">
          <a className="nav-link active" data-toggle="tab" href="#TransactionTab">
            <div id='trading-icon' className='toolbar-tab-item'>
              <i className="lnr lnr-arrow-up" style={{ fontSize: '1.1rem' }}></i>
              <i className="lnr lnr-arrow-down" style={{ fontSize: '1.1rem' }}></i>
            </div>
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" data-toggle="tab" href="#AccountManagerTab">
            <div id='accmanager-icon' className='toolbar-tab-item'>
              <i className="lnr lnr-users toolbar-icon-lg" style={{ fontSize: '1.55rem' }}></i>
            </div>
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" data-toggle="tab" href="#ReportTab">
            <div id='report-icon' className='toolbar-tab-item'>
              <i className="lnr lnr-file-empty toolbar-icon-lg"></i>
            </div>
          </a>
        </li>
      </ul>);
    }
    return (
      <div>
        <div id="navbar" className="px-2">
          <div className="w-100 float-right">
            <img src={require('../../images/logo.png')} width={105} className="float-left p-2" />
            {menuTab}
            <div className="float-right">
              <i className="lnr lnr-user toolbar-icon-lg p-2 cursor-pointer" style={{ lineHeight: '2' }}
                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></i>
              <div className="dropdown-menu dropdown-menu-right">
                <a className="dropdown-item" href="#" data-toggle="modal" data-target="#userProfileModal">Hồ sơ người dùng</a>
                <a className="dropdown-item" href="#" data-toggle="modal" data-target="#changePassModal"
                  onClick={e => {
                    $('#oldPass, #newPass, #confirmNewPass').removeClass('is-invalid').val('');
                    $('#changepass-feedback').hide();
                  }}>Đổi mật khẩu</a>
                <div className="dropdown-divider"></div>
                <span className="dropdown-item cursor-pointer" onClick={(e) => {
                  window.location.assign(location.origin + '/isync/logout');
                }}>Đăng xuất</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal fade" id="userProfileModal" data-backdrop="static" role="dialog" aria-labelledby="userProfileModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="userProfileModalLabel">Hồ sơ người dùng</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <table>
                  <tr>
                    <td style={{ width: '150px' }}><strong>Họ và tên</strong></td><td>{this.props.userObj.name}</td>
                  </tr>
                  <tr>
                    <td><strong>Email</strong></td><td>{this.props.userObj.email}</td>
                  </tr>
                  <tr>
                    <td><strong>Số điện thoại</strong></td><td>{this.props.userObj.phone}</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="modal fade" id="changePassModal" data-backdrop="static" role="dialog" aria-labelledby="changePassModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="changePassModalLabel">Đổi mật khẩu</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="groupName">Mật khẩu hiện tại</label>
                  <input type="password" className="form-control" id="oldPass" autoComplete='off'
                    onFocus={e => {
                      $(e.target).removeClass('is-invalid');
                    }}
                    onKeyPress={e => {
                      if ((e.which || e.keyCode) === 13) this.saveChangePass();
                    }} />
                </div>
                <div className="form-group">
                  <label htmlFor="groupName">Mật khẩu mới</label>
                  <input type="password" className="form-control" id="newPass" autoComplete='off'
                    onFocus={e => {
                      $(e.target).removeClass('is-invalid');
                    }}
                    onKeyPress={e => {
                      if ((e.which || e.keyCode) === 13) this.saveChangePass();
                    }} />
                  <small className="form-text text-muted">
                    Mật khẩu phải từ 8 ký tự trở lên, bao gồm chữ thường, chữ in hoa, số và ký tự đặc biệt.
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="groupName">Xác nhận mật khẩu mới</label>
                  <input type="password" className="form-control" id="confirmNewPass" autoComplete='off'
                    onFocus={e => {
                      $(e.target).removeClass('is-invalid');
                    }}
                    onKeyPress={e => {
                      if ((e.which || e.keyCode) === 13) this.saveChangePass();
                    }} />
                </div>
                <div id="changepass-feedback" style={{ display: 'none', color: 'red', textAlign: 'center', marginTop: '10px' }}></div>
              </div>
              <div className="modal-footer">
                <button type="button" id="btnSaveGroup" className="btn btn-primary" onClick={this.saveChangePass}><i className="fas fa-check mr-2"></i>Lưu</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
