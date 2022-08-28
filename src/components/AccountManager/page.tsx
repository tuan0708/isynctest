import * as React from 'react';
import { openSSOLoginPopup, closeSSOLoginPopup, showToast } from '../../common/constants/app';
import { getCustodyLink, deleteCustodyLink } from '../../api/isync';

interface Props {
  height: number,
  userObj: any,
  custodyLink: any,
  groups: any,
  groupSelected: number,
  allSubAccs: any,
  initAccountManager: (userId, custodyLink) => void,
  changeGroup: (groupId) => void,
  addGroup: (userId, groupName) => void,
  editGroup: (userId, groupId, groupName) => void,
  deleteGroup: (userId, groupId) => void,
  addSubAccount: (userId, subAccObj) => void,
  deleteSubAccount: (userId, subAccount) => void,
  refreshAccountSummary: (userId, showLoading) => void,
  subAccountChecked: (userId, custody, subAcc, subAccName, groupId, checkedQtty, isInit, isChecked) => void,
  subAccountUnchecked: (userId, groupId, subAcc, isSave) => void,
}

export class AccountManager extends React.Component<Props, {}> {

  state = {
    subAccSelectBox: []
  }

  constructor(props) {
    super(props);
    this.addCustodyLink = this.addCustodyLink.bind(this);
    this.onChangeCustody = this.onChangeCustody.bind(this);
    this.saveGroup = this.saveGroup.bind(this);
    this.addSubAcc = this.addSubAcc.bind(this);
  }

  componentDidMount() {
    getCustodyLink(this.props.userObj.id).then(res => {
      this.props.initAccountManager(this.props.userObj.id, res);
    });
  }

  addCustodyLink() {
    getCustodyLink(this.props.userObj.id, true).then(res => {
      setTimeout(() => {
        closeSSOLoginPopup();
      }, 1500);
      this.props.initAccountManager(this.props.userObj.id, res);
      this.props.refreshAccountSummary(this.props.userObj.id, false);
    });
    openSSOLoginPopup();
  }

  saveGroup() {
    // console.log($('input[name=optradio]:checked', '#myForm').val());
    if ($('#groupName').val() === '') {
      $('#groupName').addClass('is-invalid').focus();
      showToast('Thông báo', 'Vui lòng điền đầy đủ thông tin', 'error', 1000000);
      return;
    }

    if ($('input[name=optradio]:checked', '#myForm').val() === undefined) {
      showToast('Thông báo', 'Vui lòng chọn loại giao dịch', 'error', 1000000);
      return;
    }

    var groupName = $('input[name=optradio]:checked', '#myForm').val().toString() + ' ' + $('#groupName').val().toString().trim();

    var groupId = $('#btnSaveGroup').attr('groupId');
    if (groupId === undefined) {
      this.props.addGroup(this.props.userObj.id, groupName);
    } else {
      this.props.editGroup(this.props.userObj.id, Number(groupId), groupName);
    }
  }

  onChangeCustody(e) {
    var custodyObj = this.props.custodyLink.find(c => c.custody === e.target.value);
    var subAccSelectBox = custodyObj.subAccounts.map(itm => {
      if (this.props.allSubAccs.findIndex(s => s.subaccount === itm.id) >= 0)
        return (
          <option value={itm.id} disabled>{itm.id + ' - ' + custodyObj.name + '.' + itm.type}</option>
        );
      return (
        <option value={itm.id}>{itm.id + ' - ' + custodyObj.name + '.' + itm.type}</option>
      );
    });
    this.setState({ subAccSelectBox: subAccSelectBox });
  }

