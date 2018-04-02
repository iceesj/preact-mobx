import { h ,Component} from 'preact';
import style from './style.less';
import Alert from '../public/toast'

export default class Layout extends Component {

    render({ paddingApp, hideHeader, hideFooter, children }) {

      const layoutClass = [
        style.layout,
        !hideHeader && style.paddingTop || '',
        !hideFooter && style.paddingBottom || '',
        paddingApp && (hideHeader ? style.paddingApp : style.paddingAppHeader) || ''
      ].join(' ');

      return (
        <div class={layoutClass} id="renderEndDom">
          <Alert />
          {children}
        </div>
      );
    }
  }
