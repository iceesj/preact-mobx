// 异步模块加载组件，可以提前缓存需要预加载的组件

import { h, Component } from 'preact';

const cacheCompontents = {};

class AsyncRoute extends Component {

  loadComponent() {
    this.props.component(this.props.url, ({component}) => {
      cacheCompontents[this.props.cname] = component;
      this.setState({});
    });
  }

  componentDidMount() {
    this.loadComponent();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.url && this.props.url !== nextProps.url) {
      this.setState({}, this.loadComponent.bind(this));
    }
  }

  render() {
    const localComponent = cacheCompontents[this.props.cname];
    if (localComponent) {
      this.props.loading && this.props.loading(true); // hide loading
      return h(localComponent, this.props);
    } else if (this.props.loading) {
      return this.props.loading();
    }
    return null;
  }
}

export default AsyncRoute;

export function loadComponent (getComponent) {
  return (url, cb) => {
    getComponent().then(module => {
      let loadModule = {component: module.default};
      cb ? cb(loadModule) : cacheCompontents[getComponent.cname] = module.default;
    });
  }
};
