import { event } from 'jquery';
import * as React from 'react';
import { isTemplateTail } from 'typescript';
import { getSubAccountChecked, getAllSubAccByUserId } from '../../api/isync';
import { fetchLastPriceStock } from '../../api/others';

interface Props {
  height: number,
  userObj: any,
  socket: any,
  theadAccSort: any,
  theadAccSummarySort: any,
  groups: any,
  allSubAccs: any,
  accountSummary: any,
  gType: string,
  theadSortChange: (table, field) => void,
  subAccountChecked: (userId, custody, subAcc, subAccName, groupId, checkedQtty, isInit, isChecked) => void,
  subAccountUnchecked: (userId, groupId, subAcc, isSave) => void,
  onChangeStocksData: (socket) => void,
  initStockData: (socket) => void,
  refreshAccountSummary: (userId, showLoading) => void
}

var groups = null;
var allSubAccLength = 0;

export class AccountSummary extends React.Component<Props, {}> {
  state = {
    groupType: 'CS',
    subAccountChecked: [],
    lastPriceStockAcc: [],
    CCP: 'NAV',
    totalCCP: 0
  }

  constructor(props) {
    super(props);
    this.onClickSubAccountCheckbox = this.onClickSubAccountCheckbox.bind(this);
    this.onClickAllSubAccountCheckbox = this.onClickAllSubAccountCheckbox.bind(this);
  }

  componentDidMount() {
    this.props.initStockData(this.props.socket);
    this.props.onChangeStocksData(this.props.socket);
    setInterval(() => {
      this.props.refreshAccountSummary(this.props.userObj.id, false);
    }, 60000);
  }

  componentDidUpdate() {
    if (groups === null && this.props.groups.length) {
      groups = this.props.groups.length;
      getAllSubAccByUserId(this.props.userObj.id).then(allSubAccs => {
        if (allSubAccs.s === 'ok') {
          allSubAccLength = allSubAccs.d.length;
          getSubAccountChecked(this.props.userObj.id).then(res => {
            if (res.s === 'ok' && res.d.length) {
              this.setState({ subAccountChecked: res.d });
              var subAccGroupChecked = res.d.filter(sac => sac.groupId === this.props.groups[0].id);
              subAccGroupChecked.forEach(subAccItm => {
                this.props.subAccountChecked(this.props.userObj.id, subAccItm.custody,
                  subAccItm.subAccount, subAccItm.subAccountName,
                  subAccItm.groupId, subAccGroupChecked.length, true, true);
              });
            }
          });
        }
      });
    }
  }

  onClickAllSubAccountCheckbox(e) {
    // debugger
    var tmpSubAcc = [...this.state.subAccountChecked];
    var group = this.props.allSubAccs.filter(el => el.groupid === Number($('#ulGroupsTab .nav-link.active').attr('group-id')));
    group.forEach(el => {
      if ($(e.target).prop('checked')) {
        if (!$('input[type="checkbox"][subaccount-id="' + el.subaccount + '"]').prop('checked')) {
          this.props.subAccountChecked(this.props.userObj.id, el.custody, el.subaccount,
            el.subaccountname.split(' - ')[1], el.id, group.length - $('#accountPanel .tab-pane.active input.cbAccount:checked').length, false, true);
          tmpSubAcc.push({ subAccount: el.subaccount, groupId: el.id, custody: el.custody, subAccountName: el.subaccountname.split(' - ')[1] })
          $('input[type="checkbox"][subaccount-id="' + el.subaccount + '"]').prop('checked', true);
        }
      } else {
        if ($('input[type="checkbox"][subaccount-id="' + el.subaccount + '"]').prop('checked')) {
          this.props.subAccountUnchecked(this.props.userObj.id, el.id, el.subaccount, true);
          tmpSubAcc.splice(tmpSubAcc.findIndex(sa => sa.subAccount === el.subaccount), 1);
          $('input[type="checkbox"][subaccount-id="' + el.subaccount + '"]').prop('checked', false);
        }
      }
    });
    this.setState({ subAccountChecked: tmpSubAcc });
  }

