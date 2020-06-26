// import * as React from "react";  
// import * as ReactDOM from "react-dom";  
// import ReactFooter, { IReactFooterProps } from "./ReactFooter";  
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
import { HttpClient, IHttpClientOptions, HttpClientResponse } from '@microsoft/sp-http';


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
          this.makeRequest('a', 'b','c')
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

    const postURL = "https://cors-anywhere.herokuapp.com/https://set.api.jmfamily.com/dd-gwmenusvc-sys/v1/api/menu";
    // const postURL = "https://cors-anywhere.herokuapp.com/https://set.qa.api.jmfamily.com/dd-gwmenusvc-sys/v1/api/menu";
    const body: string = '{"NameId":"conkqyg@JM","FirstName":"Biju","LastName":"Basheer","Spin":"","SETNumber":"09159","CallerName":"Sharepoint","BrowserIE8": "False"}';
    
    const requestHeaders: Headers = new Headers();
    requestHeaders.append('Content-type', 'application/json');
    //requestHeaders.append('Access-Control-Request-Method', 'POST');
    //requestHeaders.append('Cache-Control', 'no-cache');
    //For an OAuth token
    requestHeaders.append('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IlNzWnNCTmhaY0YzUTlTNHRycFFCVEJ5TlJSSSIsImtpZCI6IlNzWnNCTmhaY0YzUTlTNHRycFFCVEJ5TlJSSSJ9.eyJhdWQiOiJhcGk6Ly9kY2Y3MDc2Ny1kYzZlLTRlMjAtODk2NC03ZjQ3ODAwNWFlM2UiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9lMmJhNjczYS1iNzgyLTRmNDQtYjBiNS05M2RhOTAyNTgyMDAvIiwiaWF0IjoxNTkzMTgwMDEwLCJuYmYiOjE1OTMxODAwMTAsImV4cCI6MTU5MzE4MzkxMCwiYWlvIjoiRTJCZ1lGajN2bkZSMDQ0MjN4bE11cjhuU3E5K0FnQT0iLCJhcHBpZCI6ImJmNmU4NWE0LTg3N2MtNDk1Ny1iZmNjLWM3ZDgzMjAwZDY1YiIsImFwcGlkYWNyIjoiMSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2UyYmE2NzNhLWI3ODItNGY0NC1iMGI1LTkzZGE5MDI1ODIwMC8iLCJvaWQiOiI4NTZhYmFmMi0wYWRjLTRmYjQtYWZjNy1jN2NiM2I5ZDE0MDYiLCJyb2xlcyI6WyJNZW51U2VydmljZXMiXSwic3ViIjoiODU2YWJhZjItMGFkYy00ZmI0LWFmYzctYzdjYjNiOWQxNDA2IiwidGlkIjoiZTJiYTY3M2EtYjc4Mi00ZjQ0LWIwYjUtOTNkYTkwMjU4MjAwIiwidXRpIjoiSXREUlpRTFNXMHVraW55emlFcDZBUSIsInZlciI6IjEuMCJ9.RLPfzVCkrW38bc4IfR8RzmLEm38_6WGhSuvsg2CI4gVx1YZZ3FnWGhAkAQyPbMCbMwr5U4lfOCRRgigEakIyMClcDkUU_QmypHQFF3W7qo_zTzvK927Y4KAogb_C3WpKVVN_QdKzuuUjO4fEGnCdGwwxtPVyjlAlglK7v2aYVs8KmNj-66ts94Rb4FgDTgr8s90dlqPWytoPKMAwDFaMJ2Ubx12WcyYpinrjDMACiIRsmnIx5tfb7X5dAxAfwkPlKiBV94d0emDdwvmZoUJw3ja2bt3rfhgLCiVzxkXdwO5_9Y4WRDWrCLx7jrAa9DpOooDUI1T1s-BTzLXIuRKHJg');
    
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
}
