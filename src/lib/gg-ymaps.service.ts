import { Injectable } from '@angular/core';
import {BrowserGlobalsService} from './browser-globals.service';

@Injectable({
  providedIn: 'root'
})
export class GgYmapsService {
  private _scriptLoadingPromise: Promise<void>;

  private _windowRef: Window;
  private _documentRef: Document;

  private _isLoading = false;
  private _loadingPromise: Promise<any> = null;
  private _mapInstance: any = null;

  constructor(private browserGlobals: BrowserGlobalsService) {
    this._windowRef = browserGlobals.windowRef();
    this._documentRef = browserGlobals.documentRef();
  }

  private _load(): Promise<void> {
    const script = this._documentRef.createElement('script');
    script.type = 'text/javascript';
    script.async = false;
    script.defer = true;
    script.id = 'YaScript';
    script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';

    this._scriptLoadingPromise = new Promise<void>((resolve: Function, reject: Function) => {
      script.onload = () => { resolve(); };
      script.onerror = (error: Event) => { reject(error); };
    });
    this._documentRef.body.appendChild(script);
    return this._scriptLoadingPromise;
  }

  getYmaps(): Promise<any> {
    if (this._mapInstance === null) {
      if (this._isLoading) {
        return new Promise((resolve: Function, reject: Function) => {
          this._loadingPromise.then((map) => {
            resolve(this._mapInstance);
          })
            .catch(() => {
              reject();
            });
        });
      } else {
        this._isLoading = true;
        this._loadingPromise = new Promise((resolve: Function, reject: Function) => {
          this._load()
            .then(() => {
              this._mapInstance = this._windowRef['ymaps'];
              this._mapInstance.ready(() => {
                resolve(this._mapInstance);
                this._isLoading = false;
              });
            })
            .catch(error => {
              console.error(error);
            });
        });
        return this._loadingPromise;
      }
    }

    return new Promise((resolve: Function, reject: Function) => {
      resolve(this._mapInstance);
    });
  }
}
