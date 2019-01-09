import { Injectable } from '@angular/core';

function _window(): Window {
  return window;
}

function _document(): Document {
  return document;
}

@Injectable({
  providedIn: 'root'
})
export class BrowserGlobalsService {
  windowRef(): Window {
    return _window();
  }

  documentRef(): Document {
    return _document();
  }
}