  addSubAcc() {
    if ($('#custodySelect').val() === '' || $('#subAccountSelect').val() === '') {
      if ($('#custodySelect').val() === '') $('#custodySelect').addClass('is-invalid');
      else $('#subAccountSelect').addClass('is-invalid');
      showToast('Thông báo', 'Vui lòng điền đầy đủ thông tin', 'error', 1000000);
      return;
    }
    
    var subAccountFull = $('#subAccountSelect :selected').text();
    var subAccount = $('#subAccountSelect').val();
    var grName = $('#ulGroups .nav-link.active').text();
    debugger;
    if (grName.includes('[PS]') && !subAccountFull.includes('FDS')){
      showToast('Thông báo', 'Vui lòng chọn tài khoản phái sinh', 'error', 100000);
      return;
    }

    if (grName.includes('[CS]') && subAccountFull.includes('FDS')){
      showToast('Thông báo', 'Vui lòng chọn tài khoản cơ sở', 'error', 100000);
      return;
    }
     
    var custodyObj = this.props.custodyLink.find(c => c.custody === $('#custodySelect').val());
    this.props.addSubAccount(this.props.userObj.id, {
      id: Number($('#ulGroups .nav-link.active').attr('group-id')),
      name: $('#subAccountSelect option:selected').text().split('.')[1],
      userid: this.props.userObj.id,
      subaccount: subAccount,
      groupid: Number($('#ulGroups .nav-link.active').attr('group-id')),
      custody: custodyObj.custody,
      customername: custodyObj.name,
      subaccountname: $('#subAccountSelect').val() + ' - ' + $('#subAccountSelect option:selected').text().split('.')[1]
    });
    this.props.subAccountChecked(this.props.userObj.id, custodyObj.custody,
      $('#subAccountSelect').val(), $('#subAccountSelect option:selected').text().split('.')[1],
      Number($('#ulGroups .nav-link.active').attr('group-id')),
      1, true, false);
  }

