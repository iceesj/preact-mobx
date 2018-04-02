import { h, Component } from 'preact';
import style from './toast.less';
import Portal from 'preact-portal';
const hookSelector = '.bodyHookAnchor';
export default class Alert extends Component{
    constructor(props){
      super(props);
      this.state = {
        message : '',
        yes : ()=>{this.setState({message : ''})},
        no : ()=>{this.setState({message : ''})}
      }
    }
    componentDidMount(){
      window.__alert = this.setState.bind(this);
    }
    okAction(){
      this.state.yes();
      this.setState({message : ''});
    }
    cancelAction(){
      this.state.no();
      this.setState({message : ''});
    }
    render(){
      let isRender = this.state.message;
      return(
        <Portal into={hookSelector}>
          {isRender &&
          <div class={style.auiAlertDialog} onTouchMove={(event)=>{event.preventDefault();}}>
              <div class={style.auiDialog}>
                    <div class={style.auiDialogBody} dangerouslySetInnerHTML={{
                      __html: this.state.message
                    }}></div>
                    <div class={style.auiDialogFooter}>
                        <div onClick={this.cancelAction.bind(this)} style={this.state.noStyle || {}} class={style.auiDialogBtn + ' ' + style.auiTextDanger}>{this.state.noText && this.state.noText || '取消'}</div>
                        <div onClick={this.okAction.bind(this)} style={this.state.yesStyle || {}} class={style.auiDialogBtn + ' ' + style.auiTextInfo}>{this.state.yesText && this.state.yesText || '确定'}</div>
                    </div>
              </div>
              <div class={style.auiMask}></div>
          </div> || null}
        </Portal>
      )
    }
}

export function toast(msg, showTime) {
  if (!msg) return;
  const _dom = document.createElement('div');
  const _span = document.createElement('span');

  _span.style.display = 'inline-block';
  _span.innerText = '' + msg;

  document.body.appendChild(_span);
  const _inner_ = getComputedStyle(_span);
  const _innerW = parseInt(_inner_.width);
  const _innerH = parseInt(_inner_.height);

  const baseFontSize = parseFloat(document.documentElement.style.fontSize) || 20;
  const _bodyWidth = document.body.clientWidth;
  const _limitW = _bodyWidth - 2 * baseFontSize;
  const _width = _innerW > _limitW ? _limitW : _innerW;
  _span.style.width = ((_width + 20) / baseFontSize) + 'rem';
  _span.style.height = (_innerH / baseFontSize) + 'rem';
  _span.style.left = - ((_width + 2 * baseFontSize) / baseFontSize) / 2 + 'rem';
  _dom.classList.add(style.toast);
  _dom.appendChild(_span);
  document.body.appendChild(_dom);

  setTimeout(() => {
    _dom.parentElement.removeChild(_dom);
  }, showTime || 1800);
  return _dom;
}
