import * as React from 'react';
import { PlaceOrder } from './components/PlaceOrder';
import { OrderWorking } from './components/OrderWorking';
import { ListOrder } from './components/ListOrder';
import { instruments } from '../AccountSummary/actions/accountSummary';
import { stocksDataInit, stocksDataPSInit } from '../AccountSummary/actions/stocksData';
import { lastStocksPrice } from '../../reducers/accountSummary';
import { validatePrice, showLoading } from '../../config/utils';
import { genNotificationLog, ORDER_LOTSIZE, showToast } from '../../common/constants/app';
import { placeOrder, getOrdersCancelled, getAccountSummary, getState } from '../../api/accounts';
import { Guid } from 'guid-typescript';
import { fetchLastPriceStock } from '../../api/others';

interface Props {
  height: number,
  userObj: any,
  excessEquity: any,
  orders: any,
  orderBasketTableSort: any,
  orderTableSort: any,
  accountSummary: any,
  orderSortChange: (table, field) => void,
  updateListOrders: (userId, custody, subAcc, refreshClick) => void
  refreshAccountSummary: (userId, showLoading) => void
}

export class Transaction extends React.Component<Props, {}> {

  state = {
    placeOrders: [],
    listSymbolSearch: [],
    orderCancel: [],
    gType: 'CS',
    lastPriceStockTra: []
  }

  constructor(props) {
    super(props);
    this.genListOrders = this.genListOrders.bind(this);
    this.symbolSearch = this.symbolSearch.bind(this);
    this.updateListOrders = this.updateListOrders.bind(this);
    this.placeOrderBasket = this.placeOrderBasket.bind(this);
  }

  componentDidMount() {
    fetchLastPriceStock().then(res => {
      console.log(1000, res.d.find(x => x.symbol === 'VN30F2206'));
      if (res.s === 'ok') {
        this.setState({
          lastPriceStockTra: res.d
        })
      }
    });
    setInterval(() => {
      this.updateListOrders(false);
    }, 30000);
    getOrdersCancelled(this.props.userObj.id).then(orderCancel => {
      if (orderCancel.s === 'ok') {
        this.setState({ orderCancel: orderCancel.d });
      }
    });

  }



  symbolSearch(symbol) {
    $('#symbolSearchResult').show();
    var groupType = localStorage.getItem('Gtype');
    if (groupType === 'CS')
      this.setState({ listSymbolSearch: stocksDataInit.filter(s => s.symbol.indexOf(symbol) === 0) });
    else
      this.setState({ listSymbolSearch: stocksDataPSInit.filter(s => s.symbol.indexOf(symbol) === 0) });
  }

  loadStockInfo(symbol) {
    var stockObj = undefined;
    var groupType = localStorage.getItem('Gtype');
    if (groupType === 'CS')
      stockObj = stocksDataInit.find(s => s.symbol === symbol);
    else
      stockObj = stocksDataPSInit.find(s => s.symbol === symbol);

    if (stockObj !== undefined) {
      if (stockObj.market === 'upcom') {
        $('#orderUnit').html('<option value="100">100</option><option value="1000">1,000</option><option value="10000">10,000</option>');
        $('#orderType').html('<option value="limit">Limit</option>');
        $('#stockInfo label:nth-child(2)').html('Trần <span id="ceilingPrice" class="hit-ceil ml-2">' + stockObj.ceiling + '</span>');
        $('#stockInfo label:nth-child(3)').html('Sàn <span id="floorPrice" class="hit-floor ml-2">' + stockObj.floor + '</span>');
        $('#stockInfo label:nth-child(4)').html('TC <span id="referencePrice" class="hit-reference ml-2">' + stockObj.reference + '</span>');
      }
      else if (stockObj.market === 'deri') {
        $('#orderUnit').html('<option value="1">1</option><option value="10">10</option><option value="100">100</option>');
        $('#orderType').html('<option value="limit">Limit</option><option value="market">Market</option>');

        $('#stockInfo label:nth-child(2)').html('Trần <span id="ceilingPrice" class="hit-ceil ml-2">' + stockObj.ceiling.val + '</span>');
        $('#stockInfo label:nth-child(3)').html('Sàn <span id="floorPrice" class="hit-floor ml-2">' + stockObj.floor.val + '</span>');
        $('#stockInfo label:nth-child(4)').html('TC <span id="referencePrice" class="hit-reference ml-2">' + stockObj.reference.val + '</span>');
      }
      else {
        $('#orderUnit').html('<option value="100">100</option><option value="1000">1,000</option><option value="10000">10,000</option>');
        $('#orderType').html('<option value="limit">Limit</option><option value="market">Market</option>');
        $('#stockInfo label:nth-child(2)').html('Trần <span id="ceilingPrice" class="hit-ceil ml-2">' + stockObj.ceiling + '</span>');
        $('#stockInfo label:nth-child(3)').html('Sàn <span id="floorPrice" class="hit-floor ml-2">' + stockObj.floor + '</span>');
        $('#stockInfo label:nth-child(4)').html('TC <span id="referencePrice" class="hit-reference ml-2">' + stockObj.reference + '</span>');
      }
      $('#orderPrice').removeAttr('disabled').val('');
      $('#stockInfo label:nth-child(1)').text(stockObj.symbol + ' - ' + stockObj.market.toUpperCase());
      $('#stockInfo').show();
    }
  }