  onClickSubAccountCheckbox(e) {
    this.props.accountSummary

    if ($('#accountPanel .tab-pane.active input.cbAccount').length ===
      $('#accountPanel .tab-pane.active input.cbAccount:checked').length) {
      $('#accountPanel .tab-pane.active input.checkbox-all').prop('checked', true);
    } else {
      $('#accountPanel .tab-pane.active input.checkbox-all').prop('checked', false);
    }

    var tmpSubAcc = [...this.state.subAccountChecked];
    if ($(e.target).prop('checked')) {
      this.props.subAccountChecked(this.props.userObj.id, $(e.target).attr('custody-id'),
        $(e.target).attr('subaccount-id'), $(e.target).attr('subaccount-name'), Number($(e.target).attr('group-id')), 1, false, true);
      tmpSubAcc.push({
        subAccount: $(e.target).attr('subaccount-id'), groupId: Number($(e.target).attr('group-id')), custody: $(e.target).attr('custody-id'), subAccountName: $(e.target).attr('subaccount-name')
      })
      this.setState({ subAccountChecked: tmpSubAcc })
    } else {
      this.props.subAccountUnchecked(this.props.userObj.id, $(e.target).attr('group-id'), $(e.target).attr('subaccount-id'), true);
      tmpSubAcc.splice(tmpSubAcc.findIndex(sa => sa.subAccount === $(e.target).attr('subaccount-id')), 1)
      this.setState({ subAccountChecked: tmpSubAcc });
    }
  }