  render() {
    // console.log(  $('input[name=optradio]:checked', '#myForm').val())
    var custodyLinkItem = [], groupsTabItem = [], groupsContent = [];
    var custodySelectBox = [];
    this.props.custodyLink.forEach(itm => {
      custodyLinkItem.push(<tr>
        <td>{itm.custody}</td>
        <td>{itm.name}</td>
        <td className="text-center">
          <button className="btn btn-success btn-sm mr-1" style={{ padding: '2px 6px' }}
            onClick={this.addCustodyLink} title="Liên kết lại">
            <span className="lnr lnr-redo"></span>
          </button>
          <button className="btn btn-warning" style={{ padding: '1px 5px' }}
            title="Hủy liên kết" onClick={e => {
              var subAccObjs = this.props.allSubAccs.filter(s => s.custody === itm.custody);
              if (subAccObjs.length) {
                if (confirm('Tài khoản có tiểu khoản đang được liên kết. Bạn có chắc chắn muốn hủy liên kết tài khoản [' + itm.custody + ']?')) {
                  deleteCustodyLink(this.props.userObj.id, itm.custody).then(res => {
                    this.props.initAccountManager(this.props.userObj.id, res);
                  });
                  subAccObjs.forEach(elSubAcc => {
                    this.props.deleteSubAccount(this.props.userObj.id, elSubAcc.subaccount);
                  });
                }
              } else if (confirm('Bạn có chắc chắn muốn hủy liên kết tài khoản [' + itm.custody + ']?')) {
                deleteCustodyLink(this.props.userObj.id, itm.custody).then(res => {
                  this.props.initAccountManager(this.props.userObj.id, res);
                });
              }
            }}><span className="lnr lnr-unlink"></span></button>
        </td>
      </tr>);

      if (itm.subAccounts.length === this.props.allSubAccs.filter(s => s.custody === itm.custody).length) {
        custodySelectBox.push(
          <option value={itm.custody} disabled>{itm.custody}</option>
        );
      } else {
        custodySelectBox.push(
          <option value={itm.custody}>{itm.custody}</option>
        );
      }
    });
    this.props.groups.forEach((itm, index) => {
      groupsTabItem.push(<li key={itm.id} className="nav-item">
        <a className={"nav-link" + (itm.id === this.props.groupSelected ? ' active' : '')} data-toggle="tab"
          href={'#group-' + itm.id} group-id={itm.id} onClick={e => { this.props.changeGroup(itm.id) }}>{itm.name}</a>
      </li>);
      var subAccs = this.props.allSubAccs.filter(el => el.groupid === itm.id);
      groupsContent.push(
        <div className={"tab-pane" + (itm.id === this.props.groupSelected ? ' active' : '')} id={"group-" + itm.id}>
          <button className="btn btn-primary my-3" data-toggle="modal" data-target="#addSubAccountModal"
            onClick={e => {
              $('#custodySelect, #subAccountSelect').val('');
            }}>Thêm tiểu khoản</button>
          <table className="table table-bordered table-hover table-striped mb-0">
            <thead>
              <tr>
                <th scope="col">Họ và tên</th>
                <th scope="col">Tài khoản</th>
                <th scope="col">Tiểu khoản</th>
                <th scope="col">Tên gợi nhớ</th>
                <th scope="col" style={{ width: '82px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {subAccs.length === 0 ?
                (<tr><td colSpan={5} className="text-center">Không có dữ liệu hiển thị</td></tr>)
                : (subAccs.map(ele => {
                  return (
                    <tr key={ele.subaccount}>
                      <td>{ele.customername}</td>
                      <td>{ele.custody}</td>
                      <td>{ele.subaccount}</td>
                      <td>{ele.subaccountname}</td>
                      <td className="text-center">
                        <button className="btn btn-danger" style={{ padding: '1px 5px' }} title="Xóa" onClick={e => {
                          if (confirm('Bạn có chắc chắn muốn xóa tiểu khoản [' + ele.subaccount + ']?'))
                            this.props.deleteSubAccount(this.props.userObj.id, ele.subaccount);
                          this.props.subAccountUnchecked(this.props.userObj.id, ele.groupid, ele.subaccount, true);
                        }}>
                          <span className="lnr lnr-cross"></span>
                        </button>
                      </td>
                    </tr>
                  );
                }))}
            </tbody>
          </table>
        </div>
      );
    });

    return (
      <div className="row mx-0 mt-3">
        <div className="col-lg-5 col-md-12 px-2 mb-3">
          <div className="card shadow">
            <div className="card-header">
              <h6 className="mb-0">Liên kết tài khoản</h6>
            </div>
            <div className="card-body">
              <button className="btn btn-primary" onClick={this.addCustodyLink}>
                Thêm liên kết
              </button>
              <table className="table table-bordered table-hover table-striped mb-0 mt-3">
                <thead>
                  <tr>
                    <th scope="col">Tài khoản</th>
                    <th scope="col">Họ và tên</th>
                    <th scope="col" style={{ width: '100px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {custodyLinkItem.length ? custodyLinkItem : (<tr><td colSpan={3} className="text-center">Không có dữ liệu hiển thị</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-7 col-md-12 px-2 mb-3">
          <div className="card shadow">
            <div className="card-header">
              <h6 className="mb-0">Nhóm tiểu khoản</h6>
            </div>
            <div className="card-body" style={{ minHeight: '188px' }}>
              <div className="tab-pane-header px-2">
                <ul id="ulGroups" className="nav nav-tabs-type2 float-left mr-2" role="tablist">
                  {groupsTabItem}
                </ul>
                <button className="btn btn-primary" style={{ padding: '1px 5px', margin: '5px 2px' }} title="Thêm nhóm"
                  onClick={e => {
                    $('#addGroupModal .modal-title').text('Thêm nhóm mới');
                    $('#btnSaveGroup').removeAttr('groupId');
                    $('#groupName').val('');
                  }}
                  data-toggle="modal" data-target="#addGroupModal"><span className="lnr lnr-plus-circle"></span></button>
                {this.props.groups.length ?
                  (<span><button className="btn btn-success" style={{ padding: '1px 5px', margin: '5px 2px' }}
                    title="Sửa tên nhóm" data-toggle="modal" data-target="#addGroupModal"
                    onClick={e => {
                      $('#addGroupModal .modal-title').text('Sửa tên nhóm');
                      $('#btnSaveGroup').attr('groupId', $('#ulGroups .nav-link.active').attr('group-id'));
                      $('#groupName').val($('#ulGroups .nav-link.active').text());
                    }}><span className="lnr lnr-pencil"></span></button>
                    <button className="btn btn-danger" style={{ padding: '1px 5px', margin: '5px 2px' }}
                      title="Xóa nhóm" onClick={e => {
                        if (confirm('Bạn có chắc chắn muốn xóa nhóm [' + $('#ulGroups .nav-link.active').text() + ']?')) {
                          this.props.deleteGroup(this.props.userObj.id, Number($('#ulGroups .nav-link.active').attr('group-id')));
                        }
                      }}>
                      <span className="lnr lnr-cross"></span></button></span>) :
                  (<span><button className="btn btn-success" style={{ padding: '1px 5px', margin: '5px 2px' }}
                    title="Sửa tên nhóm" data-toggle="modal" data-target="#addGroupModal" disabled
                    onClick={e => {
                      $('#addGroupModal .modal-title').text('Sửa tên nhóm');
                      $('#btnSaveGroup').attr('groupId', $('#ulGroups .nav-link.active').attr('group-id'));
                      $('#groupName').val($('#ulGroups .nav-link.active').text());
                    }}><span className="lnr lnr-pencil"></span></button>
                    <button className="btn btn-danger" style={{ padding: '1px 5px', margin: '5px 2px' }}
                      title="Xóa nhóm" disabled onClick={e => {
                        if (confirm('Bạn có chắc chắn muốn xóa nhóm [' + $('#ulGroups .nav-link.active').text() + ']?')) {
                          this.props.deleteGroup(this.props.userObj.id, Number($('#ulGroups .nav-link.active').attr('group-id')));
                        }
                      }}>
                      <span className="lnr lnr-cross"></span></button></span>)}
              </div>

              <div className="tab-content">
                {groupsContent}
              </div>
            </div>
          </div>
        </div>

        <div className="modal fade" id="addGroupModal" data-backdrop="static" role="dialog" aria-labelledby="addGroupModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="addGroupModalLabel">Thêm nhóm mới</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form id="myForm">
                  <div className="form-group">
                    <label htmlFor="groupName">Tên nhóm</label>
                    <input type="text" className="form-control" id="groupName" placeholder="VD: Nhóm 1" maxLength={30}
                      onKeyPress={e => {
                        if ((e.which || e.keyCode) === 13) this.saveGroup();
                      }} />
                    <small className="form-text text-muted">Tên nhóm không được vượt quá 30 ký tự.</small>
                  </div>
                  <div className="form-group">
                    <div className="form-check">
                      <label className="form-check-label">
                        <input type="radio" className="form-check-input" name="optradio" value="[CS]" />Cơ sở
                      </label>
                    </div>
                    <div className="form-check">
                      <label className="form-check-label">
                        <input type="radio" className="form-check-input" name="optradio" value="[PS]" />Phái sinh
                      </label>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" id="btnSaveGroup" className="btn btn-primary" onClick={this.saveGroup}><i className="fas fa-check mr-2"></i>Lưu</button>
              </div>

            </div>
          </div>
        </div>

        <div className="modal fade" id="addSubAccountModal" data-backdrop="static" role="dialog" aria-labelledby="addSubAccountModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="addSubAccountModalLabel">Thêm tiểu khoản</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="custodySelect">Tài khoản</label>
                  <select className="form-control" id="custodySelect" onChange={this.onChangeCustody}>
                    <option value=""></option>
                    {custodySelectBox}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="subAccountSelect">Tiểu khoản</label>
                  <select className="form-control" id="subAccountSelect">
                    <option value=""></option>
                    {this.state.subAccSelectBox}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={this.addSubAcc}><i className="fas fa-check mr-2"></i>Lưu</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
