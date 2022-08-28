import { actionTypes } from '../../../common/constants/actionTypes';

export var stocksDataInit = [];
export var stocksDataPSInit = [];

export const initStocksDataAction = (socket) => (dispatch) => {
    // var count = 0;
    var groupName = "CS"
    $("#ulGroupsTab").on('click', 'li', function () {
        // alert($(this).text());
        if ($(this).text().includes('[CS]'))
            groupName = "CS"
        else
            groupName = "PS"
    });

    socket.on('initialStocksForOnline', (res) => {

        // if(++count === 2){
        //     stocksDataInit = stocksDataInit.concat(res.data);
        // } else {
        //     stocksDataInit = res.data;
        // }
        // console.log(res.data);

        if (res.stockTableId === 'basis') {
            stocksDataInit = res.data;
            // console.log(stocksDataInit);
        }
        else{
            stocksDataPSInit = res.data
            // console.log(stocksDataPSInit);
        }
    });

}

export const onChangeStocksDataAction = (socket) => (dispatch) => {
    socket.on('onChangeStockForOnline', (res) => {
        dispatch(onChangeStocksDataCompleted(res));
    });
}

const onChangeStocksDataCompleted = (stocks) => ({
    type: actionTypes.ACCOUNTSUMMARY_STOCKS_DATA_ONCHANGE,
    stocksOnChange: stocks
});