  render() {
    // console.log(100, this.props.accountSummary);
    // console.log(this.state.subAccountChecked)

    const { theadAccSort, theadAccSummarySort } = this.props;
    var groupsTabItem = [], groupsContent = [], tableAccSumary = null;
    this.props.groups.forEach((itm, index) => {
      groupsTabItem.push(<li className="nav-item">
        <a className={"nav-link" + (index === 0 ? ' active' : '')} data-toggle="tab" href={'#group-tab-' + itm.id} group-id={itm.id}
          onClick={e => {
            this.props.allSubAccs.forEach(el => {
              this.props.subAccountUnchecked(this.props.userObj.id, itm.id, el.subaccount, false);
            });
            var subAccGroupChecked = this.state.subAccountChecked.filter(sac => sac.groupId === itm.id);
            subAccGroupChecked.forEach(element => {
              this.props.subAccountChecked(this.props.userObj.id, element.custody, element.subAccount, element.subAccountName,
                itm.id, subAccGroupChecked.length, true, true);
            });
            var xxx = itm.name;
            localStorage.setItem('position', 'Mua/Bán')
            if (xxx.includes('[PS]')) {
              this.setState({
                CCP: 'Tổng tiền ký quỹ CCP'
              })
              this.setState({ groupType: 'PS' });
              localStorage.setItem('Gtype', 'PS');
              localStorage.setItem('position', 'Long/Short')
              // localStorage.setItem('subAccount', this.props.accountSummary[0].subAccount);
            }
            else {
              this.setState({
                CCP: 'NAV'
              })
              this.setState({ groupType: 'CS' });
              localStorage.setItem('Gtype', 'CS');
              localStorage.setItem('position', 'Mua/Bán')
            }
          }}>{itm.name}</a>
      </li>);

      var subAccs = this.props.allSubAccs.filter(el => el.groupid === itm.id);
      subAccs.forEach(el => {
        el['nav'] = 0, el['excessEquity'] = 0, el['rate'] = 0, el['pp'] = 0;
        var tmpObj = this.props.accountSummary.find(acs => acs.subAccount === el.subaccount);
        if (tmpObj !== undefined) {
          if (el.subaccount.includes('FDS')) {
            el['nav'] = tmpObj.balancePS;
            el['rate'] = tmpObj.tyTrong;
            el['pp'] = tmpObj.pp;
          }
          else {
            el['nav'] = tmpObj.nav;
            el['excessEquity'] = tmpObj.excessEquity;
            if (tmpObj.nav > 0) {
              el['rate'] = (tmpObj.positionsMarketValue / tmpObj.nav * 100).toFixed(1);
              el['pp'] = tmpObj.excessEquity;
            }
          }
        }
      });
      if (theadAccSort.isUp) {
        if (theadAccSort.field === 'name') {
          subAccs.sort((a, b) => (a.customername > b.customername) ? 1 : ((b.customername > a.customername) ? -1 : 0));
        } else if (theadAccSort.field === 'custody') {
          subAccs.sort((a, b) => (a.custody > b.custody) ? 1 : ((b.custody > a.custody) ? -1 : 0));
        } else if (theadAccSort.field === 'subAccountName') {
          subAccs.sort((a, b) => (a.subaccountname > b.subaccountname) ? 1 : ((b.subaccountname > a.subaccountname) ? -1 : 0));
        } else if (theadAccSort.field === 'nav') {
          subAccs.sort((a, b) => (a.nav > b.nav) ? 1 : ((b.nav > a.nav) ? -1 : 0));
        } else if (theadAccSort.field === 'rate') {
          subAccs.sort((a, b) => (Number(a.rate) > Number(b.rate)) ? 1 : ((Number(b.rate) > Number(a.rate)) ? -1 : 0));
        } else if (theadAccSort.field === 'excessEquity') {
          subAccs.sort((a, b) => (a.excessEquity > b.excessEquity) ? 1 : ((b.excessEquity > a.excessEquity) ? -1 : 0));
        }
      } else {
        if (theadAccSort.field === 'name') {
          subAccs.sort((a, b) => (a.customername < b.customername) ? 1 : ((b.customername < a.customername) ? -1 : 0));
        } else if (theadAccSort.field === 'custody') {
          subAccs.sort((a, b) => (a.custody < b.custody) ? 1 : ((b.custody < a.custody) ? -1 : 0));
        } else if (theadAccSort.field === 'subAccountName') {
          subAccs.sort((a, b) => (a.subaccountname < b.subaccountname) ? 1 : ((b.subaccountname < a.subaccountname) ? -1 : 0));
        } else if (theadAccSort.field === 'nav') {
          subAccs.sort((a, b) => (a.nav < b.nav) ? 1 : ((b.nav < a.nav) ? -1 : 0));
        } else if (theadAccSort.field === 'rate') {
          subAccs.sort((a, b) => (Number(a.rate) < Number(b.rate)) ? 1 : ((Number(b.rate) < Number(a.rate)) ? -1 : 0));
        } else if (theadAccSort.field === 'excessEquity') {
          subAccs.sort((a, b) => (a.excessEquity < b.excessEquity) ? 1 : ((b.excessEquity < a.excessEquity) ? -1 : 0));
        }
      }

      groupsContent.push(
        <div className={"tab-pane" + (index === 0 ? ' active' : '')} id={"group-tab-" + itm.id}>
          <div className="table-scroll" style={{ height: '362px', minHeight: '100px' }}>
            <table className="table table-sm table-bordered table-hover mb-0">
              <thead>
                <tr>
                  {this.state.subAccountChecked.filter(s => s.groupId === itm.id).length === subAccs.length && subAccs.length > 0
                    ? (<th scope="col" className="text-center"><input type="checkbox" className="checkbox-all" onClick={this.onClickAllSubAccountCheckbox} checked /></th>)
                    : (<th scope="col" className="text-center"><input type="checkbox" className="checkbox-all" onClick={this.onClickAllSubAccountCheckbox} /></th>)}

                  <th scope="col" onClick={e => this.props.theadSortChange('account', 'name')}>
                    Họ và tên {theadAccSort.field === 'name'
                      ? (theadAccSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                  <th scope="col" onClick={e => this.props.theadSortChange('account', 'custody')}>
                    Tài khoản {theadAccSort.field === 'custody'
                      ? (theadAccSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                  <th scope="col" onClick={e => this.props.theadSortChange('account', 'subAccountName')}>
                    Tên gợi nhớ {theadAccSort.field === 'subAccountName'
                      ? (theadAccSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                  <th scope="col" onClick={e => this.props.theadSortChange('account', 'nav')}>
                    {this.state.CCP} {theadAccSort.field === 'nav'
                      ? (theadAccSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                  <th scope="col" onClick={e => this.props.theadSortChange('account', 'rate')}>
                    Tỷ trọng {theadAccSort.field === 'rate'
                      ? (theadAccSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                  <th scope="col" style={{ minWidth: '101px' }} onClick={e => this.props.theadSortChange('account', 'excessEquity')}>
                    Thặng dư {theadAccSort.field === 'excessEquity'
                      ? (theadAccSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                </tr>
              </thead>
              <tbody>
                {subAccs.length === 0 ?
                  (<tr><td colSpan={6} className="text-center">Không có dữ liệu hiển thị</td></tr>)
                  : (subAccs.map(sa => {
                    if (this.state.subAccountChecked.findIndex(c => c.subAccount === sa.subaccount) >= 0) {
                      return (
                        <tr>
                          <td className="text-center">
                            <input type="checkbox" className="cbAccount" group-name={sa.name} custody-id={sa.custody}
                              subaccount-id={sa.subaccount} subaccount-name={sa.subaccountname.split(' - ')[1]}
                              group-id={itm.id} onClick={this.onClickSubAccountCheckbox} checked />
                          </td>
                          <td>{sa.customername}</td>
                          <td>{sa.custody}</td>
                          <td>{sa.subaccountname}</td>
                          <td className='text-right'>{sa.nav === undefined ? '' : sa.nav.toLocaleString('en')}</td>
                          <td className='text-right'>{(sa.rate === undefined) ? 0 : Number(Number(sa.rate).toFixed(2)).toLocaleString('en')}%</td>
                          <td className='text-right'>{sa.pp === undefined ? '' : Number(sa.pp).toLocaleString('en')}</td>
                        </tr>
                      )
                    }
                    return (
                      <tr>
                        <td className="text-center">
                          <input type="checkbox" className="cbAccount" group-name={sa.name} custody-id={sa.custody}
                            subaccount-id={sa.subaccount} subaccount-name={sa.subaccountname.split(' - ')[1]}
                            group-id={itm.id} onClick={this.onClickSubAccountCheckbox} />
                        </td>
                        <td>{sa.customername}</td>
                        <td>{sa.custody}</td>
                        <td>{sa.subaccountname}</td>
                        <td className='text-right'>{sa.nav === undefined ? '' : sa.nav.toLocaleString('en')}</td>
                        <td className='text-right'>{sa.rate === undefined ? '' : Number(Number(sa.rate).toFixed(2)).toLocaleString('en')}%</td>
                        <td className='text-right'>{sa.pp === undefined ? '' : Number(sa.pp).toLocaleString('en')}</td>
                      </tr>
                    );
                  }))}
              </tbody>
            </table>
          </div>
        </div>
      );
    });

    var positionsSummary = [], totalCost = 0, totalMarket = 0, totalBalance = 0, totalBalancePS = 0,
      totalvcashonhand = 0, totalLiability = 0, totalEquity = 0, totalKyQuy = 0, totalTyTrong = 0, totalPercentlaiLo = 0, totalLaiLo = 0, totalQtyPS = 0;
    this.props.accountSummary.forEach(itm => {
      if (itm.isChecked) {
        debugger
        this.props.accountSummary
        totalBalance += itm.balance;
        totalBalancePS += itm.balancePS;
        this.state.totalCCP = totalBalancePS;
        totalvcashonhand += Number(itm.vcashonhand);
        totalLiability += itm.liability;
        totalEquity += itm.nav;

        itm.positions.forEach(el => {
         
          var tmpIndex = positionsSummary.findIndex(p => p.instrument === el.instrument);
          var qty = el.qty;
          var cost = el.totalQty * el.avgPrice;
          var costPS = el.avgPrice;
          var marketValue = el.lastPrice;
          var marketValue1 = el.lastPrice * el.totalQty;

          var kqYeuCau = Number((marketValue * el.qty * (el.imrate / el.rsafe / 100) * 100000).toFixed(0));
          var tyTrong = (kqYeuCau / totalBalance) * 100;
          var laiLo = (marketValue - costPS) * el.totalQty * 100000;
          var percentlaiLo = (laiLo / (marketValue * Math.abs(el.totalQty) * 100000) * 100);

          if (tmpIndex >= 0) {
            positionsSummary[tmpIndex].cost = positionsSummary[tmpIndex].totalQty * positionsSummary[tmpIndex].avgPrice + cost;
            positionsSummary[tmpIndex].marketValue = positionsSummary[tmpIndex].marketValue + marketValue;

            if (itm.subAccount.includes('FDS'))
              positionsSummary[tmpIndex].marketValue = marketValue;

            positionsSummary[tmpIndex].costPS = costPS
            positionsSummary[tmpIndex].totalQty += el.totalQty;
            positionsSummary[tmpIndex].avaiQty += el.qty;
            positionsSummary[tmpIndex].avgPrice = positionsSummary[tmpIndex].cost / positionsSummary[tmpIndex].totalQty;

            positionsSummary[tmpIndex].kqYeuCau = Number((marketValue * Math.abs(positionsSummary[tmpIndex].totalQty) * (el.imrate / el.rsafe / 100) * 100000).toFixed(0));
            // positionsSummary[tmpIndex].kqYeuCau += kqYeuCau;
            positionsSummary[tmpIndex].tyTrong = (positionsSummary[tmpIndex].kqYeuCau / totalBalance) * 100;
            // positionsSummary[tmpIndex].tyTrong += tyTrong;
            positionsSummary[tmpIndex].laiLo = (positionsSummary[tmpIndex].marketValue - positionsSummary[tmpIndex].costPS) * positionsSummary[tmpIndex].totalQty * 100000;
            // positionsSummary[tmpIndex].laiLo += laiLo;
            positionsSummary[tmpIndex].percentlaiLo = Math.round((positionsSummary[tmpIndex].laiLo / (positionsSummary[tmpIndex].marketValue * Math.abs(positionsSummary[tmpIndex].totalQty) * 100000)) * 100);
            // positionsSummary[tmpIndex].percentlaiLo += percentlaiLo;
          }
          else {
            positionsSummary.push({
              instrument: el.instrument,
              totalQty: el.totalQty,
              avaiQty: el.qty,
              qty: el.qty,
              avgPrice: el.avgPrice,
              cost: cost,
              costPS: costPS,
              marketValue: marketValue,
              lastPrice: el.lastPrice,
              unit: el.unit,
              unrealizedPl: el.unrealizedPl,
              balance: totalBalance,
              balancePS: totalBalancePS,
              kqYeuCau: kqYeuCau,
              tyTrong: tyTrong,
              laiLo: laiLo,
              percentlaiLo: percentlaiLo,
              vcashonhand: totalvcashonhand,
              id: el.id,
              subAccount: itm.subAccount,
              totalQtyPS: totalQtyPS
            });
          }
          totalCost += cost;
          totalMarket += marketValue1;
          totalKyQuy += kqYeuCau;
          totalTyTrong += tyTrong
          totalLaiLo += laiLo;
          totalPercentlaiLo += percentlaiLo;
        });
      }
    });

    if (theadAccSummarySort.isUp) {
      if (theadAccSummarySort.field === 'symbol') {
        positionsSummary.sort((a, b) => (a.instrument > b.instrument) ? 1 : ((b.instrument > a.instrument) ? -1 : 0));
      } else if (theadAccSummarySort.field === 'totalQty') {
        positionsSummary.sort((a, b) => (a.totalQty > b.totalQty) ? 1 : ((b.totalQty > a.totalQty) ? -1 : 0));
      } else if (theadAccSummarySort.field === 'avaiQty') {
        positionsSummary.sort((a, b) => (a.avaiQty > b.avaiQty) ? 1 : ((b.avaiQty > a.avaiQty) ? -1 : 0));
      } else if (theadAccSummarySort.field === 'cost') {
        positionsSummary.sort((a, b) => (a.cost > b.cost) ? 1 : ((b.cost > a.cost) ? -1 : 0));
      } else if (theadAccSummarySort.field === 'marketValue' || theadAccSummarySort.field === 'rate') {
        positionsSummary.sort((a, b) => {
          var marketValue1 = a.totalQty * a.lastPrice;
          var marketValue2 = b.totalQty * b.lastPrice;
          return (marketValue1 > marketValue2) ? 1 : ((marketValue2 > marketValue1) ? -1 : 0)
        });
      } else if (theadAccSummarySort.field === 'percentPL') {
        positionsSummary.sort((a, b) => {
          var marketValue1 = (a.totalQty * a.lastPrice) / a.cost;
          var marketValue2 = (b.totalQty * b.lastPrice) / b.cost;
          return (marketValue1 > marketValue2) ? 1 : ((marketValue2 > marketValue1) ? -1 : 0)
        });
      }
    } else {
      if (theadAccSummarySort.field === 'symbol') {
        positionsSummary.sort((a, b) => (a.instrument < b.instrument) ? 1 : ((b.instrument < a.instrument) ? -1 : 0));
      } else if (theadAccSummarySort.field === 'totalQty') {
        positionsSummary.sort((a, b) => (a.totalQty < b.totalQty) ? 1 : ((b.totalQty < a.totalQty) ? -1 : 0));
      } else if (theadAccSummarySort.field === 'avaiQty') {
        positionsSummary.sort((a, b) => (a.avaiQty < b.avaiQty) ? 1 : ((b.avaiQty < a.avaiQty) ? -1 : 0));
      } else if (theadAccSummarySort.field === 'cost') {
        positionsSummary.sort((a, b) => (a.cost < b.cost) ? 1 : ((b.cost < a.cost) ? -1 : 0));
      } else if (theadAccSummarySort.field === 'marketValue' || theadAccSummarySort.field === 'rate') {
        positionsSummary.sort((a, b) => {
          var marketValue1 = a.totalQty * a.lastPrice;
          var marketValue2 = b.totalQty * b.lastPrice;
          return (marketValue1 < marketValue2) ? 1 : ((marketValue2 < marketValue1) ? -1 : 0)
        });
      } else if (theadAccSummarySort.field === 'percentPL') {
        positionsSummary.sort((a, b) => {
          var marketValue1 = (a.totalQty * a.lastPrice) / a.cost;
          var marketValue2 = (b.totalQty * b.lastPrice) / b.cost;
          return (marketValue1 < marketValue2) ? 1 : ((marketValue2 < marketValue1) ? -1 : 0)
        });
      }
    }

    if (allSubAccLength > 0 && this.props.allSubAccs.length > 0 && this.props.allSubAccs.length + 1 === allSubAccLength) {
      allSubAccLength = this.props.allSubAccs.length;
      var tmpSubAcc = [...this.state.subAccountChecked];
      tmpSubAcc.forEach((ele, index) => {
        if (this.props.allSubAccs.findIndex(sa => sa.subaccount === ele.subAccount) < 0) {
          tmpSubAcc.splice(index, 1);
        }
      });
      this.setState({ subAccountChecked: tmpSubAcc });
    }

    return (
      <div className="row mx-0 mt-3">
        <div className="col-lg-6 col-md-12 px-2 mb-3">
          <div id='accountPanel' className="card shadow">
            <div className="card-header">
              <h6 className="mb-0">Tài khoản</h6>
            </div>
            <div className="card-body p-2" style={{ height: '416px' }}>
              <div className="tab-pane-header px-2">
                <ul id="ulGroupsTab" className="nav nav-tabs-type2 float-left mr-2" role="tablist">
                  {groupsTabItem}
                </ul>
              </div>
              <div className="tab-content">
                {groupsContent.length ? groupsContent : (<div className="text-center">Không có dữ liệu hiển thị</div>)}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6 col-md-12 px-2 mb-3">
          <div className="card shadow">
            <div className="card-header">
              <h6 className="mb-0 float-left">Tổng hợp tài khoản</h6>
              <img className="cursor-pointer float-right"
                src={require('../../images/refresh-icon.png')} title='Refresh'
                onClick={e => this.props.refreshAccountSummary(this.props.userObj.id, true)} />
            </div>
            <div className="card-body position-relative p-2">
              <div className="table-scroll" style={{ height: '400px', minHeight: '100px' }}>
                {this.state.groupType === 'PS' ?
                  <table className="table table-sm table-bordered table-hover mb-0" style={{ borderBottomWidth: 0 }}>
                    <thead>
                      <tr>
                        <th scope="col" onClick={e => this.props.theadSortChange('accSummary', 'symbol')}>
                          Mã CK {theadAccSummarySort.field === 'symbol'
                            ? (theadAccSummarySort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                              : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                        <th scope="col" onClick={e => this.props.theadSortChange('accSummary', 'totalQty')}>
                          Tổng KL {theadAccSummarySort.field === 'totalQty'
                            ? (theadAccSummarySort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                              : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                        {/* <th scope="col" onClick={e => this.props.theadSortChange('accSummary', 'avaiQty')}>
                          Khả dụng {theadAccSummarySort.field === 'avaiQty'
                            ? (theadAccSummarySort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                              : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th> */}
                        <th scope="col" onClick={e => this.props.theadSortChange('accSummary', 'cost')}>
                          Giá vốn {theadAccSummarySort.field === 'cost'
                            ? (theadAccSummarySort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                              : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                        <th scope="col" onClick={e => this.props.theadSortChange('accSummary', 'marketValue')}>
                          Giá TT {theadAccSummarySort.field === 'marketValue'
                            ? (theadAccSummarySort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                              : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                        <th scope="col">Ký quỹ yêu cầu</th>
                        <th scope="col" onClick={e => this.props.theadSortChange('accSummary', 'percentPL')}>
                          Lãi/lỗ {theadAccSummarySort.field === 'percentPL'
                            ? (theadAccSummarySort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                              : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>

                        <th scope="col" onClick={e => this.props.theadSortChange('accSummary', 'rate')}>
                          Tỷ trọng {theadAccSummarySort.field === 'rate'
                            ? (theadAccSummarySort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                              : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positionsSummary.length ? positionsSummary.map(el => {
                        var textColor = 'text-green';
                        localStorage.setItem('currentRate', totalTyTrong.toFixed(2));
                        if (el.laiLo < 0) {
                          textColor = 'text-red';
                        }

                        return (
                          <tr>
                            <td>{el.instrument}</td>
                            <td className="text-right">{el.totalQty.toLocaleString('en')}</td>
                            {/* <td className="text-right">{el.id.includes('buy') ? el.avaiQty.toLocaleString('en') : 0 - el.avaiQty}</td> */}
                            <td className="text-right">{el.costPS.toLocaleString('en')}</td>
                            <td className="text-right">{(el.marketValue).toLocaleString('en')}</td>
                            <td className="text-right">{el.kqYeuCau.toLocaleString('en')}</td>
                            <td className={"text-right " + textColor}>
                              {/* {el.cost === 0 ? '100' : ((totalQty >= 0 && marketValue > el.cost) ? (((marketValue - el.cost) * 100) / el.cost).toFixed(1) : (((marketValue - el.cost) * 100) / el.cost).toFixed(1))}% */}
                              {Number(Number(el.laiLo).toFixed(1)).toLocaleString('en')} ({Number(el.percentlaiLo).toFixed(1)}%)
                            </td>
                            <td className="text-right">{el.id.includes('buy') ? el.tyTrong.toFixed(2) : 0 - Number(el.tyTrong.toFixed(2))}%</td>
                          </tr>
                        );
                      }) : (<tr>
                        <td colSpan={7} className="text-center">Không có dữ liệu hiển thị</td>
                      </tr>)}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th colSpan={2}>Tổng cộng</th>
                        <th className="text-right">{Number(Math.abs(totalCost * 100000).toFixed(0)).toLocaleString('en')}</th>
                        <th className="text-right">{(Math.abs(totalMarket * 100000)).toLocaleString('en')}</th>
                        <th className="text-right">{totalKyQuy.toLocaleString('en')}</th>
                        <th className="text-right">
                          {(totalLaiLo).toLocaleString('en')}
                          ({totalPercentlaiLo.toFixed(1)}%)
                        </th>
                        <th className="text-right">{totalTyTrong.toFixed(2)}%</th>
                      </tr>
                      <tr>
                        <th colSpan={5}>
                          Tổng tiền ký quỹ CCP
                          <span className="float-right">{totalBalancePS.toLocaleString('en')}</span>
                        </th>
                        <th className="text-right">
                          {/* 1 */}
                        </th>
                        <th className="text-right">{totalEquity <= 0 ? 0 : '100.00'}%</th>
                      </tr>
                      <tr>
                        <th colSpan={5}>
                          Tiền tại BSC
                          <span className="float-right">{totalvcashonhand.toLocaleString('en')}</span>
                        </th>
                        <th className="text-right"></th>
                        <th className="text-right">
                          {/* {totalEquity <= 0 ? 0 : ((totalBalance / totalEquity) * 100).toFixed(1)}% */}
                        </th>
                      </tr>
                      <tr>
                        <th colSpan={5}>
                          Phải trả
                          <span className="float-right">{totalLiability.toLocaleString('en')}</span>
                        </th>
                        <th className="text-right">
                          {/* 1 */}
                        </th>
                        <th className="text-right">
                          {/* {totalEquity <= 0 ? 0 : ((totalLiability / totalEquity) * 100).toFixed(1)}% */}
                        </th>
                      </tr>
                      <tr>
                        <th colSpan={5}>
                          NAV
                          <span className="float-right">{(totalBalancePS + totalvcashonhand - totalLiability).toLocaleString('en')}</span>
                        </th>
                        <th className="text-right">
                          {/* 1 */}
                        </th>
                        <th className="text-right">
                          {/* {totalEquity <= 0 ? 0 : ((totalLiability / totalEquity) * 100).toFixed(1)}% */}
                        </th>
                      </tr>
                    </tfoot>
                  </table>
                  :
                  <table className="table table-sm table-bordered table-hover mb-0" style={{ borderBottomWidth: 0 }}>
                    <thead>
                      <tr>
                        <th scope="col" onClick={e => this.props.theadSortChange('accSummary', 'symbol')}>
                          Mã CK {theadAccSummarySort.field === 'symbol'
                            ? (theadAccSummarySort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                              : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                        <th scope="col" onClick={e => this.props.theadSortChange('accSummary', 'totalQty')}>
                          Tổng KL {theadAccSummarySort.field === 'totalQty'
                            ? (theadAccSummarySort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                              : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                        <th scope="col" onClick={e => this.props.theadSortChange('accSummary', 'avaiQty')}>
                          Khả dụng {theadAccSummarySort.field === 'avaiQty'
                            ? (theadAccSummarySort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                              : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                        <th scope="col" onClick={e => this.props.theadSortChange('accSummary', 'cost')}>
                          Giá vốn {theadAccSummarySort.field === 'cost'
                            ? (theadAccSummarySort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                              : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                        <th scope="col" onClick={e => this.props.theadSortChange('accSummary', 'marketValue')}>
                          Giá trị TT {theadAccSummarySort.field === 'marketValue'
                            ? (theadAccSummarySort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                              : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                        <th scope="col" onClick={e => this.props.theadSortChange('accSummary', 'percentPL')}>
                          Lãi/lỗ (%) {theadAccSummarySort.field === 'percentPL'
                            ? (theadAccSummarySort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                              : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                        <th scope="col" onClick={e => this.props.theadSortChange('accSummary', 'rate')}>
                          Tỷ trọng {theadAccSummarySort.field === 'rate'
                            ? (theadAccSummarySort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                              : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positionsSummary.length ? positionsSummary.map(el => {
                        var marketValue = el.totalQty * el.lastPrice;
                        return (
                          <tr>
                            <td>{el.instrument}</td>
                            <td className="text-right">{el.totalQty.toLocaleString('en')}</td>
                            <td className="text-right">{el.avaiQty.toLocaleString('en')}</td>
                            <td className="text-right">{Math.round(el.cost).toLocaleString('en')}</td>
                            <td className="text-right">{marketValue.toLocaleString('en')}</td>
                            <td className={"text-right " + (marketValue - el.cost >= 0 ? 'text-green' : 'text-red')}>
                              {Number((marketValue - el.cost).toFixed(0)).toLocaleString('en')}
                              &nbsp;
                              ({el.cost === 0 ? '100' : ((Math.abs(marketValue - el.cost) * 100) / el.cost).toFixed(1)}%)</td>
                            <td className="text-right">{((marketValue / totalEquity) * 100).toFixed(1)}%</td>
                          </tr>
                        );
                      }) : (<tr>
                        <td colSpan={6} className="text-center">Không có dữ liệu hiển thị</td>
                      </tr>)}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th colSpan={3}>Tổng cộng</th>
                        <th className="text-right">{Number(totalCost.toFixed(0)).toLocaleString('en')}</th>
                        <th className="text-right">{totalMarket.toLocaleString('en')}</th>
                        <th className={"text-right " + (totalMarket - totalCost >= 0 ? 'text-green' : 'text-red')}>
                          {Number((totalMarket - totalCost).toFixed(0)).toLocaleString('en')}
                          ({totalCost === 0 ? (totalMarket === 0 ? '0' : '100') : (((totalMarket - totalCost) * 100) / totalCost).toFixed(1)}%)
                        </th>
                        <th className="text-right">{totalEquity <= 0 ? 0 : ((totalMarket / totalEquity) * 100).toFixed(1)}%</th>
                      </tr>
                      <tr>
                        <th colSpan={6}>
                          Tiền tại BSC
                          <span className="float-right">{totalBalance.toLocaleString('en')}</span>
                        </th>
                        <th className="text-right">{totalEquity <= 0 ? 0 : ((totalBalance / totalEquity) * 100).toFixed(1)}%</th>
                      </tr>
                      <tr>
                        <th colSpan={6}>
                          Dư nợ ký quỹ
                          <span className="float-right">{totalLiability.toLocaleString('en')}</span>
                        </th>
                        <th className="text-right">{totalEquity <= 0 ? 0 : ((totalLiability / totalEquity) * 100).toFixed(1)}%</th>
                      </tr>
                      <tr>
                        <th colSpan={6}>
                          NAV
                          <span className="float-right">{totalEquity.toLocaleString('en')}</span>
                        </th>
                        <th className="text-right">{totalEquity <= 0 ? 0 : '100.00'}%</th>
                      </tr>
                    </tfoot>
                  </table>
                }
              </div>
              <div id='AccountSummaryLoading' className="loading-data" style={{ display: 'none' }}>
                <div className="spiner"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
