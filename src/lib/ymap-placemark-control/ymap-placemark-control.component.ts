import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import {DEFAULT_DATA} from '../utils/default-data';
import {GgYmapsService} from '../gg-ymaps.service';

@Component({
  selector: 'gg-ymap-placemark-control',
  template: `
    <gg-ymap (mapReady)="initMap($event)"
             [controls]="controls"
             [margin]="margin"
             [mapType]="mapType"
             [zoom]="zoom"
             [style]="style"></gg-ymap>
    <form [formGroup]="formGroup" (ngSubmit)="saveCoordinates()">
      <input formControlName="lon" />
      <input formControlName="lat" />
      <button type="submit" [disabled]="formGroup.valid  && isEditing ? null : true">Сохранить</button>
    </form>
  `,
  styles: [
    'form {display: flex; justify-content: center; width: 100%; padding: 7px 10px;}',
    'input {display: block; border: 1px solid #cecece; border-radius: 3px; margin: 0 5px; padding: 5px 7px; width: 150px}',
    'button {display: block; border: 1px solid #cecece; border-radius: 3px; margin: 0 5px;}',
    'button:hover:not(:disabled) {cursor: pointer;}'
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => YmapPlacemarkControlComponent),
      multi: true
    }
  ]
})
export class YmapPlacemarkControlComponent implements ControlValueAccessor, OnInit {
  @Input() center: number[] = null;
  @Input() controls: string[] = [];
  @Input() margin: number[][] | number[] = [];
  @Input() mapType: 'yandex#map' | 'yandex#satellite' | 'yandex#hybrid' = 'yandex#map';
  @Input() zoom = DEFAULT_DATA.zoom;
  @Input() style: {[name: string]: string} = {height: '400px', width: '100%'};

  private _ymaps = null;
  // @ts-ignore
  private _map: ymaps.Map = null;
  // @ts-ignore
  private _placemark: ymaps.Placemark = null;

  // @ts-ignore
  private _editButton: ymaps.control.Button;
  // @ts-ignore
  private _deleteButton: ymaps.control.Button;

  private _latitude: number = null;
  private _longitude: number = null;

  isEditing = false;
  formGroup = new FormGroup({
    lat: new FormControl({value: null, disabled: true}, [Validators.required, Validators.pattern(/^-?(1?\d{1,2})\.?\d{0,14}/)]),
    lon: new FormControl({value: null, disabled: true}, [Validators.required, Validators.pattern(/^-?(1?\d{1,2})\.?\d{0,14}/)]),
  });

  set value(value: number[]) {
    if (!value) {
      this._longitude = null;
      this._latitude = null;
      this.onChange(null);
      return;
    }

    const [longitude, latitude] = [...value];
    this._longitude = longitude;
    this._latitude = latitude;

    if (latitude && longitude) {
      this._onChangePlacemark();
    } else {
      this._placemark = null;
    }

    this.onChange([this._longitude, this._latitude]);
  }

  get value(): number[] {
    return this._longitude && this._latitude ? [this._longitude, this._latitude] : null;
  }

  constructor(private _yandexService: GgYmapsService) { }

  ngOnInit() {
    this._yandexService.getYmaps().then(ymaps => (this._ymaps = ymaps));
  }

  // @ts-ignore
  initMap(map: ymaps.Map): void {
    this._map = map;
    this._setPlacemark();
    this._initButtons();

    if (this._placemark) {
      this._map.geoObjects.add(this._placemark);
      this._map.setCenter(this.value);
    } else if (this.center) {
      this._map.setCenter(this.center);
    } else {
      this._map.setCenter(DEFAULT_DATA.mapCenter);
    }
  }

  private _initButtons(): void {
    // Edit button
    this._editButton = new this._ymaps.control.Button({
      data: {
        content: this._placemark ? 'Редактировать' : 'Создать'
      },
      options: {
        float: 'right',
        maxWidth: 120
      }
    });

    this._editButton.events.add('click', this._toggleEditMode, this);
    this._map.controls.add(this._editButton);

    // Delete button
    this._deleteButton = new this._ymaps.control.Button({
      data: {
        content: 'Удалить'
      },
      options: {
        float: 'right',
        maxWidth: 80
      }
    });

    this._deleteButton.events.add('click', this._deletePlacemark, this);

    if (this._placemark) {
      this._map.controls.add(this._deleteButton);
    }
  }

  private _setPlacemark(): void {
    if (!this._placemark) {
      if (this._ymaps && this.value) {
        this._placemark = new this._ymaps.Placemark(this.value, {}, {draggable: false});
        if (this._map) {
          this._map.geoObjects.add(this._placemark);
        }

        this.formGroup.get('lon').setValue(this._longitude);
        this.formGroup.get('lat').setValue(this._latitude);
      }
      return;
    }

    // @ts-ignore
    (<ymaps.geometry.Point>this._placemark.geometry).setCoordinates(this.value);
  }

  private _onChangePlacemark(): void {
    this._setPlacemark();
    if (this._map) {
      if (this._placemark) {
        this._map.setCenter(this.value);
        this._map.controls.add(this._deleteButton);
        // @ts-ignore
        this._editButton.data.set({
          'content': this.isEditing ? 'Сохранить' : 'Редактировать'
        });
      } else {
        this._map.controls.remove(this._deleteButton);
        // @ts-ignore
        this._editButton.data.set({'content': 'Создать'});
      }
    }
  }

  private _deletePlacemark(): void {
    this._map.geoObjects.remove(this._placemark);
    this._placemark = null;
    this.value = null;
    this._map.controls.remove(this._deleteButton);
    // @ts-ignore
    this._editButton.data.set({'content': 'Создать'});
    this.isEditing = false;
    this._map.events.remove('click', this._onMapClick, this);
  }

  private _toggleEditMode(): void {
    if (this.isEditing) {
      this._map.events.remove('click', this._onMapClick, this);

      this.formGroup.disable();

      if (this._placemark) {
        this._map.controls.add(this._deleteButton);
        // @ts-ignore
        this._editButton.data.set({'content': 'Редактировать'});
      } else {
        this._map.controls.remove(this._deleteButton);
        // @ts-ignore
        this._editButton.data.set({'content': 'Создать'});
      }
    } else {
      this.formGroup.enable();
      this._map.events.add('click', this._onMapClick, this);
      // @ts-ignore
      this._editButton.data.set({'content': 'Сохранить'});
    }

    this.isEditing = !this.isEditing;
  }

  // @ts-ignore
  private _onMapClick(event: ymaps.IEvent): void {
    this.value = <number[]>event.get('coords');
  }

  saveCoordinates(): void {
    if (this.formGroup.valid) {
      this.value = [
        parseFloat(this.formGroup.get('lon').value),
        parseFloat(this.formGroup.get('lat').value)
      ];
      this._toggleEditMode();
    }
  }

  onChange = (newValue: number[]) => {};

  onTouched = (newValue: number[]) => {};

  writeValue(newValue: number[]) {
    this.value = newValue;
  }

  registerOnChange(callback: (newValue: number[]) => void) {
    this.onChange = callback;
  }

  registerOnTouched(callback: () => void) {
    this.onTouched = callback;
  }
}
