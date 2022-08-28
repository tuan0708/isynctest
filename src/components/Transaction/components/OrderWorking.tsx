import * as React from 'react';
import { cancelOrder, modifyOrder, getOrdersCancelled } from '../../../api/accounts';
import { showLoading } from '../../../config/utils';
import { stocksDataInit } from '../../AccountSummary/actions/stocksData';
import { validatePrice } from '../../../config/utils';
import { Guid } from 'guid-typescript';
import { showToast } from '../../../common/constants/app';

interface Props {
    userObj: any,
    orders: any,
    orderTableSort: any,
    orderCancel: any,
    orderSortChange: (table, field) => void,
    updateListOrders: (userId, custody, subAcc, refreshClick) => void
    refreshAccountSummary: (userId, showLoading) => void
}

export class OrderWorking extends React.Component<Props, {}> {

    constructor(props) {
        super(props);
        this.cancelOrders = this.cancelOrders.bind(this);
        this.confirmModifyOrder = this.confirmModifyOrder.bind(this);
    }

    cancelOrders() {
        var cbOrderCancelArr = $('input.cbOrderCancel:checked');
        if (!cbOrderCancelArr.length) {
            showToast('Thông báo', 'Không có lệnh hủy', 'warning', 100000);
            return;
        }
        if (!confirm('Bạn có chắc chắn muốn hủy ' + cbOrderCancelArr.length + ' lệnh?')) return;
        var countReturn = 0;
        showLoading(true);
        var tmpOrderCancel = [...this.props.orderCancel];
        $.each(cbOrderCancelArr, index => {
            var custody = $(cbOrderCancelArr[index]).attr('custody-cd');
            var subAcc = $(cbOrderCancelArr[index]).attr('sub-account');
            var orderId = $(cbOrderCancelArr[index]).attr('order-id');
            cancelOrder(
                this.props.userObj.id,
                custody,
                subAcc,
                orderId).then(res => {
                    $(cbOrderCancelArr[index]).prop('checked', false);
                    countReturn++;
                    if (countReturn === cbOrderCancelArr.length) {
                        showLoading(false);
                        $('#cbOrderCancelAll').prop('checked', false);
                        setTimeout(() => {
                            this.props.updateListOrders(this.props.userObj.id, custody, subAcc, false);
                        }, 3000);
                        this.props.refreshAccountSummary(this.props.userObj.id, false);
                        this.setState({ orderCancel: tmpOrderCancel });
                    }
                    if (res.s === 'ok') {
                        tmpOrderCancel.push(orderId);
                        showToast('Thông báo', 'Yêu cầu hủy lệnh [' + orderId + '] thành công', 'success');
                    }
                    else {
                        showToast("Lỗi hủy lệnh", 'Hủy lệnh [' + orderId + ']' + ' - ' + res.errmsg, 'error', 1000000);
                    }
                }).catch(function () {
                    $(cbOrderCancelArr[index]).prop('checked', false);
                    countReturn++;
                    if (countReturn === cbOrderCancelArr.length) {
                        showLoading(false);
                        $('#cbOrderCancelAll').prop('checked', false);
                        setTimeout(() => {
                            this.props.updateListOrders(this.props.userObj.id, custody, subAcc, false);
                        }, 3000);
                        this.props.refreshAccountSummary(this.props.userObj.id, false);
                        this.setState({ orderCancel: tmpOrderCancel });
                    }
                    showToast('Thông báo', 'Hệ thống đang bận, vui lòng thử lại sau!', 'warning', 100000);
                });
        });
    }

    modifyOrderOpenModal(e) {
        var stockObj = stocksDataInit.find(s => s.symbol === $(e.target).attr('order-symbol'));
        $('#modifyOrderModal #btnSaveOrder').attr('order-id', $(e.target).attr('id'));
        $('#modifyOrderTable tr:nth-child(1) td:nth-child(2)').text($(e.target).attr('custody-cd'));
        $('#modifyOrderTable tr:nth-child(2) td:nth-child(2)').text($(e.target).attr('sub-account'));
        $('#modifyOrderTable tr:nth-child(3) td:nth-child(2)').text($(e.target).attr('order-symbol'));
        $('#modifyOrderTable tr:nth-child(4) td:nth-child(2)').text($(e.target).attr('order-side'));
        $('#modifyOrderTable tr:nth-child(5) td:nth-child(2)').text($(e.target).attr('order-type'));
        $('#modifyOrderTable tr:nth-child(6) td:nth-child(2)').text(Number($(e.target).attr('order-qty')).toLocaleString('en'));
        $('#modifyOrderTable tr:nth-child(6) td:nth-child(3) #modifyOrderQty').val($(e.target).attr('order-qty'));
        $('#modifyOrderTable tr:nth-child(7) td:nth-child(2)').text($(e.target).attr('order-price'));
        $('#modifyOrderTable tr:nth-child(7) td:nth-child(3) #modifyOrderPrice').val($(e.target).attr('order-price'));
        if (stockObj !== undefined && stockObj.market === 'hose')
            $('#modifyOrderTable tr:nth-child(6) td:nth-child(3) #modifyOrderQty').attr('disabled', 'disabled');
        else
            $('#modifyOrderTable tr:nth-child(6) td:nth-child(3) #modifyOrderQty').removeAttr('disabled');
    }

