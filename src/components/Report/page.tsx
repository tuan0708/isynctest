import * as React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props {
  userObj: any,
  groups: any,
  allSubAccs: any
}

const pxToMm = (px) => {
  return Math.floor(px / document.getElementById('myMm').offsetHeight);
};

const mmToPx = (mm) => {
  return document.getElementById('myMm').offsetHeight * mm;
};

const range = (start, end) => {
  return Array(end - start).join('0').split('0').map(function (val, id) { return id + start });
};

export class Report extends React.Component<Props, {}> {

  constructor(props) {
    super(props);
    this.groupChange = this.groupChange.bind(this);
  }

  groupChange(e) {
    $('#groupInfo tr:nth-child(1) td:nth-child(2)').text($(e.target).children('option:selected').text());
    var listAccountTable = '';
    this.props.allSubAccs.sort((a, b) => (a.custody > b.custody) ? 1 : ((b.custody > a.custody) ? -1 : 0));
    if (e.target.value === '') {
      this.props.allSubAccs.forEach((el, i) => {
        listAccountTable += '<tr><td class="text-center">' + (i + 1) + '</td><td>' + el.custody + '</td><td>' + el.subaccount + '</td><td>' + el.customername + '</td></tr>'
      });
    } else {
      this.props.allSubAccs.filter(el => el.id === Number(e.target.value)).forEach((el, i) => {
        listAccountTable += '<tr><td class="text-center">' + (i + 1) + '</td><td>' + el.custody + '</td><td>' + el.subaccount + '</td><td>' + el.customername + '</td></tr>'
      });
    }
    $('#listAccountTable tbody, #previewReportTable tbody').html(listAccountTable);
  }

