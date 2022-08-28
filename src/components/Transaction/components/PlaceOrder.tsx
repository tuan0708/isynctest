import { overflow } from 'html2canvas/dist/types/css/property-descriptors/overflow';
import { map } from 'jquery';
import * as React from 'react';
import { isTemplateTail } from 'typescript';
import { getPositions } from '../../../api/accounts';

interface Props {
    orders: any,
    orderBasketTableSort: any,
    orderSortChange: (table, field) => void,
    placeOrderBasket: () => void,
    accountSummary: any
}

export class PlaceOrder extends React.Component<Props, {}> {

    render() {

        const { orderBasketTableSort, orders } = this.props;
        if (orderBasketTableSort.isUp) {
            if (orderBasketTableSort.field === 'custody') {
                orders.sort((a, b) => (a.custody > b.custody) ? 1 : ((b.custody > a.custody) ? -1 : 0));
            } else if (orderBasketTableSort.field === 'positionQty') {
                orders.sort((a, b) => (a.positionQty > b.positionQty) ? 1 : ((b.positionQty > a.positionQty) ? -1 : 0));
            } else if (orderBasketTableSort.field === 'currRate') {
                orders.sort((a, b) => (a.currRate > b.currRate) ? 1 : ((b.currRate > a.currRate) ? -1 : 0));
            } else if (orderBasketTableSort.field === 'side') {
                orders.sort((a, b) => (a.side > b.side) ? 1 : ((b.side > a.side) ? -1 : 0));
            } else if (orderBasketTableSort.field === 'placeQty') {
                orders.sort((a, b) => (a.qty > b.qty) ? 1 : ((b.qty > a.qty) ? -1 : 0));
            } else if (orderBasketTableSort.field === 'placingQty') {
                orders.sort((a, b) => (a.placingQty > b.placingQty) ? 1 : ((b.placingQty > a.placingQty) ? -1 : 0));
            } else if (orderBasketTableSort.field === 'lastRate') {
                orders.sort((a, b) => (a.lastRate > b.lastRate) ? 1 : ((b.lastRate > a.lastRate) ? -1 : 0));
            }
        } else {
            if (orderBasketTableSort.field === 'custody') {
                orders.sort((a, b) => (a.custody < b.custody) ? 1 : ((b.custody < a.custody) ? -1 : 0));
            } else if (orderBasketTableSort.field === 'positionQty') {
                orders.sort((a, b) => (a.positionQty < b.positionQty) ? 1 : ((b.positionQty < a.positionQty) ? -1 : 0));
            } else if (orderBasketTableSort.field === 'currRate') {
                orders.sort((a, b) => (a.currRate < b.currRate) ? 1 : ((b.currRate < a.currRate) ? -1 : 0));
            } else if (orderBasketTableSort.field === 'side') {
                orders.sort((a, b) => (a.side < b.side) ? 1 : ((b.side < a.side) ? -1 : 0));
            } else if (orderBasketTableSort.field === 'placeQty') {
                orders.sort((a, b) => (a.qty < b.qty) ? 1 : ((b.qty < a.qty) ? -1 : 0));
            } else if (orderBasketTableSort.field === 'placingQty') {
                orders.sort((a, b) => (a.placingQty < b.placingQty) ? 1 : ((b.placingQty < a.placingQty) ? -1 : 0));
            } else if (orderBasketTableSort.field === 'lastRate') {
                orders.sort((a, b) => (a.lastRate < b.lastRate) ? 1 : ((b.lastRate < a.lastRate) ? -1 : 0));
            }
        }
        return (
            <div style={{ overflowX: 'scroll' }}>
                <table className="table table-sm table-bordered table-hover mb-0">
                    <thead>
                        <tr>
                            <th scope="col" className="text-center p-1" style={{ width: '100px' }}>
                                <button className="btn btn-success btn-sm py-0" onClick={this.props.placeOrderBasket}>Đặt lệnh</button>
                                <input type="checkbox" className='cbAllOrder' style={{ verticalAlign: 'middle', marginLeft: '5px' }}
                                    onClick={e => {
                                        $(e.target).parents('table').find('input[type="checkbox"]').prop('checked', $(e.target).prop('checked'));
                                    }} />
                            </th>
                            <th scope="col" onClick={e => this.props.orderSortChange('orderBasket', 'custody')}>
                                Tài khoản {orderBasketTableSort.field === 'custody'
                                    ? (orderBasketTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                            <th scope="col">Tiểu khoản</th>
                            <th scope="col">Mã CK</th>
                            <th scope="col" onClick={e => this.props.orderSortChange('orderBasket', 'positionQty')}>
                                KL tổng {orderBasketTableSort.field === 'positionQty'
                                    ? (orderBasketTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                            <th scope="col" onClick={e => this.props.orderSortChange('orderBasket', 'currRate')}>
                                Tỷ trọng hiện tại {orderBasketTableSort.field === 'currRate'
                                    ? (orderBasketTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                            <th scope="col" onClick={e => this.props.orderSortChange('orderBasket', 'side')}>
                                {localStorage.getItem('position')} {orderBasketTableSort.field === 'side'
                                    ? (orderBasketTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                            <th scope="col">Giá đặt</th>
                            <th scope="col" onClick={e => this.props.orderSortChange('orderBasket', 'placeQty')}>
                                KL đặt {orderBasketTableSort.field === 'placeQty'
                                    ? (orderBasketTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                            <th scope="col" onClick={e => this.props.orderSortChange('orderBasket', 'placingQty')}>
                                Lệnh chờ khớp (KL) {orderBasketTableSort.field === 'placingQty'
                                    ? (orderBasketTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>
                            <th scope="col" onClick={e => this.props.orderSortChange('orderBasket', 'lastRate')}>
                                Tỷ trọng cuối cùng {orderBasketTableSort.field === 'lastRate'
                                    ? (orderBasketTableSort.isUp ? (<i className="fas fa-sort-up ml-2 align-bottom"></i>)
                                        : (<i className="fas fa-sort-down ml-2 align-top"></i>)) : ''}</th>

                        </tr>
                    </thead>
                    <tbody>
                        {!this.props.orders.length
                            ? (<tr><td colSpan={13} className="text-center">Không có dữ liệu hiển thị</td></tr>)
                            : this.props.orders.map(itm => {
                                if (this.props.accountSummary) {
                                    //   console.log(20, this.props.orders)
                                    debugger
                                    var quantity = itm.qty;
                                    var side = itm.side;
                                    var positions = []
                                    var priceOder = 0;
                                    var totalKL = '0';
                                    localStorage.setItem('currRate', '0')
                                    if (itm.subAccount.includes('FDS')) {
                                        var orderQty = $("#orderUnit option:selected").text();
                                        if (orderQty === '1')
                                            quantity = Math.floor(Math.abs(itm.qty));
                                        else if (orderQty === '10' && itm.qty >= 5)
                                            quantity = Math.floor(Math.abs(itm.qty) / 10) * 10;
                                        else if (orderQty === '100' && itm.qty >= 50)
                                            quantity = Math.floor(Math.abs(itm.qty) / 100) * 100;
                                        else
                                            quantity = 0;

                                        if (itm.side === 'long')
                                            side = 'buy';
                                        else
                                            side = 'sell';
                                    }
                                }

                                return (
                                    <tr>
                                        <td className="text-center">
                                            <input type="checkbox" className='cbOrder'
                                                custody-cd={itm.custody} sub-account={itm.subAccount}
                                                order-symbol={itm.symbol} order-qty={quantity}
                                                order-side={side} order-type={itm.type}
                                                order-price={itm.price} order-rate={itm.lastRate} />
                                        </td>
                                        <td>{itm.custody}</td>
                                        <td>{itm.subAccount}</td>
                                        <td>{itm.symbol}</td>
                                        <td>{itm.positionQty}</td>
                                        <td>{itm.currRate}%</td>
                                        <td>{itm.side}</td>
                                        <td>{itm.price.toLocaleString('en')}</td>
                                        <td>{Math.abs(quantity)}</td>
                                        <td>{itm.placingQty.toLocaleString('en')}</td>
                                        <td>{Number(itm.lastRate).toFixed(2)}%</td>
                                    </tr>
                                )
                            })
                        }

                    </tbody>
                </table>
            </div>
        )
    }
}