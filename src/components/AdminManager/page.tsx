import * as React from 'react';

interface Props {
  userObj: any,
  initAdminManager: (userId) => void,
  addAccount: (userId, name, phone, email, pass) => void,
  editAccount: (userId, id, name, phone, email) => void,
  deleteAccount: (userId, id) => void,
  resetPassAccount: (userId, id, phone) => void,
  accounts: any
}
var currentID = null;
export class AdminManager extends React.Component<Props, {}>
{
  state = {

  }

  constructor(props) {
    super(props);
    this.saveAccount = this.saveAccount.bind(this)
  }

  componentDidMount() {
    // console.log(this.props.userObj);
    this.props.initAdminManager(this.props.userObj.email);
  }

  saveAccount() {
    if (currentID == null) {
      this.props.addAccount(this.props.userObj.email, $('#accountName').val().toString().trim(),
        $('#accountPhone').val().toString().trim(),
        $('#accountEmail').val().toString().trim(),
        $('#accountPass').val().toString().trim());
    }
    else {
      this.props.editAccount(this.props.userObj.email, currentID,
        $('#accountName').val().toString().trim(),
        $('#accountPhone').val().toString().trim(),
        $('#accountEmail').val().toString().trim())
    }
  }

  render() {
    var { accounts } = this.props;
    accounts.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
    return <div>
      <button className="btn btn-primary my-3" data-toggle="modal" data-target="#addAccountModal"
        onClick={e => {
          $('#subAccountSelect').val('');
          currentID = null;
          $('#accountName').val('')
          $('#accountPhone').val('')
          $('#accountEmail').val('')
          $('#accountPass').val('')
          $('#accountPass').removeAttr('readonly')
        }}>Thêm tài khoản</button>
      <table className="table table-bordered table-hover table-striped mb-0">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Email</th>
            <th scope="col">Họ tên</th>
            <th scope="col">Số điện thoại</th>
            <th scope="col" style={{ width: '82px' }}>Sửa</th>
            <th scope="col" style={{ width: '82px' }}>Xóa</th>
            <th scope="col" style={{ width: '120px' }}>Reset pass</th>
          </tr>
        </thead>
        <tbody>
          {accounts.length === 0 ?
            (<tr><td colSpan={7} className="text-center">Không có dữ liệu hiển thị</td></tr>)
            : (accounts.map(itm => {
              return (
                <tr key={itm.id}>
                  <td>{itm.id}</td>
                  <td>{itm.email}</td>
                  <td>{itm.name}</td>
                  <td>{itm.phone}</td>
                  <td className="text-center">
                    <button className="btn btn-success" style={{ padding: '1px 5px' }}
                      title="Sửa tài khoản" data-toggle="modal" data-target="#addAccountModal"
                      onClick={e => {
                        currentID = itm.id
                        $('#addAccountModal .modal-title').text('Sửa tài khoản')
                        $('#accountName').val(itm.name)
                        $('#accountPhone').val(itm.phone)
                        $('#accountEmail').val(itm.email)
                        $('#accountPass').attr("readonly", "readonly")
                      }}><span className="lnr lnr-pencil"></span></button>
                  </td>
                  <td className="text-center">
                    <button className="btn btn-danger" style={{ padding: '1px 5px' }} title="Xóa" onClick={e => {
                      if (confirm('Bạn có chắc chắn muốn xóa tài khoản [' + itm.email + ']?'))
                        this.props.deleteAccount(this.props.userObj.email, itm.id);
                    }}>
                      <span className="lnr lnr-cross"></span>
                    </button>
                  </td>
                  <td className="text-center">
                    <button className="btn btn-warning" style={{ padding: '1px 5px' }} title="Reset pass" onClick={e => {
                      if (confirm('Bạn có chắc chắn muốn reset password tài khoản [' + itm.email + ']?'))
                        this.props.resetPassAccount(this.props.userObj.email, itm.id, itm.phone);
                    }}>
                      <span className="lnr lnr-sync"></span>
                    </button>
                  </td>
                </tr>
              );
            }))}
        </tbody>
      </table>
      <div className="modal fade" id="addAccountModal" data-backdrop="static" role="dialog" aria-labelledby="addAccountModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addAccountModalLabel">Thêm account mới</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="accountName">Họ tên</label>
                <input type="text" className="form-control" id="accountName" />
                <br />
                <label htmlFor="accountPhone">Phone</label>
                <input type="text" className="form-control" id="accountPhone" />
                <br />
                <label htmlFor="accountEmail">Email</label>
                <input type="text" className="form-control" id="accountEmail" />
                <br />
                <label htmlFor="accountPass">Password</label>
                <input type="text" className="form-control" id="accountPass" />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" id="btnSaveAccount" className="btn btn-primary" onClick={this.saveAccount}><i className="fas fa-check mr-2"></i>Lưu</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  }
}