  genListOrders() {
    var placeOrders = [];
    var symbol = $('#orderSymbol').val().toString().trim().toUpperCase();
    var rate = Number($('#orderRate').val());
    var unit = Number($('#orderUnit').val());
    // var minUnit = Number($('#orderUnit option:nth-child(1)').attr('value'));
    var type = $('#orderType').val();

    var price = Math.round(Number($('#orderPrice').val()) * 1000);
    var pricePS = Number($('#orderPrice').val());
    if (symbol === '' || unit === 0 || type === '' || (type === 'limit' && price === 0)) {
      showToast('Thông báo', 'Vui lòng nhập đầy đủ thông tin', 'warning', 100000);
      return;
    }

    var referPrice = Number($('#stockInfo #referencePrice').text()) * 1000;
    var floorPrice = Number($('#stockInfo #floorPrice').text()) * 1000;
    var ceilingPrice = Number($('#stockInfo #ceilingPrice').text()) * 1000;
    var stockPriceObj = lastStocksPrice.find(el => el.symbol === symbol);

    if (stockPriceObj === undefined) {
      showToast("Thông báo", "Không tìm thấy mã chứng khoán", "error");
      return;
    }

    var orderQty = Number($('#orderQuantity').val());
    var grid = $('#ulGroupsTab .nav-link.active').attr('group-id');
    var subAccCount = $('input[type="checkbox"][class="cbAccount"][group-id="' + grid + '"]:checked').length;
    if (orderQty != 0) {
      if (subAccCount > 1) {
        showToast('Thông báo', 'Vui lòng chọn 1 tiểu khoản với trường hợp đặt theo khối lượng.', 'error', 300);
        $('#orderQuantity').val('');
        return;
        // $('input[type="checkbox"][class="cbAccount"][group-id="' + grid + '"]').prop('checked', false);
      }
    }

    var marketPrice = stockPriceObj.price;
    var totalPlaceQty = 0;
    var subAccCheckedArr = $('#accountPanel .tab-pane.active input.cbAccount:checked');
    var countReturn = 0;
    showLoading(true);

    $.each(subAccCheckedArr, (index, row) => {
      var accObj = this.props.excessEquity.find(acc => acc.subAccount === $(row).attr('subaccount-id'));
      getAccountSummary(this.props.userObj.id, accObj.custody, accObj.subAccount, symbol, price).then(accSum => {
        countReturn++;
        if (accSum.s === 'ok') {
          var position = accObj.positions.find(p => p.instrument === symbol);
          var positionQty = position === undefined ? 0 : position.totalQty;
          var buyPlacingQty = 0, sellPlacingQty = 0;
          var orderObj = this.props.orders.find(el => el.subAccount === $(row).attr('subaccount-id'));
          orderObj.orders.filter(el => el.instrument === symbol && (el.status === 'placing' || el.status === 'working' || (el.status === 'filled' && el.filledQty < el.qty))).forEach(itm => {
            if (!this.state.orderCancel.includes(itm.id)) {
              if (itm.side === 'buy') {
                if (itm.status !== 'filled')
                  buyPlacingQty += itm.qty;
                else if (orderObj.orders.find(fo => fo.parentId === itm.id) === undefined)
                  buyPlacingQty += (itm.qty - itm.filledQty);
              } else {
                if (itm.status !== 'filled')
                  sellPlacingQty += itm.qty;
                else if (orderObj.orders.find(fo => fo.parentId === itm.id) === undefined)
                  sellPlacingQty += (itm.qty - itm.filledQty);
              }
            }
          });
          debugger
          var qty = 0, side = '';
          var maxBuyQty = Number(accSum.d.maxqtty);
          if (maxBuyQty <= 0 && !accObj.subAccount.includes('FDS'))
            showToast('Đưa vào giỏ lệnh', 'Sức mua tiểu khoản [' + accObj.subAccount + '] bằng 0 hoặc chưa đạt đơn vị KL tối thiểu.', 'warning', 100000);

          var lastRate = '';
          if (rate > 0) {
            // Tinh toan buy/sell, qtty
            var rateValue = (accObj.nav * rate) / 100;
            var rateQty = Math.floor((rateValue / marketPrice) / unit) * unit;
            price = type !== 'market' ? price : marketPrice;

            if (rateQty - positionQty >= 0) {
              qty = rateQty - positionQty;
              side = 'buy';
            }
            else if (positionQty - rateQty > 0) {
              qty = positionQty - rateQty;
              if (qty > position.qty)
                qty = position.qty;
              side = 'sell';
            }

            if (qty >= maxBuyQty)
              qty = maxBuyQty;

            var placeQty = Math.floor(qty / unit) * unit;
            if (side === 'buy') {
              placeQty -= buyPlacingQty;
              placeQty = placeQty <= 0 ? 0 : placeQty;
              lastRate = (((positionQty + placeQty + buyPlacingQty) * marketPrice * 100) / accObj.nav).toFixed(2);
            }

            else {
              placeQty -= sellPlacingQty;
              placeQty = placeQty <= 0 ? 0 : placeQty;
              lastRate = (((positionQty - placeQty - sellPlacingQty) * marketPrice * 100) / accObj.nav).toFixed(2);
            }
          }
          else if (orderQty != 0) {
            price = type !== 'market' ? price : marketPrice;
            if (orderQty - positionQty > 0) {
              side = 'buy';
              qty = orderQty - positionQty;
            }
            else if (positionQty - orderQty >= 0) {
              side = 'sell';
              qty = positionQty - orderQty
            }

            if (qty >= maxBuyQty)
              qty = maxBuyQty;


            // if(qty > buyPlacingQty)

            var placeQty = Math.floor(qty / unit) * unit;
            if (side === 'buy')
              placeQty -= buyPlacingQty;
            else
              placeQty -= sellPlacingQty;

            placeQty = placeQty <= 0 ? Math.abs(placeQty) : placeQty;
            lastRate = (orderQty * marketPrice * 100 / accObj.nav).toFixed(2);
          }
          else if (position !== undefined) {
            qty = position.qty;
            side = 'sell';
          }

          if (placeQty > 0 && accObj.subAccount.includes('FDS') !== true) {
            totalPlaceQty += placeQty;
            placeOrders.push({
              symbol: symbol,
              subAccount: accObj.subAccount,
              custody: accObj.custody,
              positionQty: positionQty,
              side: side,
              qty: placeQty,
              placingQty: side === 'buy' ? buyPlacingQty : sellPlacingQty,
              type: type,
              price: price,
              currRate: ((positionQty * marketPrice * 100) / accObj.nav).toFixed(2),
              // lastRate: side === 'buy' ? (((positionQty + placeQty + buyPlacingQty) * marketPrice * 100) / accObj.nav).toFixed(2) : (((positionQty - placeQty - sellPlacingQty) * marketPrice * 100) / accObj.nav).toFixed(2),
              lastRate: lastRate
            });
          }
          //ps

          if (accObj.subAccount.includes('FDS')) {
            buyPlacingQty = 0;
            sellPlacingQty = 0;
            var palacingQty = 0;
            side = '';
            // debugger;
            orderObj.orders.filter(el => el.instrument === symbol && (el.status === 'placing' || el.status === 'working' || (el.status === 'filled' && el.filledQty < el.qty))).forEach(itm => {
              if (!this.state.orderCancel.includes(itm.id)) {
                if (itm.side === 'buy') {
                  side = itm.side;
                  if (itm.status !== 'filled')
                    palacingQty += itm.qty;
                  else if (orderObj.orders.find(fo => fo.parentId === itm.id) === undefined)
                    buyPlacingQty += (itm.qty - itm.filledQty);
                } else {
                  side = itm.side;
                  if (itm.status !== 'filled')
                    palacingQty -= itm.qty;
                  else if (orderObj.orders.find(fo => fo.parentId === itm.id) === undefined)
                    sellPlacingQty += (itm.qty - itm.filledQty);
                }
              }
            });

            var marketPriceTra = this.state.lastPriceStockTra.find(x => x.symbol === symbol).price;
            pricePS = type !== 'market' ? pricePS : marketPrice;

            // var placingQtyTra = 0
            // if (side === 'buy') {
            //   placingQtyTra = palacingQty;
            // } else if (side === 'sell') {
            //   placingQtyTra = 0 - palacingQty;
            // }

            var currRate = Number(localStorage.getItem('currRate'));
            var tyTrong = 0;
            //var klDat = 0;
            var klDat = Number($('#orderQuantity').val());

            for (var i = 0; i < this.props.accountSummary.length; i++) {
              if (this.props.accountSummary[i].subAccount === accObj.subAccount) {
                var unrealizedPl = position === undefined ? 0 : position.unrealizedPl;
                var id = position === undefined ? '' : position.id;
                var totalQty = position === undefined ? 0 : position.totalQty;
                var lastPrice = position === undefined ? 0 : position.lastPrice;
                var imrate = position === undefined ? 13 : position.imrate;
                var rsafe = position === undefined ? 0.7 : position.rsafe;
                var marketValue = lastPrice;
                var kqYeuCau = marketValue * totalQty * (imrate / rsafe / 100) * 100000;
                tyTrong = (kqYeuCau / this.props.accountSummary[i].balance) * 100;
                var kqYeuCau1 = marketValue * klDat * (imrate / rsafe / 100) * 100000;
                if (lastPrice == 0)
                  kqYeuCau1 = pricePS * klDat * (imrate / rsafe / 100) * 100000;
                currRate = Number(tyTrong.toFixed(2));
                if (klDat === 0) {
                  klDat = (rate - currRate) / imrate * rsafe / pricePS / 100000 * this.props.accountSummary[i].balance - palacingQty;
                  if (rate == 0)
                    klDat = 0 - totalQty - palacingQty;
                }
                else {
                  rate = ((kqYeuCau1 / this.props.accountSummary[i].balance) * 100);
                  klDat = klDat - totalQty - palacingQty;
                }

              }
            }

            if (klDat > 0) {
              side = 'long'
            } else if (klDat < 0) {
              side = 'short'
            }
            // debugger
            placeOrders.push({
              symbol: symbol,
              subAccount: accObj.subAccount,
              custody: accObj.custody,
              positionQty: positionQty,
              side: side,
              qty: klDat,
              placingQty: palacingQty,
              type: type,
              price: pricePS,
              currRate: currRate,
              lastRate: rate,
              tyTrong: tyTrong
            });
          }
        }

        if (countReturn === subAccCheckedArr.length) {
          showLoading(false);
          // debugger
          if (!placeOrders.length) showToast('Thông báo', 'Không có lệnh nào được thêm vào giỏ', 'warning');
          this.setState({ placeOrders: placeOrders });
          $("a[href='#PlaceOrderTab']")[0].click();
          $("#txtTotalPlaceQty strong").text('Tổng KL đặt: ' + totalPlaceQty.toLocaleString('en'));
        }

      }).catch(() => {
        countReturn++;
        if (countReturn === subAccCheckedArr.length) {
          showLoading(false);
          if (!placeOrders.length) showToast('Thông báo', 'Không có lệnh nào được thêm vào giỏ', 'warning');
          this.setState({ placeOrders: placeOrders });
          $("a[href='#PlaceOrderTab']")[0].click();
          $("#txtTotalPlaceQty strong").text('Tổng KL đặt: ' + totalPlaceQty.toLocaleString('en'));
        }
      });

    });

  }

