import * as Msal from "msal";
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
//import { Dialog } from '@microsoft/sp-dialog';
import styles from './AppCustomizer.module.scss';
//import { escape } from '@microsoft/sp-lodash-subset';
import * as strings from 'JmfDdMenuExtAppApplicationCustomizerStrings';
import {AadHttpClient, HttpClient, IHttpClientOptions, HttpClientResponse } from '@microsoft/sp-http';
import * as $ from 'jquery';

require('myScript'); //Add a JS file
declare function SayHello(msg): any; // Declare JS function
declare function WireUpMenu():any;

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

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

  // Wait for the placeholders to be created (or handle them being changed) and then
  // render.
  this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);
  
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
          this.CallAzureFunction()
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

  private ClickMenu(e) {
    let currentDealer = document.getElementById('menu-context').firstElementChild.firstElementChild.firstElementChild.textContent;
    console.log(e);
    console.log(currentDealer);
  }
  
  private _onDispose(): void {
    console.log('[MenuServiceExtension._onDispose] Disposed custom top and bottom placeholders.');
  }
  

  private CallAzureFunction(): Promise<any> {

    //const postURL = "https://menuserviceazfn.azurewebsites.net/api/GetMenu?code=uryuQaUpeJRt9RZbFava1nOOPQGmyfdEoch9gMf/o7CDrZ/USYuI5A==";
    //const postURL = "https://setmenuservice.azurewebsites.net/api/GetMenu?code=5ju70xjDJywCDUTI/xxxE/olwvdjZ4cRbzkiTWtwbxCrDi43Crg6jA==";
    const postURL = "https://set.dev.api.jmfamily.com/dd-gwmenusvc-sys/v1/api/menu";
    //const body: string = '{"NameId":"conkqyg@JM","FirstName":"Biju","LastName":"Basheer","Spin":"","SETNumber":"09159","AppName":"VinSight","CallerName":"SharePoint","BrowserIE8": "False"}';
    const body: string = '{"NameId":"QAALLPAM@JM","FirstName":"QAALLPAM","LastName":"QAALLPAM","Spin":"","SETNumber":"09159","CallerName":"VinSight","BrowserIE8":"True"}';
    const requestHeaders: Headers = new Headers();
    requestHeaders.append('Content-type', 'application/json');
    
    const httpClientOptions: IHttpClientOptions = {
      body: body,
      headers: requestHeaders,
      method: "POST"
    };
    
    console.log("About to make API request.");
    
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
      var oldLink = 'https://staging-admin-new.setdealerdaily.com:8082/';
      var newLink = 'https://staging-admin.setdealerdaily.com/';
      var cleanHTML = menuHTML.replace(oldLink, newLink);

      this._topPlaceholder.domElement.innerHTML = `
      <div class="no-index">
        ${cleanHTML}
      </div>`;

      $('#TopLinksnavbarNav a').each(function(){
        var updated_link = $(this).attr('href').replace('https://staging-admin-new.setdealerdaily.com:8082/', 'https://pubasfs.jmfamily.com/IdentityServer3/WSFederation?wa=wsignin1.0&authtype=azuread&wtrealm=urn%3adpamdinstgnew&wctx=ru=https://staging-admin.setdealerdaily.com/');
        $(this).attr('href', updated_link);
     });

      //$('li.nav-item:contains("APPLICATIONS") a').attr("href", "https://staging-admin.setdealerdaily.com/applications/myapplications.aspx");
      //$('li.nav-item:contains("REPORTS") a').attr("href", "https://staging-admin.setdealerdaily.com/report/myreports.aspx");
      $('li.nav-item:contains("DEPARTMENTS") a').attr("href", "https://jmfamilystage.sharepoint.com/sites/DealerDaily/SitePages/Departments.aspx");
      $('#menu-header a').attr("href", "https://jmfamilystage.sharepoint.com/sites/DealerDaily");

      let clickEvent= document.getElementById('DealershipnavbarDropdown');
      clickEvent.addEventListener("click", (e: Event) => this.ClickMenu(e));

      //WireUpMenu();
      //SayHello("Done loading menu");
      
      return menuHTML;  
    }, (err: any): void => {
      // handle error here
      console.log(err );
    });
      });
  }
}