    confirmModifyOrder() {
        var custody = $('#modifyOrderTable tr:nth-child(1) td:nth-child(2)').text();
        var subAcc = $('#modifyOrderTable tr:nth-child(2) td:nth-child(2)').text();
        var orderId = $('#modifyOrderModal #btnSaveOrder').attr('order-id');
        var qty = Number($('input#modifyOrderQty').val());
        var limitPrice = Number($('input#modifyOrderPrice').val()) * 1000;
        showLoading(true);
        modifyOrder(this.props.userObj.id, custody, subAcc, orderId, qty, limitPrice, 0, '', 0, 0, 0, '', Guid.raw()).then(res => {
            showLoading(false);
            if (res.s === 'ok') {
                $('#modifyOrderModal .close').click();
                setTimeout(() => {
                    this.props.updateListOrders(this.props.userObj.id, custody, subAcc, false);
                }, 3000);
                showToast('Thông báo', "Yêu cầu sửa lệnh thành công", 'success');
            } else {
                showToast('Lỗi sửa lệnh', res.errmsg, 'error', 1000000);
            }
        }).catch(function () {
            showLoading(false);
            showToast('Thông báo', 'Hệ thống đang bận, vui lòng thử lại sau!', 'warning', 100000);
        });
    }

    render() {
        // debugger;
        console.log(this.props.orders);
        const { orderTableSort } = this.props;
        var ordersTable = [];
        this.props.orders.forEach(itm => {
            if (itm.isChecked) {
                itm.orders.filter(o => o.status === 'placing' || o.status === 'working'
                    || (o.status === 'filled' && o.filledQty < o.qty)).forEach(orderItm => {
                        if (!this.props.orderCancel.includes(orderItm.id) && (orderItm.status !== 'filled' || itm.orders.find(fo => fo.parentId === orderItm.id) === undefined)) {
                            orderItm['custody'] = itm.custody;
                            orderItm['subAccount'] = itm.subAccount;
                            ordersTable.push(orderItm);
                        }
                    });
            }
        });

        if (orderTableSort.isUp) {
            if (orderTableSort.field === 'custody') {
                ordersTable.sort((a, b) => (a.custody > b.custody) ? 1 : ((b.custody > a.custody) ? -1 : 0));
            } else if (orderTableSort.field === 'subaccount') {
                ordersTable.sort((a, b) => (a.subAccount > b.subAccount) ? 1 : ((b.subAccount > a.subAccount) ? -1 : 0));
            } else if (orderTableSort.field === 'symbol') {
                ordersTable.sort((a, b) => (a.instrument > b.instrument) ? 1 : ((b.instrument > a.instrument) ? -1 : 0));
            } else if (orderTableSort.field === 'side') {
                ordersTable.sort((a, b) => (a.side > b.side) ? 1 : ((b.side > a.side) ? -1 : 0));
            } else if (orderTableSort.field === 'type') {
                ordersTable.sort((a, b) => (a.type > b.type) ? 1 : ((b.type > a.type) ? -1 : 0));
            } else if (orderTableSort.field === 'status') {
                ordersTable.sort((a, b) => (a.status > b.status) ? 1 : ((b.status > a.status) ? -1 : 0));
            } else if (orderTableSort.field === 'qty') {
                ordersTable.sort((a, b) => (a.qty > b.qty) ? 1 : ((b.qty > a.qty) ? -1 : 0));
            } else if (orderTableSort.field === 'price') {
                ordersTable.sort((a, b) => (a.limitPrice > b.limitPrice) ? 1 : ((b.limitPrice > a.limitPrice) ? -1 : 0));
            } else if (orderTableSort.field === 'filledQty') {
                ordersTable.sort((a, b) => (a.filledQty > b.filledQty) ? 1 : ((b.filledQty > a.filledQty) ? -1 : 0));
            } else if (orderTableSort.field === 'avgPrice') {
                ordersTable.sort((a, b) => (a.avgPrice > b.avgPrice) ? 1 : ((b.avgPrice > a.avgPrice) ? -1 : 0));
            } else if (orderTableSort.field === 'remainQty') {
                ordersTable.sort((a, b) => (a.qty - a.filledQty > b.qty - b.filledQty) ? 1 : ((b.qty - b.filledQty > a.qty - a.filledQty) ? -1 : 0));
            } else if (orderTableSort.field === 'orderId') {
                ordersTable.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
            }
        } else {
            if (orderTableSort.field === 'custody') {
                ordersTable.sort((a, b) => (a.custody < b.custody) ? 1 : ((b.custody < a.custody) ? -1 : 0));
            } else if (orderTableSort.field === 'subaccount') {
                ordersTable.sort((a, b) => (a.subAccount > b.subAccount) ? 1 : ((b.subAccount > a.subAccount) ? -1 : 0));
            } else if (orderTableSort.field === 'symbol') {
                ordersTable.sort((a, b) => (a.instrument < b.instrument) ? 1 : ((b.instrument < a.instrument) ? -1 : 0));
            } else if (orderTableSort.field === 'side') {
                ordersTable.sort((a, b) => (a.side < b.side) ? 1 : ((b.side < a.side) ? -1 : 0));
            } else if (orderTableSort.field === 'type') {
                ordersTable.sort((a, b) => (a.type < b.type) ? 1 : ((b.type < a.type) ? -1 : 0));
            } else if (orderTableSort.field === 'status') {
                ordersTable.sort((a, b) => (a.status < b.status) ? 1 : ((b.status < a.status) ? -1 : 0));
            } else if (orderTableSort.field === 'qty') {
                ordersTable.sort((a, b) => (a.qty < b.qty) ? 1 : ((b.qty < a.qty) ? -1 : 0));
            } else if (orderTableSort.field === 'price') {
                ordersTable.sort((a, b) => (a.limitPrice < b.limitPrice) ? 1 : ((b.limitPrice < a.limitPrice) ? -1 : 0));
            } else if (orderTableSort.field === 'filledQty') {
                ordersTable.sort((a, b) => (a.filledQty < b.filledQty) ? 1 : ((b.filledQty < a.filledQty) ? -1 : 0));
            } else if (orderTableSort.field === 'avgPrice') {
                ordersTable.sort((a, b) => (a.avgPrice < b.avgPrice) ? 1 : ((b.avgPrice < a.avgPrice) ? -1 : 0));
            } else if (orderTableSort.field === 'remainQty') {
                ordersTable.sort((a, b) => (a.qty - a.filledQty < b.qty - b.filledQty) ? 1 : ((b.qty - b.filledQty < a.qty - a.filledQty) ? -1 : 0));
            } else if (orderTableSort.field === 'orderId') {
                ordersTable.sort((a, b) => (a.id < b.id) ? 1 : ((b.id < a.id) ? -1 : 0));
            }
        }

        return (
            <div style={{  overflowX: 'scroll'}}>
                <table id="orderWorkingTable" className="table table-sm table-bordered table-hover mb-0">
                    <thead>
                        <tr>
                            <th scope="col" className="text-center p-1" style={{ width: '75px' }}>
                                <button className="btn btn-danger btn-sm py-0" onClick={this.cancelOrders}>Hủy</button>
                                <input type="checkbox" id="cbOrderCancelAll" style={{ verticalAlign: 'middle', marginLeft: '5px' }}
                                    onClick={e => {
                                        if ($(e.target).prop('checked'))
                                            $(e.target).parents('table').find('input[type="checkbox"]').prop('checked', true);
                                        else
                                            $(e.target).parents('table').find('input[type="checkbox"]').prop('checked', false);
                                    }} />
                            </th>
                            <th scope="col" className='text-center'>Sửa</th>
                            <th scope="col" onClick={e => this.props.orderSortChange('order', 'custody')}>
                                Tài khoản {orderTableSort.field === 'custody'
                                    ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                            <th scope="col" onClick={e => this.props.orderSortChange('order', 'subaccount')}>
                                Tiểu khoản {orderTableSort.field === 'subaccount'
                                    ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}
                            </th>
                            <th scope="col" onClick={e => this.props.orderSortChange('order', 'symbol')}>
                                Mã CK {orderTableSort.field === 'symbol'
                                    ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                            <th scope="col" onClick={e => this.props.orderSortChange('order', 'side')}>
                                {localStorage.getItem('position')} {orderTableSort.field === 'side'
                                    ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                            <th scope="col" onClick={e => this.props.orderSortChange('order', 'type')}>
                                Lệnh {orderTableSort.field === 'type'
                                    ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                            <th scope="col" onClick={e => this.props.orderSortChange('order', 'status')}>
                                Trạng thái {orderTableSort.field === 'status'
                                    ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                            <th scope="col" onClick={e => this.props.orderSortChange('order', 'qty')}>
                                KL đặt {orderTableSort.field === 'qty'
                                    ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                            <th scope="col" onClick={e => this.props.orderSortChange('order', 'price')}>
                                Giá đặt {orderTableSort.field === 'price'
                                    ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                            <th scope="col" onClick={e => this.props.orderSortChange('order', 'filledQty')}>
                                KL khớp {orderTableSort.field === 'filledQty'
                                    ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                            <th scope="col" onClick={e => this.props.orderSortChange('order', 'avgPrice')}>
                                Giá khớp {orderTableSort.field === 'avgPrice'
                                    ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                            <th scope="col" onClick={e => this.props.orderSortChange('order', 'remainQty')}>
                                Còn lại {orderTableSort.field === 'remainQty'
                                    ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                            <th scope="col" onClick={e => this.props.orderSortChange('order', 'orderId')}>
                                Số hiệu lệnh {orderTableSort.field === 'orderId'
                                    ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!ordersTable.length
                            ? (<tr><td colSpan={13} className="text-center">Không có dữ liệu hiển thị</td></tr>)
                            : ordersTable.map(orderItm => (
                                <tr id={orderItm.id}>
                                    <td className="text-center">
                                        <input type="checkbox" className="cbOrderCancel" custody-cd={orderItm.custody} sub-account={orderItm.subAccount} order-id={orderItm.id} />
                                    </td>
                                    <td className='text-center'>
                                        {orderItm.type === 'market' ? '' :
                                            <button className="btn btn-success btn-sm py-0"
                                                data-toggle="modal" data-target="#modifyOrderModal"
                                                custody-cd={orderItm.custody} sub-account={orderItm.subAccount}
                                                order-symbol={orderItm.instrument} order-side={orderItm.side}
                                                order-type={orderItm.type} order-qty={orderItm.qty}
                                                order-price={orderItm.limitPrice / 1000} id={orderItm.id}
                                                onClick={this.modifyOrderOpenModal}>Sửa</button>}
                                    </td>
                                    <td>{orderItm.custody}</td>
                                    <td>{orderItm.subAccount}</td>
                                    <td>{orderItm.instrument}</td>
                                    <td>{orderItm.subAccount.includes('FDS') ? (orderItm.side === 'buy' ? 'long' : 'short') : orderItm.side}</td>
                                    <td>{orderItm.type}</td>
                                    <td>{orderItm.status}</td>
                                    <td>{orderItm.qty.toLocaleString('en')}</td>
                                    <td>{orderItm.limitPrice.toLocaleString('en')}</td>
                                    <td>{orderItm.filledQty.toLocaleString('en')}</td>
                                    <td>{Math.round(orderItm.avgPrice).toLocaleString('en')}</td>
                                    <td>{(orderItm.qty - orderItm.filledQty).toLocaleString('en')}</td>
                                    <td>{orderItm.id}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                <div className="modal fade" id="modifyOrderModal" data-backdrop="static" role="dialog" aria-labelledby="modifyOrderModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="modifyOrderModalLabel">Sửa lệnh</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <table id="modifyOrderTable" className="table table-sm table-bordered mb-0">
                                    <tbody>
                                        <tr>
                                            <td style={{ width: '150px' }}>Số lưu ký</td>
                                            <td colSpan={2}></td>
                                        </tr>
                                        <tr>
                                            <td>Tiểu khoản</td>
                                            <td colSpan={2}></td>
                                        </tr>
                                        <tr>
                                            <td>Mã CK</td>
                                            <td colSpan={2}></td>
                                        </tr>
                                        <tr>
                                            <td>Mua/Bán</td>
                                            <td colSpan={2}></td>
                                        </tr>
                                        <tr>
                                            <td>Loại lệnh</td>
                                            <td colSpan={2}></td>
                                        </tr>
                                        <tr>
                                            <td>Khối lượng</td>
                                            <td></td>
                                            <td><input id="modifyOrderQty" type="number"
                                                className="form-control form-control-sm"
                                                style={{ width: '80px' }} /></td>
                                        </tr>
                                        <tr>
                                            <td>Giá</td>
                                            <td></td>
                                            <td><input id="modifyOrderPrice" type="text"
                                                className="form-control form-control-sm"
                                                style={{ width: '80px' }} onKeyUp={e => {
                                                    validatePrice(e);
                                                }} /></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-footer">
                                <button type="button" id="btnSaveOrder" className="btn btn-primary" onClick={this.confirmModifyOrder}><i className="fas fa-check mr-2"></i>Xác nhận</button>
                                <button className="btn btn-secondary" data-dismiss="modal" aria-label="Close">Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}