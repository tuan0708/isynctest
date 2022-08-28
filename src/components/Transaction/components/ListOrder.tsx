import * as React from 'react';

interface Props {
    orders: any,
    orderTableSort: any,
    orderCancel: any,
    orderSortChange: (table, field) => void,
}

export class ListOrder extends React.Component<Props, {}> {

    constructor(props) {
        super(props);
    }

    render() {
        const { orderTableSort } = this.props;
        var ordersAllTable = [], ordersWorkingTable = [], ordersFilledTable = [],
            ordersCancelledTable = [], ordersRejectedTable = [];
        this.props.orders.forEach(itm => {
            if (itm.isChecked) {
                itm.orders.forEach(orderItm => {
                    orderItm['custody'] = itm.custody;
                    orderItm['subAccount'] = itm.subAccount;
                    ordersAllTable.push(orderItm);
                });
            }
        });

        //sort
        if (orderTableSort.isUp) {
            if (orderTableSort.field === 'custody') {
                ordersAllTable.sort((a, b) => (a.custody > b.custody) ? 1 : ((b.custody > a.custody) ? -1 : 0));
            } else if (orderTableSort.field === 'subaccount') {
                ordersAllTable.sort((a, b) => (a.subAccount > b.subAccount) ? 1 : ((b.subAccount > a.subAccount) ? -1 : 0));
            } else if (orderTableSort.field === 'symbol') {
                ordersAllTable.sort((a, b) => (a.instrument > b.instrument) ? 1 : ((b.instrument > a.instrument) ? -1 : 0));
            }else if (orderTableSort.field === 'side') {
                ordersAllTable.sort((a, b) => (a.side > b.side) ? 1 : ((b.side > a.side) ? -1 : 0));
            } else if (orderTableSort.field === 'type') {
                ordersAllTable.sort((a, b) => (a.type > b.type) ? 1 : ((b.type > a.type) ? -1 : 0));
            } else if (orderTableSort.field === 'status') {
                ordersAllTable.sort((a, b) => (a.status > b.status) ? 1 : ((b.status > a.status) ? -1 : 0));
            } else if (orderTableSort.field === 'qty') {
                ordersAllTable.sort((a, b) => (a.qty > b.qty) ? 1 : ((b.qty > a.qty) ? -1 : 0));
            } else if (orderTableSort.field === 'price') {
                ordersAllTable.sort((a, b) => (a.limitPrice > b.limitPrice) ? 1 : ((b.limitPrice > a.limitPrice) ? -1 : 0));
            } else if (orderTableSort.field === 'filledQty') {
                ordersAllTable.sort((a, b) => (a.filledQty > b.filledQty) ? 1 : ((b.filledQty > a.filledQty) ? -1 : 0));
            } else if (orderTableSort.field === 'avgPrice') {
                ordersAllTable.sort((a, b) => (a.avgPrice > b.avgPrice) ? 1 : ((b.avgPrice > a.avgPrice) ? -1 : 0));
            } else if (orderTableSort.field === 'remainQty') {
                ordersAllTable.sort((a, b) => (a.qty - a.filledQty > b.qty - b.filledQty) ? 1 : ((b.qty - b.filledQty > a.qty - a.filledQty) ? -1 : 0));
            } else if (orderTableSort.field === 'orderId') {
                ordersAllTable.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
            }
        } else {
            if (orderTableSort.field === 'custody') {
                ordersAllTable.sort((a, b) => (a.custody < b.custody) ? 1 : ((b.custody < a.custody) ? -1 : 0));
            } else if (orderTableSort.field === 'subaccount') {
                ordersAllTable.sort((a, b) => (a.subAccount > b.subAccount) ? 1 : ((b.subAccount > a.subAccount) ? -1 : 0));
            }else if (orderTableSort.field === 'symbol') {
                ordersAllTable.sort((a, b) => (a.instrument < b.instrument) ? 1 : ((b.instrument < a.instrument) ? -1 : 0));
            } else if (orderTableSort.field === 'side') {
                ordersAllTable.sort((a, b) => (a.side < b.side) ? 1 : ((b.side < a.side) ? -1 : 0));
            } else if (orderTableSort.field === 'type') {
                ordersAllTable.sort((a, b) => (a.type < b.type) ? 1 : ((b.type < a.type) ? -1 : 0));
            } else if (orderTableSort.field === 'status') {
                ordersAllTable.sort((a, b) => (a.status < b.status) ? 1 : ((b.status < a.status) ? -1 : 0));
            } else if (orderTableSort.field === 'qty') {
                ordersAllTable.sort((a, b) => (a.qty < b.qty) ? 1 : ((b.qty < a.qty) ? -1 : 0));
            } else if (orderTableSort.field === 'price') {
                ordersAllTable.sort((a, b) => (a.limitPrice < b.limitPrice) ? 1 : ((b.limitPrice < a.limitPrice) ? -1 : 0));
            } else if (orderTableSort.field === 'filledQty') {
                ordersAllTable.sort((a, b) => (a.filledQty < b.filledQty) ? 1 : ((b.filledQty < a.filledQty) ? -1 : 0));
            } else if (orderTableSort.field === 'avgPrice') {
                ordersAllTable.sort((a, b) => (a.avgPrice < b.avgPrice) ? 1 : ((b.avgPrice < a.avgPrice) ? -1 : 0));
            } else if (orderTableSort.field === 'remainQty') {
                ordersAllTable.sort((a, b) => (a.qty - a.filledQty < b.qty - b.filledQty) ? 1 : ((b.qty - b.filledQty < a.qty - a.filledQty) ? -1 : 0));
            } else if (orderTableSort.field === 'orderId') {
                ordersAllTable.sort((a, b) => (a.id < b.id) ? 1 : ((b.id < a.id) ? -1 : 0));
            }
        }

        ordersWorkingTable = ordersAllTable.filter(el => el.status === 'placing' || el.status === 'working');
        ordersFilledTable = ordersAllTable.filter(el => el.status === 'filled' && !this.props.orderCancel.includes(el.id));
        ordersCancelledTable = ordersAllTable.filter(el => el.status === 'cancelled' && this.props.orderCancel.includes(el.id));
        ordersRejectedTable = ordersAllTable.filter(el => el.status === 'rejected');
        return (
            <div style={{  overflowX: 'scroll'}}>
                <div className="tab-pane-header px-2" style={{ backgroundColor: '#f2f2f2' }}>
                    <ul className="nav nav-tabs-type2 float-left mr-2" role="tablist">
                        <li className="nav-item">
                            <a className="nav-link active" data-toggle="tab" href="#AllOrderTab">Tất cả</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" data-toggle="tab" href="#WorkingOrderTab">Đang hoạt động</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" data-toggle="tab" href="#FilledOrderTab">Đã khớp</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" data-toggle="tab" href="#CancelledOrderTab">Đã hủy</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" data-toggle="tab" href="#RejectedOrderTab">Từ chối</a>
                        </li>
                    </ul>
                </div>
                <div className="tab-content">
                    <div className="tab-pane active" id="AllOrderTab">
                        <table className="table table-sm table-bordered table-hover mb-0">
                            <thead>
                                <tr>
                                    <th scope="col" onClick={e => this.props.orderSortChange('order', 'custody')}>
                                        Tài khoản {orderTableSort.field === 'custody'
                                            ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                                : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                                    <th scope="col" onClick={e => this.props.orderSortChange('order', 'subaccount')}>
                                        Tiểu khoản {orderTableSort.field === 'subaccount'
                                            ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                                : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
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
                                {!ordersAllTable.length
                                    ? (<tr><td colSpan={11} className="text-center">Không có dữ liệu hiển thị</td></tr>)
                                    : ordersAllTable.map(orderItm => (
                                        <tr>
                                            <td>{orderItm.custody}</td>
                                            <td>{orderItm.subAccount}</td>
                                            <td>{orderItm.instrument}</td>
                                            <td>{orderItm.subAccount.includes('FDS') ? (orderItm.side==='buy' ? 'long' : 'short') :  orderItm.side}</td>
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
                    </div>
                    <div className="tab-pane fade" id="WorkingOrderTab">
                        <table className="table table-sm table-bordered table-hover mb-0">
                            <thead>
                                <tr>
                                    <th scope="col" onClick={e => this.props.orderSortChange('order', 'custody')}>
                                        Tài khoản {orderTableSort.field === 'custody'
                                            ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                                : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                                    <th scope="col" onClick={e => this.props.orderSortChange('order', 'subaccount')}>
                                        Tiểu khoản {orderTableSort.field === 'subaccount'
                                            ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                                : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
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
                                {!ordersWorkingTable.length
                                    ? (<tr><td colSpan={12} className="text-center">Không có dữ liệu hiển thị</td></tr>)
                                    : ordersWorkingTable.map(orderItm => (
                                        <tr>
                                            <td>{orderItm.custody}</td>
                                            <td>{orderItm.subAccount}</td>
                                            <td>{orderItm.instrument}</td>
                                            <td>{orderItm.subAccount.includes('FDS') ? (orderItm.side==='buy' ? 'long' : 'short') :  orderItm.side}</td>
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
                    </div>
                    <div className="tab-pane fade" id="FilledOrderTab">
                        <table className="table table-sm table-bordered table-hover mb-0">
                            <thead>
                                <tr>
                                    <th scope="col" onClick={e => this.props.orderSortChange('order', 'custody')}>
                                        Tài khoản {orderTableSort.field === 'custody'
                                            ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                                : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                                    <th scope="col" onClick={e => this.props.orderSortChange('order', 'subaccount')}>
                                        Tiểu khoản {orderTableSort.field === 'subaccount'
                                            ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                                : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
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
                                {!ordersFilledTable.length
                                    ? (<tr><td colSpan={12} className="text-center">Không có dữ liệu hiển thị</td></tr>)
                                    : ordersFilledTable.map(orderItm => (
                                        <tr>
                                            <td>{orderItm.custody}</td>
                                            <td>{orderItm.subAccount}</td>
                                            <td>{orderItm.instrument}</td>
                                            <td>{orderItm.subAccount.includes('FDS') ? (orderItm.side==='buy' ? 'long' : 'short') :  orderItm.side}</td>
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
                    </div>
                    <div className="tab-pane fade" id="CancelledOrderTab">
                        <table className="table table-sm table-bordered table-hover mb-0">
                            <thead>
                                <tr>
                                    <th scope="col" onClick={e => this.props.orderSortChange('order', 'custody')}>
                                        Tài khoản {orderTableSort.field === 'custody'
                                            ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                                : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                                    <th scope="col" onClick={e => this.props.orderSortChange('order', 'subaccount')}>
                                        Tiểu khoản {orderTableSort.field === 'subaccount'
                                            ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                                : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
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
                                {!ordersCancelledTable.length
                                    ? (<tr><td colSpan={12} className="text-center">Không có dữ liệu hiển thị</td></tr>)
                                    : ordersCancelledTable.map(orderItm => (
                                        <tr>
                                            <td>{orderItm.custody}</td>
                                            <td>{orderItm.subAccount}</td>
                                            <td>{orderItm.instrument}</td>
                                            <td>{orderItm.subAccount.includes('FDS') ? (orderItm.side==='buy' ? 'long' : 'short') :  orderItm.side}</td>
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
                    </div>
                    <div className="tab-pane fade" id="RejectedOrderTab">
                        <table className="table table-sm table-bordered table-hover mb-0">
                            <thead>
                                <tr>
                                    <th scope="col" onClick={e => this.props.orderSortChange('order', 'custody')}>
                                        Tài khoản {orderTableSort.field === 'custody'
                                            ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                                : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                                    <th scope="col" onClick={e => this.props.orderSortChange('order', 'subaccount')}>
                                        Tiểu khoản {orderTableSort.field === 'subaccount'
                                            ? (orderTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                                : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
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
                                {!ordersRejectedTable.length
                                    ? (<tr><td colSpan={12} className="text-center">Không có dữ liệu hiển thị</td></tr>)
                                    : ordersRejectedTable.map(orderItm => (
                                        <tr>
                                            <td>{orderItm.custody}</td>
                                            <td>{orderItm.subAccount}</td>
                                            <td>{orderItm.instrument}</td>
                                            <td>{orderItm.subAccount.includes('FDS') ? (orderItm.side==='buy' ? 'long' : 'short') :  orderItm.side}</td>
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
                    </div>
                </div>
            </div>
        )
    }
}