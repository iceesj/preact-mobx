import { h, Component } from 'preact';
import { Router } from 'preact-router';
import {createHashHistory} from 'history';
import AsyncRoute, { loadComponent } from '../lib/asyncRoute';
import appInfo from '../utils/app'

import Index from './index';

const HomeComponent = ()=> System.import('./index');
HomeComponent.cname = 'index';

const hashHistory = createHashHistory();
const _loading = (hideLoading) => {
    const loadingDom = document.querySelector('.page_init_loading');
    if (!loadingDom) return;
    if (hideLoading) {
        loadingDom.classList.add('fadeOut');
        setTimeout(_ => loadingDom.style.zIndex = -1, 360);
    } else {
        loadingDom.classList.remove('fadeOut');
        loadingDom.style.zIndex = 1;
    }
};
if(hashHistory.location.pathname == '/' && appInfo.getInfo('localUser') && appInfo.getInfo('localUser').companyId){
	hashHistory.replace('/companyHomePage')
}
if(hashHistory.location.pathname == '/ds/' || hashHistory.location.pathname == '/ds'){
	hashHistory.replace('/')
}
export {hashHistory};

export default class App extends Component {
    /** Gets fired when the route changes.
     *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
     *	@param {string} event.url	The newly routed URL
     */

    componentDidMount(){
        let _push = hashHistory.push;
        hashHistory.push = (path, state) => {
            path != hashHistory.location.pathname && _push(path, state);
		};
		// loadComponent(MyCartComponent)();
		// loadComponent(ProfileComponent)();
    }
    handleRoute (e){};

    render() {
	return (
	    <Router history={hashHistory} onChange={this.handleRoute}>
            <AsyncRoute path="/" cname="home" component={loadComponent(HomeComponent)} loading={_loading} />
            <Index default />

            </Router>
	);
    }
}
