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

const msalConfig = {
        auth: {
            clientId: 'bf6e85a4-877c-4957-bfcc-c7d83200d65b'
        }
    };
const msalInstance = new Msal.UserAgentApplication(msalConfig);
msalInstance.handleRedirectCallback((error, response) => {
        // handle redirect response or error
        console.log("In handleRedirectCallback");
         console.log(JSON.stringify(error));
         console.log(JSON.stringify(response));
    });
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
  
  return Promise.resolve<void>();
  
  }

  private _renderPlaceHolders(): void {
    console.log("HelloWorldApplicationCustomizer._renderPlaceHolders()");
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

  
  private _onDispose(): void {
    console.log('[HelloWorldApplicationCustomizer._onDispose] Disposed custom top and bottom placeholders.');
  }
  private makeRequest(value1: string, value2: string, value3: string): Promise<any> {

    
    //const postURL = "https://set.api.jmfamily.com/dd-gwmenusvc-sys/v1/api/menu";
    const postURL = "https://cors-anywhere.herokuapp.com/https://set.api.jmfamily.com/dd-gwmenusvc-sys/v1/api/menu";
    // const postURL = "https://cors-anywhere.herokuapp.com/https://set.qa.api.jmfamily.com/dd-gwmenusvc-sys/v1/api/menu";
    const body: string = '{"NameId":"conkqyg@JM","FirstName":"Biju","LastName":"Basheer","Spin":"","SETNumber":"09159","CallerName":"Sharepoint","BrowserIE8": "False"}';
    
    const requestHeaders: Headers = new Headers();
    requestHeaders.append('Content-type', 'application/json');
    //requestHeaders.append('Access-Control-Request-Method', 'POST');
    //requestHeaders.append('Cache-Control', 'no-cache');
    //For an OAuth token
    requestHeaders.append('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IlNzWnNCTmhaY0YzUTlTNHRycFFCVEJ5TlJSSSIsImtpZCI6IlNzWnNCTmhaY0YzUTlTNHRycFFCVEJ5TlJSSSJ9.eyJhdWQiOiJhcGk6Ly9kY2Y3MDc2Ny1kYzZlLTRlMjAtODk2NC03ZjQ3ODAwNWFlM2UiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9lMmJhNjczYS1iNzgyLTRmNDQtYjBiNS05M2RhOTAyNTgyMDAvIiwiaWF0IjoxNTkzMjA2NjY5LCJuYmYiOjE1OTMyMDY2NjksImV4cCI6MTU5MzIxMDU2OSwiYWlvIjoiRTJCZ1lQamo1L1BTS3YrV1hmaXF4VnM0a3BuRkFRPT0iLCJhcHBpZCI6ImJmNmU4NWE0LTg3N2MtNDk1Ny1iZmNjLWM3ZDgzMjAwZDY1YiIsImFwcGlkYWNyIjoiMSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2UyYmE2NzNhLWI3ODItNGY0NC1iMGI1LTkzZGE5MDI1ODIwMC8iLCJvaWQiOiI4NTZhYmFmMi0wYWRjLTRmYjQtYWZjNy1jN2NiM2I5ZDE0MDYiLCJyb2xlcyI6WyJNZW51U2VydmljZXMiXSwic3ViIjoiODU2YWJhZjItMGFkYy00ZmI0LWFmYzctYzdjYjNiOWQxNDA2IiwidGlkIjoiZTJiYTY3M2EtYjc4Mi00ZjQ0LWIwYjUtOTNkYTkwMjU4MjAwIiwidXRpIjoiTDFHMFZpeUlDMEd3NHg1S2RLQ0NBUSIsInZlciI6IjEuMCJ9.lUsttIWjvT0uADDdNKXjzyNbwQuNhQmQ3NcK0P5U3QpVzZbW0g-fJh1nr6oAKmteCPc-I5c4Ded7yQSOOrHzsRL8OgZT5y4nghMHs3D1dIHRYJxOHM5ONGZBSR8lQcIIzMjB8DzQu_Jp4BKFbbJq9sgmeV8Tae1A5WQr_PHwpb_mhruRO6IGbhr-C1FeyhQCbQcIr16lkW4nt3x-Cx_vwxFQNIJspHx2BUb7yzSoSlLx8NRwQjFsQz-6H2AbMJ7_1m81rnRcrDgbVeo-dKFhrP51P7_uM5DwaTIerI3yRSbe1zDRGYh7GXqW1RE8ZZY44VggJ9qq5DGRPR1PGvbkJg');
    
    
    const httpClientOptions: IHttpClientOptions = {
      body: body,
      headers: requestHeaders,
      mode: "cors",
      method: "POST"
    };
    
    console.log("About to make API request.");
    
    return this.context.httpClient.post(postURL, HttpClient.configurations.v1, httpClientOptions)
    .then((response: HttpClientResponse) => {  
      return response.text();  
    }) 
    .then(menuHTML => {  
      //console.log(menuHTML);  
      this._topPlaceholder.domElement.innerHTML = `
      <div class="no-index">
        ${menuHTML}
      </div>`;
      return menuHTML;  
    }, (err: any): void => {
      // handle error here
      console.log(err + "!");
    });
      
  }

  private CallAzureFunction(): Promise<any> {

    
    //const postURL = "https://set.api.jmfamily.com/dd-gwmenusvc-sys/v1/api/menu";
    const postURL = "https://menuserviceazfn.azurewebsites.net/api/GetMenu?code=uryuQaUpeJRt9RZbFava1nOOPQGmyfdEoch9gMf/o7CDrZ/USYuI5A==";
    // const postURL = "https://cors-anywhere.herokuapp.com/https://set.qa.api.jmfamily.com/dd-gwmenusvc-sys/v1/api/menu";
    const body: string = '{"NameId":"conkqyg@JM","FirstName":"Biju","LastName":"Basheer","Spin":"","SETNumber":"09159","CallerName":"Sharepoint","BrowserIE8": "False"}';
    
    const requestHeaders: Headers = new Headers();
    requestHeaders.append('Content-type', 'application/json');
    
    const httpClientOptions: IHttpClientOptions = {
      body: body,
      headers: requestHeaders,
      method: "POST"
    };
    
    console.log("About to make API request.");
    
    return this.context.aadHttpClientFactory
      .getClient('89759aa2-8b1d-4e17-b0e3-56f9bcf71f71')
      .then((client: AadHttpClient): void => {
        client
          .post(postURL, AadHttpClient.configurations.v1, httpClientOptions)
          .then((response: HttpClientResponse) => {
            return response.text();
          })
         .then(menuHTML => {  
      //console.log(menuHTML);  
      this._topPlaceholder.domElement.innerHTML = `
      <div class="no-index">
        ${menuHTML}
      </div>`;
      return menuHTML;  
    }, (err: any): void => {
      // handle error here
      console.log(err + "!");
    });
      });
/*
    return this.context.httpClient.post(postURL, HttpClient.configurations.v1, httpClientOptions)
    .then((response: HttpClientResponse) => {  
      return response.text();  
    }) 
    .then(menuHTML => {  
      //console.log(menuHTML);  
      this._topPlaceholder.domElement.innerHTML = `
      <div class="no-index">
        ${menuHTML}
      </div>`;
      return menuHTML;  
    }, (err: any): void => {
      // handle error here
      console.log(err + "!");
    });
      */
  }
}