  updateListOrders(refreshClick) {
    var cbAccountArr = $('#accountPanel .tab-pane.active input.cbAccount:checked');
    $.each(cbAccountArr, index => {
      this.props.updateListOrders(this.props.userObj.id, $(cbAccountArr[index]).attr('custody-id'), $(cbAccountArr[index]).attr('subaccount-id'), refreshClick);
    });
  }

  placeOrderBasket() {
    // debugger
    var cbOrderArr = $('input.cbOrder:checked');
    var countReturn = 0;
    if (!cbOrderArr.length) {
      showToast('Thông báo', 'Không có lệnh đặt', 'warning');
      return;
    }
    showLoading(true);
    var placeOrderRemain = [...this.state.placeOrders];
    $.each(cbOrderArr, index => {
      var custody = $(cbOrderArr[index]).attr('custody-cd');
      var subAcc = $(cbOrderArr[index]).attr('sub-account');
      var symbol = $(cbOrderArr[index]).attr('order-symbol');
      var qty = Math.abs(Number($(cbOrderArr[index]).attr('order-qty')));
      var side = $(cbOrderArr[index]).attr('order-side');
      var type = $(cbOrderArr[index]).attr('order-type');
      var price = Number($(cbOrderArr[index]).attr('order-price'));
      var lastRate = $(cbOrderArr[index]).attr('order-rate');
      var position = {};
      if (lastRate === "0.00") {
        position = this.props.accountSummary.find(accsum => accsum.subAccount === subAcc)
          .positions.find(pos => pos.instrument === symbol);
        position['userId'] = this.props.userObj.id;
        position['subAccount'] = subAcc;
      }
      // debugger
      placeOrder(
        this.props.userObj.id,
        custody,
        Guid.raw(),
        subAcc,
        symbol,
        qty,
        side,
        type,
        price,
        0,
        '',
        0,
        0,
        0,
        '').then(res => {
          countReturn++;
          if (countReturn === cbOrderArr.length) {
            showLoading(false);
            setTimeout(() => {
              this.props.updateListOrders(this.props.userObj.id, custody, subAcc, false);
            }, 3000);
          }
          if (res.s !== undefined && res.s === 'ok') {
            showToast("Đặt lệnh thành công", genNotificationLog(symbol, qty, side, type, price, 0, 0, 0), 'success');
            var placeOrderIndex = placeOrderRemain.findIndex(por => por.subAccount === subAcc)
            if (placeOrderIndex >= 0)
              placeOrderRemain.splice(placeOrderIndex, 1);
          }
          else {
            showToast("Lỗi đặt lệnh", genNotificationLog(symbol, qty, side, type, price, 0, 0, 0) + ' - ' + res.errmsg, 'error', 1000000);
          }

        }).catch(function () {
          countReturn++;
          if (countReturn === cbOrderArr.length) {
            showLoading(false);
            setTimeout(() => {
              this.props.updateListOrders(this.props.userObj.id, custody, subAcc, false);
            }, 3000);
          }
          showToast("Lỗi đặt lệnh", 'Hệ thống đang bận, vui lòng thử lại sau!', 'warning', 100000);
        });

    });
    $('input.cbAllOrder, input.cbOrder').prop('checked', false);
    this.setState({ placeOrders: placeOrderRemain });
  }

