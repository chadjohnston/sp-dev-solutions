import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';

import CRManagementContainer from './components/Container/CRManagementContainer';
import { ICRManagementContainerProps } from './components/Container/ICRManagementContainerProps';
import { IChangeRequestManagementWebPartProps } from './IChangeRequestManagementWebPartProps';
import { provisionManager as ProvisionManager } from '../../libraries/index';
import { ICRManagementDataProvider } from './dataProviders/ICRManagementDataProvider';
import { CRManagementDataProvider } from './dataProviders/CRManagementDataProvider';
import { MockCRManagementDataProvider } from './dataProviders/MockCRManagementDataProvider';

export default class ChangeRequestManagementWebPart extends BaseClientSideWebPart<IChangeRequestManagementWebPartProps> {
  private _isInitialized: boolean = false;
  private _dataProvider: ICRManagementDataProvider;

  protected async onInit(): Promise<void> {
    this.context.statusRenderer.displayLoadingIndicator(this.domElement, "Loading List");

    if (Environment.type === EnvironmentType.Local) {
      this._isInitialized = true;
      this._dataProvider = new MockCRManagementDataProvider();
      return super.onInit();
    }
    else {
      return ProvisionManager
        .checkSPlistsExist(this.context)
        .then((prop: boolean) => {
          this._isInitialized = prop;
          this._dataProvider = new CRManagementDataProvider(this.context);
          return super.onInit();
        }, (er: any) => {
          return super.onInit();
        });
    }
  }

  public render(): void {
    const element: React.ReactElement<ICRManagementContainerProps> = React.createElement(
      CRManagementContainer,
      {
        context: this.context,
        displayMode: this.displayMode,
        isInitialized: this._isInitialized,
        dataProvider: this._dataProvider
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
}