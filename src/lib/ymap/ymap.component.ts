import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DEFAULT_DATA} from '../utils/default-data';
import {idGenerator} from '../utils/id-generator';
import {GgYmapsService} from '../gg-ymaps.service';

@Component({
  selector: 'gg-ymap',
  template: `<div [id]="containerId" [ngStyle]="style"></div>`
})
export class YmapComponent implements OnInit, OnDestroy {
  @Input() center: number[] = DEFAULT_DATA.mapCenter;
  @Input() controls: string[] = [];
  @Input() margin: number[][] | number[] = [];
  @Input() mapType: 'yandex#map' | 'yandex#satellite' | 'yandex#hybrid' = 'yandex#map';
  @Input() zoom = DEFAULT_DATA.zoom;
  @Input() style: {[name: string]: string} = {height: '400px', width: '100%'};

  // @ts-ignore
  @Output() mapReady: EventEmitter<ymaps.Map> = new EventEmitter();

  containerId: string = idGenerator();

  private _ymaps: any;
  // @ts-ignore
  private _map: ymaps.Map;

  constructor(private _yandexService: GgYmapsService) { }

  ngOnInit(): void {
    this._yandexService.getYmaps()
      .then((ymaps) => {
        if (ymaps) {
          this._ymaps = ymaps;
          this._initMap();
        }
      })
      .catch(() => {});
  }

  ngOnDestroy(): void {
    if (this._map) {
      this._map.destroy();
    }
  }

  private _initMap(): void {
    // @ts-ignore
    const state: ymaps.IMapState = {
      center: this.center,
      controls: this.controls,
      margin: this.margin,
      type: this.mapType,
      zoom: this.zoom
    };

    this._map = new this._ymaps.Map(this.containerId, state, {});
    this.mapReady.emit(this._map);
  }
}
