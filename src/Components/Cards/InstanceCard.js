import React, {Component} from 'react';
import {
  Icon,
  Card,
  Badge,
  Dropdown,
  Button,
  Col,
  Row,
  Menu,
  message,
  Modal,
  Upload,
  Form
} from 'antd';
import {cardStyles, vmCard, cardIcon, cardIcon2} from '../../theme/styles';
import {Link} from "react-router-dom";
import {startStopVM, getVDIToken, destroyVM} from '../Server/Blueprint';
import {setConsoleKey} from '../Server/Compartment';
import vmImageH from '../../theme/images/vm.png';
import vmImage from '../../theme/images/vmg.png';
import Popup from 'popup-window';
var FA = require('react-fontawesome');


const { Meta } = Card;
const FormItem = Form.Item;


class InstanceCard2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgSrc: vmImage,
      vmToken: "",
      popOpen: false,
      win: null,
      upload: false,
      fileList: [],
      file: null,
      k: null
    };
  }
  componentWillReceiveProps(){
    
  }
  componentDidMount() {
    this.setState({ k: this.props.k });
  }
  runVMType() {
    console.log(this.state.k);
    if (this.state.k) {
      this.launchConsole(this.state.vmID);
    } else if (this.state.k === false) {
      this.setState({ upload: true });
    } else
      console.log(this.props.vmID);  
      this.launchVM(this.props.vmID);
  }

  launchConsole(ip) {
    var that = this;
    var newWindow = window.open("http://129.146.85.80:2222/ssh/host/"+ip, "_blank", "toolbar=no, menubar=no,scrollbars=yes,resizable=yes,width=" + window.screen.width + ",height=" + window.screen.height);

    that.setState({popOpen: true});
  }

  launchVM(vmID) {
    var that = this;

    var w = window.screen.availWidth * .95;
    var h = window.screen.availHeight * .95;
    var message = {
      token: vmID,
      width: w,
      height: h
    };
    var newWindow = window.open("http://129.146.85.80/", "_blank", "toolbar=no, menubar=no,scrollbars=yes,resizable=yes,width=" + window.screen.width + ",height=" + window.screen.height);
    var intervalID = setInterval(function () {
      newWindow.postMessage(message, "*");
    }, 1000);

    //listen to holla back
    window.addEventListener('message', function (event) {
      if (event.data) 
        console.log('that shit worked.');
      }
    , false);
    that.setState({vmToken: this.props.vmID});
    that.setState({popOpen: true});
  }

  handleSubmit = (e) => {
    var that = this;
    e.preventDefault();
    this
      .props
      .form
      .validateFields((err, values) => {
        const {fileList} = this.state;
        const formData = new FormData();
        formData.append('ip', this.props.vmID);
        formData.append('file', this.state.file);
        console.log(this.props.vmID);
        setConsoleKey(formData).then(a => {
          if (a === 'OK') {
            this.setState({ upload: false });
            this.props.refreshOCI();
          }
        });
      });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { uploading } = this.state;
    const props = {
      action: '//jsonplaceholder.typicode.com/posts/',
      onRemove: (file) => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: (file) => {
        console.log(file);
        this.setState({ fileList: [] });
        this.setState({ file: file });
        this.setState(({ fileList }) => ({
            fileList: [...fileList, file],
        }));
          return false;
      },
      fileList: this.state.fileList,
    };
    return (
      <span>
        <Card
          style={{vmCard}}
          cover={<FA
                    name={this.props.t === 'vm' ? 'television' : 'terminal'}
                    style={cardIcon2}
                  />}
          actions={[<Icon type="rocket" onClick={() => this.runVMType()}/>]}
        >
          <Meta
            avatar={<Icon style={{ fontSize: 32}} type={this.props.t === 'vm' ? 'windows' : 'qq'}/>}
            title={this.props.title}
            description={this.props.t === 'vm' ? 'Windows VM' : 'Linux Console'}
          />
        </Card>
        <Modal
          title="Upload OpenSSL Key"
          visible={this.state.upload}
          closable={false}
          footer={null}>
          <Form onSubmit={this.handleSubmit} className="comp-form">
            <FormItem hasFeedback>
              {getFieldDecorator('upload', {
                rules: [
                  {
                    required: true,
                    message: 'Please upload OpenSSL key!'
                  }, {
                    validator: this.checkConfirm
                  }
                ]
              })(
                <div>

                  <Upload {...props}>
                  <Button size="large">
                      <Icon type="upload"/>
                      Upload Private Key
                    </Button>
                  </Upload>
                </div>
              )}
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit">Upload</Button>
            </FormItem>
          </Form>
        </Modal>
      </span>
    );
  }
}

const InstanceCard = Form.create()(InstanceCard2);

export default InstanceCard;