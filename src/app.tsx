import * as React from 'react';
import * as io from 'socket.io-client';
import { PRICE_SERVICE_WDS } from './config/app';
import { HeaderContainer, AccountSummaryContainer, AccountManagerContainer, TransactionContainer } from './components';
import { ReportContainer } from './components/Report';

let socket;
interface Props {
  userObj: any
}

export class App extends React.Component<Props> {
  state = {
    windowWidth: $(window).width(),
    windowHeight: $(window).height()
  }

  constructor(props) {
    super(props);
    // socket connection
    socket = io.connect(PRICE_SERVICE_WDS, {
      transports: ['websocket']
    });
    socket.on('reconnect_attempt', () => {
      socket.io.opts.transports = ['polling', 'websocket'];
    });

    this.handleScreenRotate = this.handleScreenRotate.bind(this);
  }

  componentDidMount() {
    var supportsOrientationChange = "onorientationchange" in window,
      orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

    window.addEventListener(orientationEvent, this.handleScreenRotate, false);
  }

  handleScreenRotate() {
    this.setState({
      windowWidth: $(window).width(),
      windowHeight: $(window).height()
    });
  }

  render() {
    const { windowWidth, windowHeight } = this.state;
    // Chieu cao cac panel
    const threePartHeight = Number((windowHeight * 3 / 5).toFixed(1));
    const twoPartHeight = Number((windowHeight * 2 / 5).toFixed(1));
    return (
      <div>
        <HeaderContainer width={windowWidth} userObj={this.props.userObj} />
        <div className="tab-content px-0" style={{marginTop: '58px'}}>
          <div className="tab-pane active" id="TransactionTab">
            <AccountSummaryContainer height={threePartHeight - 42} userObj={this.props.userObj} socket={socket} />
            <TransactionContainer height={twoPartHeight} userObj={this.props.userObj} />
          </div>
          <div className="tab-pane fade" id="AccountManagerTab">
            <AccountManagerContainer height={windowHeight - 42} userObj={this.props.userObj} />
          </div>
          <div className="tab-pane fade" id="ReportTab">
            <ReportContainer userObj={this.props.userObj} />
          </div>
        </div>
        <div id="loading" className='loading' style={{ display: 'none' }}>
            <div className='spiner orange'></div>
            <h6 className='mt-2'>Hệ thống đang xử lý...</h6>
          </div>
      </div>
    );
  }
}
