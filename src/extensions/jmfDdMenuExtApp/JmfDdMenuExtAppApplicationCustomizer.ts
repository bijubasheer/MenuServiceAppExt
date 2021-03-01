import * as Msal from "msal";
import { override } from '@microsoft/decorators';
import { Log, ServiceScope } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName,
  ApplicationCustomizerContext
} from '@microsoft/sp-application-base';

import styles from './AppCustomizer.module.scss';
import * as strings from 'JmfDdMenuExtAppApplicationCustomizerStrings';
import { AadHttpClient, HttpClient, IHttpClientOptions, HttpClientResponse, HttpClientConfiguration, MSGraphClient  } from '@microsoft/sp-http';
import * as $ from 'jquery';
import {DealerInfoService, IDealerInfoService} from 'set-dd-dealer-info-library/lib/libraries/dealerInfoLibrary/DealerInfoLibraryLibrary';
import { IUserItem } from 'set-dd-dealer-info-library/lib/libraries/dealerInfoLibrary/IUserItem';
import { ISETDealerInfo } from 'set-dd-dealer-info-library/lib/libraries/dealerInfoLibrary/ISETDealerInfo';

require('myScript'); //Add a JS file
declare function setCookie(cname, cvalue, exdays): any;
declare function getCookie(cname): any;
declare function MyCookieFunction(): any;


