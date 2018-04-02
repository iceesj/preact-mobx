import {h, Component} from 'preact';
import style from './style.less';
import Layout from '../layout/index';
import Footer from '../layout/footer';
// import MessageAlert from './MessageAlert';
import {route} from 'preact-router';
import {observer, connect} from "mobx-preact";

import appInfo from '../../utils/app';
const moment = appInfo.moment

// @connect(['cartStore'])
@observer
export default class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {};
		this.refs = {};
    }
    componentDidMount() {
		console.log('123')
	}
    render() {
        return (
			<Layout paddingApp={true} hideHeader={true}>
				<div>123</div>
                <Footer/>
            </Layout>
        )
    }
}
