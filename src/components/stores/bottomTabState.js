import bind from 'autobind-decorator';
import {observable, action} from 'mobx';

@bind
class BottomTabStateStore {
    //底部tab栏状态
    @observable
    state = [1, 0, 0]

    @action
    changeState(index) {
        this.state = this
            .state
            .map((res, index2) => index == index2 && 1 || 0);
    }

    @action
    initState() {
        let locationHref = location.href;
        this.state = locationHref.indexOf('profile') != -1 && [0, 0, 1];
        this.state = locationHref.indexOf('myCart') != -1 && [0, 1, 0] || this.state;
        this.state = (locationHref.indexOf('profile') == -1 && locationHref.indexOf('myCart') == -1 && [1, 0, 0]) || this.state;
    }
}

export default BottomTabStateStore;