const LOG_SOURCE: string = 'JmfDdMenuExtAppApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IJmfDdMenuExtAppApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
  Top: string;
  Bottom: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class JmfDdMenuExtAppApplicationCustomizer
  extends BaseApplicationCustomizer<IJmfDdMenuExtAppApplicationCustomizerProperties> {
  //private graphServiceInstance : IDealerInfoService;
  private _topPlaceholder: PlaceholderContent | undefined;
  private _bottomPlaceholder: PlaceholderContent | undefined;
  private myContext: ApplicationCustomizerContext;
  //private clientId:string = '1148b2ca-eded-4ea7-9f1e-4cce4bd47109'; //CORPSTG1
  private clientId:string = 'b045f213-4f67-4081-a843-c49af374fab0'; //SET Dealer Daily STG
  private menuAPIUrlBase = 'https://test-menuservice-a-webapi.aws.jmfamily.com/api/menu/Corpstg1dealerportal'

  private dealerData: ISETDealerInfo = null;
  private dealerInfoService: IDealerInfoService;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // Wait for the placeholders to be created (or handle them being changed) and then
    // render.
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);
    this.myContext = this.context;

    document.getElementById("spSiteHeader").style.display = "none";

    //const serviceScope: ServiceScope = this.context.serviceScope.getParent();
    this.dealerInfoService = this.context.serviceScope.consume(DealerInfoService.serviceKey as any) as DealerInfoService;

      // serviceScope.whenFinished((): void => {
      //   this.dealerInfoService = serviceScope.consume(DealerInfoService.serviceKey as any) as DealerInfoService;
      // });

    return Promise.resolve<void>();
  }

  
  private _renderPlaceHolders(): void {
    console.log("MenuServiceExtension._renderPlaceHolders()");
    console.log(
      "Available placeholders: ",
      this.context.placeholderProvider.placeholderNames
        .map(name => PlaceholderName[name])
        .join(", ")
    );

    // Handling the top placeholder
    if (!this._topPlaceholder) {
      this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Top,
        { onDispose: this._onDispose }
      );

      // The extension should not assume that the expected placeholder is available.
      if (!this._topPlaceholder) {
        console.error("The expected placeholder (Top) was not found.");
        return;
      }

      if (this.properties) {
        let topString: string = this.properties.Top;
        if (!topString) {
          topString = "(Top property was not defined.)";
        }
        

        if (this._topPlaceholder.domElement) {
          this.GetMenu()
            .then(response => {
              this._topPlaceholder.domElement.innerHTML = `
            <div class="${styles.app}">
              ${response}
            </div>
            `;
            });

        }
      }
    }

    // Handling the bottom placeholder
    if (!this._bottomPlaceholder) {
      this._bottomPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Bottom,
        { onDispose: this._onDispose }
      );

      // The extension should not assume that the expected placeholder is available.
      if (!this._bottomPlaceholder) {
        console.error("The expected placeholder (Bottom) was not found.");
        return;
      }

      // const elem: React.ReactElement<IReactFooterProps> = React.createElement(ReactFooter);  
      // ReactDOM.render(elem, this._bottomPlaceholder.domElement);     
    }
  }

  

  private _onDispose(): void {
    console.log('[MenuServiceExtension._onDispose] Disposed custom top and bottom placeholders.');
  }
  
  private async GetUserInfo():Promise<IUserItem> {
    if(!this.dealerInfoService)
    {
      this.dealerInfoService = this.context.serviceScope.consume(DealerInfoService.serviceKey as any) as DealerInfoService;
    }
    var userInfo = await this.dealerInfoService.GetUserInfo();
    // let client = await this.context.msGraphClientFactory.getClient();
    // let response = await client.api('/me').get();
    return userInfo;
  }
  private async GetDealerInfo(nameId):Promise<ISETDealerInfo> {
    /*
    //const getURL = "https://test-menuservice-a-webapi.aws.jmfamily.com/api/menu/Corpstg1dealerportal/dealerContext?nameId=" + nameId;
    const getURL = "https://set.dev.api.jmfamily.com/dd-gwmenusvc-sys/v1/api/dealerContext?nameId=" + nameId;
    let setNum = "";
     const requestHeaders: Headers = new Headers();
    requestHeaders.append('Content-type', 'application/json');

    console.log("About to get SET Number from within menu service");

     let client = await this.context.aadHttpClientFactory
      .getClient(this.clientId);
      let response = await client.get(getURL, AadHttpClient.configurations.v1);
      //let text = await response.text();
      this.dealerData = JSON.parse(await response.text());
      return this.dealerData;
    */
   
    if(!this.dealerInfoService)
    {
      this.dealerInfoService = this.context.serviceScope.consume(DealerInfoService.serviceKey as any) as DealerInfoService;
    }
    this.dealerData = await this.dealerInfoService.GetDDInfo(nameId);
    return this.dealerData;
   
  }
  private async GetMenu(): Promise<any> {

    var  userInfo = await this.GetUserInfo();
    console.log("userPrincipalName  fetched from library = " + userInfo.userPrincipalName);
    
    var nameId = "QAALLPAM"; //userInfo.userPrincipalName.replace('corpstg1.jmfamily.com', 'JM');
    var dealerInfo =  await this.GetDealerInfo("QAALLPAM");
    var setNum = dealerInfo.setNumber;
            
    const postURL = "https://set.dev.api.jmfamily.com/dd-gwmenusvc-sys/v1/api/menu";
    //const postURL = "https://test-menuservice-a-webapi.aws.jmfamily.com/api/menu/Corpstg1dealerportal";
    
    const body: string = '{"NameId":"QAALLPAM@JM","FirstName":"QAALLPAM","LastName":"QAALLPAM","Spin":"","SETNumber":"' + setNum + '","CallerName":"Sharepointonline","BrowserIE8":"True"}';
    
    const requestHeaders: Headers = new Headers();
    requestHeaders.append('Content-type', 'application/json');

    const httpClientOptions: IHttpClientOptions = {
      body: body,
      headers: requestHeaders,
      method: "POST"
    };

    console.log("About to get Menu.");
    var myClientId;
    return this.context.aadHttpClientFactory
      .getClient(this.clientId)
      .then((client: AadHttpClient): void => {
        myClientId = this.clientId;
        client
          .post(postURL, AadHttpClient.configurations.v1, httpClientOptions)
          .then((response: HttpClientResponse) => {
            return response.text();
          })
          .then(menuHTML => {
            //console.log(menuHTML);

            this._topPlaceholder.domElement.innerHTML = `
              <div class="no-index" id="set-menu-top">
                ${menuHTML}
              </div>`;
            $.getScript("https://dp2stg-menu.setdealerdaily.com/Content/Scripts/MenuService-Scripts.min.js", function () {
              console.log("Menus Service Script loaded but not necessarily executed.");
            });

          
            let myContext = this.context;
            let myPlaceHolder = this._topPlaceholder;
            
            MyCookieFunction();

            $('.mydealer').on("click", async function () {
              
              var positionofcolon = this.textContent.indexOf(':');
              var dealerName = this.textContent.substring(positionofcolon + 1);
              var setNumber = this.textContent.substring(0, positionofcolon);
              
              ChangeDealershipAAD(setNumber, myContext, myPlaceHolder, myClientId);

            });

            return menuHTML;
          }, (err: any): void => {
            // handle error here
            console.log(err);
          });
      });
    
    function ChangeDealershipAAD(setNumber: string, appContext: ApplicationCustomizerContext, myPlaceHolder: PlaceholderContent, myClientId: string) {
      console.log(setNumber + " : Changing dealership!");
      var url = 'https://set.dev.api.jmfamily.com/dd-gwmenusvc-sys/v1/api/postDealerContext';
      const body: string = '{"userId":"QAALLPAM","setNumber":"' + setNumber + '","callerName":"Sharepointonline","AssertionId ":""}';
      const requestHeaders: Headers = new Headers();
      requestHeaders.append('Content-type', 'application/json');

      const httpClientOptions: IHttpClientOptions = {
        body: body,
        headers: requestHeaders,
        method: "POST"
      };
      
      appContext.aadHttpClientFactory
        .getClient(myClientId)
        .then((client: AadHttpClient): void => {
          client
            .post(url, AadHttpClient.configurations.v1, httpClientOptions)
            .then((response: HttpClientResponse) => {
              return response.text();
            })
            .then(stuff => {
              location.reload();
            });
        });

    }

  }

}
