import * as React from 'react';
import { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Requireable } from 'prop-types';
import { Form } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';
import AntdSchemaFormContext from './context';
import FormObject from './components/FormObject/FormObject';
import getObjectFromValue from './utils/getObjectFromValue';
import { isObject } from './utils/type';
import languagePack from './languagePack';
import { SchemaItem, ContextValue } from './types';

interface SchemaFormProps extends FormComponentProps {
  json: SchemaItem;
  value?: any;
  onOk?: Function;
  onCancel?: Function;
  okText?: string | number;
  cancelText?: string | number;
  footer?: Function;
  customComponent?: object;
  languagePack?: object;
}

interface SchemaFormState {
  value: object;
  language: string;
  languagePack: object;
}

// @ts-ignore
@Form.create()
class SchemaForm extends Component<SchemaFormProps, SchemaFormState> {
  static propTypes: {
    json?: Requireable<object>;
    value?: Requireable<object>;
    onOk?: Requireable<Function>;
    onCancel?: Requireable<Function>;
    okText?: Requireable<string | number>;
    cancelText?: Requireable<string | number>;
    footer?: Requireable<Function>;
    customComponent?: Requireable<object>;
    languagePack?: Requireable<object>;
  } = {
    json: PropTypes.object,
    value: PropTypes.object,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    okText: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    cancelText: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    footer: PropTypes.func,
    customComponent: PropTypes.objectOf(PropTypes.func),
    languagePack: PropTypes.object
  };
  static defaultProps: {
    customComponent: object;
  } = {
    customComponent: {}
  };

  constructor(props: SchemaFormProps, ...argu: Array<any>) {
    super(props, ...argu);

    const { value }: SchemaFormProps = this.props;
    // 获取系统语言
    const language: string = typeof window === 'object' // 服务器端渲染判断
      ? (window.navigator.language || window.navigator['userLanguage']).toLocaleLowerCase()
      : 'default';
    const customLangPack: object | undefined = this.props.languagePack; // 自定义语言包
    const langP: object = isObject(customLangPack)
      ? customLangPack
      : (language in languagePack ? languagePack[language] : languagePack['default']); // 语言包

    this.state = {
      value,
      language,
      languagePack: langP
    };
  }

  componentDidMount(): void {
    const { value }: SchemaFormState = this.state;
    const { form }: SchemaFormProps = this.props;
    const obj: object = getObjectFromValue(value);

    form.setFieldsValue(obj);
  }

  static getDerivedStateFromProps(nextProps: SchemaFormProps, prevState: SchemaFormState): { value: object } | null {
    if (nextProps.value !== prevState.value) {
      const { form, value }: SchemaFormProps = nextProps;
      const obj: Object = getObjectFromValue(value);

      form.resetFields();
      form.setFieldsValue(obj);

      return { value: nextProps.value };
    }

    return null;
  }

  render(): React.ReactNode {
    const { form, json, onOk, onCancel, okText, cancelText, footer, customComponent }: SchemaFormProps = this.props;
    const { language, languagePack }: SchemaFormState = this.state;
    const contextValue: ContextValue = {
      form,
      customComponent,
      language, // 系统语言
      languagePack // 语言包
    };

    return (
      <AntdSchemaFormContext.Provider value={ contextValue }>
        <FormObject root={ json }
          onOk={ onOk }
          onCancel={ onCancel }
          okText={ okText }
          cancelText={ cancelText }
          footer={ footer }
        />
      </AntdSchemaFormContext.Provider>
    );
  }
}

export default SchemaForm;