import * as Msal from "msal";
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName,
  ApplicationCustomizerContext
} from '@microsoft/sp-application-base';
import styles from './AppCustomizer.module.scss';
import * as strings from 'JmfDdMenuExtAppApplicationCustomizerStrings';
import { AadHttpClient, HttpClient, IHttpClientOptions, HttpClientResponse, HttpClientConfiguration } from '@microsoft/sp-http';
import * as $ from 'jquery';

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

  private _topPlaceholder: PlaceholderContent | undefined;
  private _bottomPlaceholder: PlaceholderContent | undefined;
  private ordersClient: AadHttpClient;
  private myContext: ApplicationCustomizerContext;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // Wait for the placeholders to be created (or handle them being changed) and then
    // render.
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);
    this.myContext = this.context;

    $("#spSiteHeader").hide();

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
            </div>`;
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

  private async GetSetNumber():Promise<string> {
    
    const getURL = "https://set.dev.api.jmfamily.com/dd-gwmenusvc-sys/v1/api/dealerContext?nameId=qaallpam";
    let setNum = "";
     const requestHeaders: Headers = new Headers();
    requestHeaders.append('Content-type', 'application/json');

    console.log("About to get SET Number");

     let client = await this.context.aadHttpClientFactory
      .getClient('1148b2ca-eded-4ea7-9f1e-4cce4bd47109');
      
      let response = await client.get(getURL, AadHttpClient.configurations.v1);
      let text = await response.text();
      return JSON.parse(text);

  }
  private async GetMenu(setNumber: string = '09159'): Promise<any> {

    var setNum = await this.GetSetNumber();
    setCookie('setNumber', setNum, 2);
    //var setNumber 
    
    //const postURL = "https://menuserviceazfn.azurewebsites.net/api/GetMenu?code=uryuQaUpeJRt9RZbFava1nOOPQGmyfdEoch9gMf/o7CDrZ/USYuI5A==";
    //const postURL = "https://setmenuservice.azurewebsites.net/api/GetMenu?code=5ju70xjDJywCDUTI/xxxE/olwvdjZ4cRbzkiTWtwbxCrDi43Crg6jA==";
    const postURL = "https://set.dev.api.jmfamily.com/dd-gwmenusvc-sys/v1/api/menu";
    
    //const body: string = '{"NameId":"conkqyg@JM","FirstName":"Biju","LastName":"Basheer","Spin":"","SETNumber":"09159","AppName":"VinSight","CallerName":"Sharepointonline","BrowserIE8": "False"}';
    const body: string = '{"NameId":"QAALLPAM@JM","FirstName":"QAALLPAM","LastName":"QAALLPAM","Spin":"","SETNumber":"' + setNum + '","CallerName":"Sharepointonline","BrowserIE8":"True"}';

    const requestHeaders: Headers = new Headers();
    requestHeaders.append('Content-type', 'application/json');

    const httpClientOptions: IHttpClientOptions = {
      body: body,
      headers: requestHeaders,
      method: "POST"
    };

    console.log("About to get Menu.");

    return this.context.aadHttpClientFactory
      //.getClient('89759aa2-8b1d-4e17-b0e3-56f9bcf71f71')
      //.getClient('54e0f8b3-971e-4f5d-90b0-083e29b433ac') //Azure Fn
      .getClient('1148b2ca-eded-4ea7-9f1e-4cce4bd47109') //Menu Service
      .then((client: AadHttpClient): void => {
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
            //  let clickEvent= document.getElementById('DealershipnavbarDropdown');
            //  clickEvent.addEventListener("click", (e: Event) => this.ClickMenu(e));
            
            MyCookieFunction();

            $('.mydealer').on("click", function () {
              //alert(this.textContent);
              // debugger;
              var positionofcolon = this.textContent.indexOf(':');
              //var dealerEirId = '@Model.Dealer.DealerEirId';
              var dealerName = this.textContent.substring(positionofcolon + 1);
              var setNumber = this.textContent.substring(0, positionofcolon);
              setCookie('setNumber', setNumber, 2);
              ChangeDealershipAAD(setNumber, myContext, myPlaceHolder);

            });

            return menuHTML;
          }, (err: any): void => {
            // handle error here
            console.log(err);
          });
      });
    
    function ChangeDealershipAAD(setNumber: string, appContext: ApplicationCustomizerContext, myPlaceHolder: PlaceholderContent) {
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
        .getClient('1148b2ca-eded-4ea7-9f1e-4cce4bd47109')
        .then((client: AadHttpClient): void => {
          client
            .post(url, AadHttpClient.configurations.v1, httpClientOptions)
            .then((response: HttpClientResponse) => {
              return response.text();
            })
            .then(stuff => {
              console.log(stuff);
              location.reload();
            });
        });

    }

  }

}
