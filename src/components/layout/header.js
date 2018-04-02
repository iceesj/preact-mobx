import {h, Component} from 'preact';
import {route} from 'preact-router';
import style from './header.less';
import appInfo from '../../utils/app';

export default class Header extends Component {

    constructor(props) {
        super(props);
    }
    routeUrl(){
        route(this.props.backUrl);
    }
    componentDidMount() {
    }

    render({title,backUrl}, {}) {
        return (
            <div class={style.header + ' ' + (appInfo.liveIosApp ? style.headerPadding : '')}>
              <div class={style.title}>{title}</div>
              { backUrl && <div class={style.leftBack} onClick={this.routeUrl.bind(this)}></div> }
            </div>
        );
    }
}
