import {h, Component} from 'preact';
import {route} from 'preact-router';
import style from './footer.less';
import {observer, connect} from "mobx-preact";

@connect(['bottomTabStore'])
@observer
export default class Footer extends Component {

    constructor(props) {
        super(props);
		this.bottomTabStore = this.props.bottomTabStore;
		// this.cartStore = this.props.cartStore;
    }
    routePath(path, index) {
        this.bottomTabStore.changeState(index);
        path && route(path);
    }

    componentDidMount() {
		this.bottomTabStore.initState();
        this
            .base
            .addEventListener('touchmove', e => e.preventDefault());
    }

    render({}, {state}) {
        return (
            <div class={style.footer}>
                <div
                    onClick={this
                    .routePath
                    .bind(this, '/', 0)} style={this.bottomTabStore.state[0] && {'color':'#aa2930'} || {'color':'#6d6d6d'}}>首页<span class={this.bottomTabStore.state[0] && style.icon1Active || style.icon1}></span></div>
                <div
                    onClick={this
                    .routePath
					.bind(this, '/myCart', 1)} style={this.bottomTabStore.state[1] && {'color':'#aa2930'} || {'color':'#6d6d6d'}}>购物车<span class={this.bottomTabStore.state[1] && style.icon2Active || style.icon2}></span>
					</div>
                <div
                    onClick={this
                    .routePath
                    .bind(this, '/profile', 2)} style={this.bottomTabStore.state[2] && {'color':'#aa2930'} || {'color':'#6d6d6d'}}>我的<span class={this.bottomTabStore.state[2] && style.icon3Active || style.icon3}></span></div>
            </div>
        );
    }
}