  render() {
    var { allSubAccs } = this.props;
    allSubAccs.sort((a, b) => (a.custody > b.custody) ? 1 : ((b.custody > a.custody) ? -1 : 0));
    return (
      <div className="row mx-0">
        <div className="col-3">
          <div className="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
            <a className="nav-link active" id="listAccountTab" data-toggle="pill" href="#listAccount" role="tab" aria-controls="listAccount" aria-selected="true">Danh s??ch t??i kho???n</a>
            {/* <a className="nav-link" id="v-pills-profile-tab" data-toggle="pill" href="#v-pills-profile" role="tab" aria-controls="v-pills-profile" aria-selected="false">Profile</a>
            <a className="nav-link" id="v-pills-messages-tab" data-toggle="pill" href="#v-pills-messages" role="tab" aria-controls="v-pills-messages" aria-selected="false">Messages</a>
            <a className="nav-link" id="v-pills-settings-tab" data-toggle="pill" href="#v-pills-settings" role="tab" aria-controls="v-pills-settings" aria-selected="false">Settings</a> */}
          </div>
        </div>
        <div className="col-9">
          <div className="tab-content">
            <div className="tab-pane fade show active" id="listAccount" role="tabpanel" aria-labelledby="listAccountTab">
              <div className="card">
                <div className="card-body">
                  <div className="form-inline mb-3">
                    <label className="mr-2">Nh??m</label>
                    <select id="groupSelect" className="form-control form-control-sm mr-3" onChange={this.groupChange}>
                      <option value=''>T???t c???</option>
                      {this.props.groups.map(el => (
                        <option value={el.id}>{el.name}</option>
                      ))}
                    </select>
                    <button className="btn btn-danger btn-sm" style={{ padding: '.15rem .5rem' }}
                      data-toggle="modal" data-target="#previewReportModal">Export PDF</button>
                  </div>

                  <table id="listAccountTable" className="table table-sm table-bordered table-hover table-striped mb-0">
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: '10px' }}>STT</th>
                        <th scope="col">S??? t??i kho???n</th>
                        <th scope="col">S??? ti???u kho???n</th>
                        <th scope="col">H??? v?? t??n</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.props.allSubAccs.map((el, index) => (
                        <tr>
                          <td className="text-center">{index + 1}</td>
                          <td>{el.custody}</td>
                          <td>{el.subaccount}</td>
                          <td>{el.customername}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* <div className="tab-pane fade" id="v-pills-profile" role="tabpanel" aria-labelledby="v-pills-profile-tab">...</div>
            <div className="tab-pane fade" id="v-pills-messages" role="tabpanel" aria-labelledby="v-pills-messages-tab">...</div>
            <div className="tab-pane fade" id="v-pills-settings" role="tabpanel" aria-labelledby="v-pills-settings-tab">...</div> */}
          </div>
        </div>

        <div className="modal fade" style={{overflow: 'auto'}} id="previewReportModal" data-backdrop="static" role="dialog" aria-labelledby="previewReportModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document" style={{width: '834px', maxWidth: '834px'}}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="previewReportModalLabel">Xu???t b??o c??o</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div id="myMm" style={{ height: "1mm" }} />
                <div style={{ border: '1px dotted' }}>
                  <div id='docExport' className='p-4'>
                    <div className='row mx-0 py-2' style={{ borderBottom: '1px solid' }}>
                      <div className='col-4 px-2'>
                        <img src={require('../../images/logo.png')} className="float-left p-2 w-100" />
                      </div>
                      <div className='col-8 px-2'>
                        <strong>C??ng ty c??? ph???n Ch???ng kho??n Ng??n h??ng ?????u t?? v?? Ph??t tri???n Vi???t Nam</strong>
                        <div>T???ng 1, 10 v?? 11 Th??p BIDV - 35 H??ng V??i, Qu???n Ho??n Ki???m, H?? N???i</div>
                        <div>??i???n tho???i: 04 3935 2722 - Fax: 04 2220 0669</div>
                      </div>
                    </div>
                    <h4 className="text-center font-weight-bold my-4">DANH S??CH T??I KHO???N</h4>
                    <div className='col-6 mx-auto'>
                      <table id="groupInfo">
                        <tr>
                          <td style={{ width: '200px' }}><strong>T??n nh??m:</strong></td><td>T???t c???</td>
                        </tr>
                        <tr>
                          <td><strong>H??? v?? t??n tr?????ng nh??m:</strong></td><td>{this.props.userObj.name}</td>
                        </tr>
                        <tr>
                          <td><strong>Ng??y tra c???u:</strong></td><td>{new Date().toLocaleString('vi')}</td>
                        </tr>
                      </table>
                    </div>
                    <table id="previewReportTable" className="table table-sm table-bordered my-4">
                      <thead>
                        <tr>
                          <th scope="col" style={{ width: '10px' }}>STT</th>
                          <th scope="col">S??? t??i kho???n</th>
                          <th scope="col">S??? ti???u kho???n</th>
                          <th scope="col">H??? v?? t??n</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.props.allSubAccs.map((el, index) => (
                          <tr>
                            <td className="text-center">{index + 1}</td>
                            <td>{el.custody}</td>
                            <td>{el.subaccount}</td>
                            <td>{el.customername}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button className="btn btn-primary"
                  onClick={() => {
                    const input = document.getElementById('docExport');
                    const inputHeightMm = pxToMm(input.offsetHeight);
                    const a4WidthMm = 210;
                    const a4HeightMm = 297;
                    const a4HeightPx = mmToPx(a4HeightMm);
                    const numPages = inputHeightMm <= a4HeightMm ? 1 : Math.floor(inputHeightMm / a4HeightMm) + 1;

                    html2canvas(input).then((canvas) => {
                      const imgData = canvas.toDataURL('image/png');
                      var pdf;
                      // Document of a4WidthMm wide and inputHeightMm high
                      if (inputHeightMm > a4HeightMm) {
                        // elongated a4 (system print dialog will handle page breaks)
                        pdf = new jsPDF('p', 'mm', [inputHeightMm + 16, a4WidthMm]);
                      } else {
                        // standard a4
                        pdf = new jsPDF();
                      }

                      pdf.addImage(imgData, 'PNG', 0, 0);
                      pdf.save(`${'danh-sach-tai-khoan'}.pdf`);
                    });

                  }}><i className="fas fa-check mr-2"></i>Xu???t</button>
                <button className="btn btn-secondary" data-dismiss="modal" aria-label="Close">????ng</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