  render() {
    //  console.log(375, this.props.accountSummary) ;
    return (
      <div className="row mx-0">
        <div className="col-12 px-2 mb-3">
          <div className="card shadow">
            <div className="card-header">
              <h6 className="mb-0">Đặt lệnh</h6>
            </div>
            <div className="card-body p-2">
              <div className="px-2" style={{ position: 'relative', backgroundColor: '#dce9ef' }}>
                <div className="form-inline">
                  <label className="my-1 mr-2">Mã CK</label>

                  <input id="orderSymbol" type="text" className="form-control form-control-sm my-1 mr-3"
                    style={{ width: '100px', textTransform: 'uppercase' }}

                    onFocus={e => {
                      $(e.target).parent()
                        .find('.dropdown-menu .dropdown-item').removeClass('selected');
                    }}
                    onKeyUp={e => {
                      if ((e.which || e.keyCode) !== 38
                        && (e.which || e.keyCode) !== 40
                        && $(e.target).val().toString().trim() !== '') {
                        var tmpData = null;
                        var stockObj = undefined;
                        var groupType = localStorage.getItem('Gtype');
                        if (groupType === 'CS')
                          stockObj = stocksDataInit;
                        else
                          stockObj = stocksDataPSInit;
                        tmpData = stockObj.filter(el => el.symbol !== undefined && el.symbol.indexOf($(e.target).val().toString().toUpperCase()) === 0);
                        if (tmpData.length) {
                          this.setState({ listSearchSymbol: tmpData });
                          $(e.target).parent().find('.dropdown-menu').show();
                        } else {
                          this.setState({ listSearchSymbol: [] });
                          $(e.target).parent().find('.dropdown-menu').hide();
                        }
                      }
                      else if ($(e.target).val().toString().trim() === '') {
                        this.setState({ listSearchSymbol: [] });
                        $(e.target).parent().find('.dropdown-menu').hide();
                      }
                      this.symbolSearch($(e.target).val().toString().trim().toUpperCase())
                    }}
                    onKeyDown={e => {
                      if ((e.which || e.keyCode) === 38 || (e.which || e.keyCode) === 40) {
                        var ddMenu = $(e.target).parent().find('.dropdown-menu');
                        var itemIndex = ddMenu.find('.dropdown-item.selected').length
                          ? Number(ddMenu.find('.dropdown-item.selected').attr('dd-index')) : 0;
                        ddMenu.find('.dropdown-item').removeClass('selected');
                        if ((e.which || e.keyCode) === 40) {
                          itemIndex++;
                          if (itemIndex > ddMenu.find('.dropdown-item').length) itemIndex = 1;
                        } else {
                          itemIndex--;
                          if (itemIndex < 1) itemIndex = ddMenu.find('.dropdown-item').length;
                        }
                        ddMenu.find('.dropdown-item:nth-child(' + itemIndex + ')').addClass('selected');
                        // $(e.target).val(ddMenu.find('.dropdown-item:nth-child(' + itemIndex + ')').attr('dd-symbol'));
                      }
                    }}
                    onKeyPress={e => {
                      if ((e.which || e.keyCode) === 13) {
                        // debugger
                        let symbol = $(e.target).parent().find('.dropdown-menu .dropdown-item.selected').attr("dd-symbol");
                        // if (this.state.listSymbolSearch.length === 1) {
                        //   symbol = $("#txtSymbolSearch").val().toString().toUpperCase();
                        // }

                        this.loadStockInfo($(e.target).val().toString().trim().toUpperCase());
                      }
                    }}
                    onBlur={e => {
                      this.loadStockInfo($(e.target).val().toString().trim().toUpperCase());
                      setTimeout(() => {
                        $('#symbolSearchResult').hide();
                      }, 100)
                    }}
                  />
                  <div id="symbolSearchResult" className="dropdown-menu overflow-auto" style={{ maxHeight: '200px', fontSize: 'inherit', display: 'none', overflowY: 'auto' }}>
                    {this.state.listSymbolSearch.map((itm, index) => {
                      var hightlightSymbol = $('#orderSymbol').val().toString().toUpperCase();
                      var remainSymbol = itm.symbol.substring(hightlightSymbol.length, itm.symbol.length);
                      var symbolTitle = <span id={itm.symbol}><span id={itm.symbol}
                      // className="text-danger"
                      >{hightlightSymbol}</span>{remainSymbol}</span>;
                      if (itm.market === "deri") {
                        symbolTitle = <span id={itm.symbol}>Phái sinh - {symbolTitle}</span>;
                      } else if (itm.stock_type === "W") {
                        symbolTitle = <span id={itm.symbol}>Chứng quyền - {symbolTitle}</span>;
                      } else if (itm.stock_type === "S" || itm.market === "hnx" || itm.market === "upcom") {
                        symbolTitle = <span id={itm.symbol}>{itm.market.toUpperCase()} - {symbolTitle} - {itm.company}</span>;
                      }
                      return (<span className="dropdown-item cursor-pointer" dd-index={index + 1} dd-symbol={itm.symbol}
                        onMouseDown={e => {
                          // var symbol = $(e.target).closest('span').attr('id') != undefined ? $(e.target).closest('span').attr('id') : '';
                          var symbol;
                          // debugger
                          if ($(e.target).closest('span').attr('id') != undefined) {
                            symbol = $(e.target).closest('span').attr('id')
                          } else if ($(e.target).closest('span').attr('id') === undefined) {
                            var etarget = e.target['textContent'];
                            var splitEtarget = etarget.split(' - ')
                            symbol = splitEtarget[1];
                            var length = splitEtarget[0].length
                            if (splitEtarget[0].length == 9 && splitEtarget[0] !== 'Phái sinh') {
                              symbol = splitEtarget[0]
                            }
                          }
                          // debugger
                          $('#orderSymbol').val(symbol);
                          this.loadStockInfo(symbol);
                          setTimeout(() => {
                            $('#symbolSearchResult').hide();
                          }, 100)
                        }}
                        onMouseOver={e => {
                          $('#symbolSearchResult .dropdown-item').removeClass('selected');
                          $(e.target).addClass('selected');
                        }}>{symbolTitle}</span>)
                    })}
                  </div>

                  <label className="my-1 mr-2">Khối lượng</label>
                  <input id="orderQuantity" type="number" className="form-control form-control-sm my-1 mr-3" style={{ width: '100px' }}
                    onKeyUp={e => {
                      //   if (Number($(e.target).val()) < 0)
                      if ($(e.target).val() !== '' && Number($(e.target).val()) !== 0) {
                        $('#orderRate').val('');
                        $('#orderRate').prop("disabled", true);
                        $("#orderUnit").attr("disabled", "disabled");
                        var grid = $('#ulGroupsTab .nav-link.active').attr('group-id')
                        var subAccCount = $('input[type="checkbox"][class="cbAccount"][group-id="' + grid + '"]:checked').length;
                        if (subAccCount > 1) {
                          showToast('Thông báo', 'Vui lòng chọn 1 tiểu khoản với trường hợp đặt theo khối lượng.', 'error', 1000000);
                          $('#orderQuantity').val('');
                          // $('input[type="checkbox"][class="cbAccount"][group-id="' + grid + '"]').prop('checked', false);
                          return;
                        }
                      }
                      else {
                        $('#orderRate').prop("disabled", false);
                        $("#orderUnit").removeAttr('disabled');
                      }
                    }}
                    onChange={e => {
                      // debugger
                      if ($(e.target).val() !== '' && Number($(e.target).val()) !== 0) {
                        $('#orderRate').val('');
                        $('#orderRate').prop("disabled", true);
                        $("#orderUnit").attr("disabled", "disabled");
                        // $('inpulGroupsTabut[type="checkbox"][class="cbAccount"]').prop('checked', false);
                        var grid = $('#ulGroupsTab .nav-link.active').attr('group-id');
                        var subAccCount = $('input[type="checkbox"][class="cbAccount"][group-id="' + grid + '"]:checked').length;
                        if (subAccCount > 1) {
                          showToast('Thông báo', 'Vui lòng chọn 1 tiểu khoản với trường hợp đặt theo khối lượng.', 'error', 1000000);
                          $('#orderQuantity').val('');
                          return;
                          // $('input[type="checkbox"][class="cbAccount"][group-id="' + grid + '"]').prop('checked', false);
                        }

                      }
                      else {
                        $('#orderRate').prop("disabled", false);
                        $("#orderUnit").removeAttr('disabled');
                      }
                    }}
                  />

                  <label className="my-1 mr-2">Tỷ trọng (%)</label>
                  <input id="orderRate" type="number" className="form-control form-control-sm my-1 mr-3"
                    style={{ width: '100px' }}
                    onKeyUp={e => {
                      //   if (Number($(e.target).val()) < 0)
                      if ($(e.target).val() !== '') {
                        $('#orderQuantity').val('');
                        $('#orderQuantity').prop("disabled", true);
                      }
                      else
                        $('#orderQuantity').prop("disabled", false);
                    }}
                    onChange={e => {
                      //   if (Number($(e.target).val()) < 0)
                      if ($(e.target).val() !== '') {
                        $('#orderQuantity').val('');
                        $('#orderQuantity').prop("disabled", true);
                      }
                      else
                        $('#orderQuantity').prop("disabled", false);
                    }}
                  // onKeyUp={e => {
                  //   if (Number($(e.target).val()) < 0) { $(e.target).val(''); return; }
                  //   else if (Number($(e.target).val()) > 200) { $(e.target).val('200'); return; }
                  // }}
                  />

                  <label className="my-1 mr-2">Đơn vị KL</label>
                  <select id="orderUnit" className="form-control form-control-sm my-1 mr-3" style={{ width: '100px' }}>
                  </select>

                  <label className="my-1 mr-2">Lệnh</label>
                  <select id="orderType" className="form-control form-control-sm my-1 mr-3" style={{ width: '100px' }}
                    onChange={e => {
                      if (e.target.value === 'market') {
                        $('#orderPrice').val('').attr('disabled', 'disabled');
                      } else {
                        $('#orderPrice').removeAttr('disabled');
                      }
                    }}>
                  </select>

                  <label className="my-1 mr-2">Giá</label>
                  <input id="orderPrice" type="text" className="form-control form-control-sm my-1 mr-3"
                    style={{ width: '100px' }} onKeyUp={e => {
                      validatePrice(e);
                    }} onKeyPress={e => {
                      if ((e.which || e.keyCode) === 13) this.genListOrders();
                    }} />

                  <div id="stockInfo" style={{ display: 'none' }}>
                    <label className="float-left my-1 mr-3 font-weight-bold">AAA - HOSE</label>
                    <label className="float-left my-1 mr-3">Trần <span id='ceilingPrice' className="hit-ceil ml-2">13.45</span></label>
                    <label className="float-left my-1 mr-3">Sàn <span id='floorPrice' className="hit-floor ml-2">11.75</span></label>
                    <label className="float-left my-1 mr-3">TC <span id='referencePrice' className="hit-reference ml-2">12.6</span></label>
                  </div>
                  <button className="btn btn-primary btn-sm my-1" style={{ padding: '.15rem .5rem' }}
                    onClick={this.genListOrders}>Đưa vào giỏ lệnh</button>
                </div>

              </div>
              <div className="row mx-0" style={{ borderBottom: '1px solid #e0e0e0' }}>
                <ul className="nav nav-tabs" role="tablist">
                  <li className="nav-item">
                    <a className="nav-link active" data-toggle="tab" href="#PlaceOrderTab"
                      onClick={e => { $('#btnRefresh').hide(); $('#txtTotalPlaceQty').show(); }}>Giỏ lệnh</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" data-toggle="tab" href="#OrderWorkingTab"
                      onClick={e => { $('#txtTotalPlaceQty').hide(); $('#btnRefresh').show(); }}>Lệnh hoạt động</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" data-toggle="tab" href="#ListOrderTab"
                      onClick={e => { $('#txtTotalPlaceQty').hide(); $('#btnRefresh').show(); }}>Sổ lệnh trong ngày</a>
                  </li>
                </ul>
                <ul className="nav nav-tabs ml-auto" role="tablist">
                  <li id="txtTotalPlaceQty" className="nav-item" style={{ padding: '.6rem' }}>
                    <strong>Tổng KL đặt: 0</strong>
                  </li>
                  <li id="btnRefresh" className="nav-item" style={{ display: 'none' }}>
                    <img className="nav-link mt-1 cursor-pointer"
                      src={require('../../images/refresh-icon.png')} title='Refresh'
                      onClick={e => this.updateListOrders(true)} />
                  </li>
                </ul>
              </div>
              <div className="tab-content position-relative">
                <div id='orderPanelLoading' className='loading-data pt-3' style={{ display: 'none' }}>
                  <div className='spiner'></div>
                  <h6>Loading data...</h6>
                </div>
                <div className="tab-pane pt-2 active" id="PlaceOrderTab">
                  <PlaceOrder orders={this.state.placeOrders}
                    orderBasketTableSort={this.props.orderBasketTableSort}
                    orderSortChange={this.props.orderSortChange}
                    placeOrderBasket={this.placeOrderBasket}
                    accountSummary={this.props.accountSummary} />
                </div>
                <div className="tab-pane pt-2 fade" id="OrderWorkingTab">
                  <OrderWorking userObj={this.props.userObj} orders={this.props.orders}
                    orderTableSort={this.props.orderTableSort}
                    orderCancel={this.state.orderCancel}
                    orderSortChange={this.props.orderSortChange}
                    updateListOrders={this.props.updateListOrders}
                    refreshAccountSummary={this.props.refreshAccountSummary} />
                </div>
                <div className="tab-pane pt-2 fade" id="ListOrderTab">
                  <ListOrder orders={this.props.orders}
                    orderTableSort={this.props.orderTableSort}
                    orderCancel={this.state.orderCancel}
                    orderSortChange={this.props.orderSortChange} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
