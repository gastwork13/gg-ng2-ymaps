import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {AbstractControl, ControlValueAccessor, FormArray, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import {DEFAULT_DATA} from '../utils/default-data';
import {GgYmapsService} from '../gg-ymaps.service';

@Component({
  selector: 'gg-ymap-polygon-control',
  templateUrl: './ymap-polygon-control.component.html',
  styleUrls: ['./ymap-polygon-control.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => YmapPolygonControlComponent),
      multi: true
    }
  ]
})
export class YmapPolygonControlComponent implements ControlValueAccessor, OnInit {

  @Input() center: number[] = null;
  @Input() controls: string[] = [];
  @Input() margin: number[][] | number[] = [];
  @Input() mapType: 'yandex#map' | 'yandex#satellite' | 'yandex#hybrid' = 'yandex#map';
  @Input() zoom = DEFAULT_DATA.zoom;
  @Input() style: {[name: string]: string} = {height: '400px', width: '100%'};

  @Input() showControls = true;

  @Input() fillRule: 'evenOdd' | 'nonZero' = 'evenOdd';
  @Input() editorDrawingCursor = 'crosshair';
  @Input() fillColor = '#00FF00';
  @Input() strokeColor = '#0000FF';
  @Input() strokeWidth = 5;

  isEditing: 'draw' | 'edit' = null;
  formGroup = new FormGroup({
    points: new FormArray([])
  });

  private _ymaps = null;
  // @ts-ignore
  private _map: ymaps.Map = null;

  // @ts-ignore
  private _polygon: ymaps.Polygon = null;

  // @ts-ignore
  private _editButton: ymaps.control.Button;
  // @ts-ignore
  private _drawButton: ymaps.control.Button;
  // @ts-ignore
  private _deleteButton: ymaps.control.Button;

  private _value: number[][][] = [];

  set value(value: number[][][]) {
    if (!Array.isArray(value) || value.length === 0 || value[0].length === 0) {
      this._value = null;
    } else {
      this._value = value;
    }

    if (this._map) {
      this._setPolygon();
    }

    this.onChange(this._value);
  }

  get value(): number[][][] {
    return this._value;
  }

  get pointControls(): FormArray {
    return (<FormArray>this.formGroup.get('points'));
  }

  constructor(private _yandexService: GgYmapsService) { }

  ngOnInit() {
    this._yandexService.getYmaps().then(ymaps => (this._ymaps = ymaps));
  }

  // @ts-ignore
  initMap(map: ymaps.Map): void {
    this._map = map;
    this._initPolygon();
    this._initButtons();
  }

  fillForm(initValues?: number[][][]): void {
    const data = initValues ? initValues : this.value;
    const pointsControl: FormArray = this.pointControls;
    // Clean form and fill again
    while (pointsControl.length !== 0) {
      pointsControl.removeAt(0);
    }

    if (data !== null) {
      data.forEach((area, index) => {
        // Create area array
        pointsControl.push(new FormArray([]));

        area.forEach(point => {
          (<FormArray>pointsControl.at(index)).push(this._createCoordinatesControl(point));
        });
      });
    }
  }

  addArea(): void {
    const area: FormArray = new FormArray([]);
    area.push(this._createCoordinatesControl());
    this.pointControls.push(area);
  }

  removeArea(index: number): void {
    this.pointControls.removeAt(index);
  }

  addPoint(area: FormArray): void {
    area.push(this._createCoordinatesControl());
  }

  removePoint(area: FormArray, index: number): void {
    area.removeAt(index);
  }

  savePoints(): void {
    if (this.formGroup.valid) {
      const rawValues: number[][][] = this.formGroup.get('points').value;
      const coordinates: number[][][] = [];

      // Check arrays, delete empty
      rawValues.forEach((area: number[][], areaInd: number) => {
        if (area.length > 0) {
          coordinates.push([]);
          area.forEach((coords: number[], coordInd: number) => {
            if (coords[0] !== null && coords[1] !== null) {
              coordinates[areaInd].push(coords);
            }
          });
        }
      });

      if (this._polygon) {
        // @ts-ignore
        (<ymaps.geometry.Polygon>this._polygon.geometry).setCoordinates(coordinates);
        this._map.setBounds(this._polygon.geometry.getBounds());
        this.fillForm((<ymaps.geometry.Polygon>this._polygon.geometry).getCoordinates());
      }
    }
  }

  cancelPoints(): void {
    this.fillForm();
  }

  private _createCoordinatesControl(data: number[] = [null, null]): FormArray {
    return new FormArray([
      new FormControl(
        {value: data[0], disabled: this.isEditing !== 'edit'},
        [Validators.required, Validators.pattern(/^-?(1?\d{1,2})\.?\d{0,14}/)]
      ),
      new FormControl(
        {value: data[1], disabled: this.isEditing !== 'edit'},
        [Validators.required, Validators.pattern(/^-?(1?\d{1,2})\.?\d{0,14}/)]
      )
    ]);
  }

  private _initButtons(): void {
    // Edit button
    this._editButton = new this._ymaps.control.Button({
      data: {
        content: 'Редактировать'
      },
      options: {
        float: 'right',
        maxWidth: 120
      }
    });
    this._editButton.events.add('click', () => {
      this._toggleEditMode('edit');
    }, this);

    // Draw button
    this._drawButton = new this._ymaps.control.Button({
      data: {
        content: 'Рисовать'
      },
      options: {
        float: 'right',
        maxWidth: 120
      }
    });
    this._drawButton.events.add('click', () => {
      this._toggleEditMode('draw');
    }, this);

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
    this._deleteButton.events.add('click', this._deletePolygon, this);

    this._map.controls.add(this._drawButton);

    if (this.value) {
      this._map.controls.add(this._editButton);
      this._map.controls.add(this._deleteButton);
    }
  }

  private _initPolygon(): void {
    if (this._ymaps) {
      this._polygon = new this._ymaps.Polygon(
        this._value ? this._value : [],
        this.fillRule,
        {
          editorDrawingCursor: this.editorDrawingCursor,
          fillColor: this.fillColor,
          strokeColor: this.strokeColor,
          strokeWidth: this.strokeWidth
        });
      this._map.geoObjects.add(this._polygon);

      if (this.value) {
        this._map.setBounds(this._polygon.geometry.getBounds());
        this.fillForm();
      }
    }
  }

  private _setPolygon(): void {
    if (this.value) {
      this._map.controls.add(this._editButton);
      this._map.controls.add(this._deleteButton);

      if (this._polygon) {
        // @ts-ignore
        (<ymaps.geometry.Polygon>this._polygon.geometry).setCoordinates(this.value);
        this._map.setBounds(this._polygon.geometry.getBounds());
      }
    } else {
      this._map.controls.remove(this._deleteButton);
      this._map.controls.remove(this._editButton);

      if (this._polygon) {
        // @ts-ignore
        (<ymaps.geometry.Polygon>this._polygon.geometry).setCoordinates([]);
      }
    }

    this.fillForm();
  }

  private _deletePolygon(): void {
    if (!this.isEditing) {
      this.value = null;
    }
  }

  private _toggleEditMode(mode?: 'draw' | 'edit'): void {
    if (this.isEditing) {
      // @ts-ignore
      (<ymaps.geometryEditor.Polygon>this._polygon.editor).stopDrawing();
      // @ts-ignore
      (<ymaps.geometryEditor.Polygon>this._polygon.editor).stopEditing();

      // @ts-ignore
      this._deleteButton.state.set({enabled: true});
      // @ts-ignore
      this._drawButton.data.set({'content': 'Рисовать'});
      // @ts-ignore
      this._drawButton.state.set({enabled: true});
      // @ts-ignore
      this._editButton.data.set({'content': 'Редактировать'});
      // @ts-ignore
      this._editButton.state.set({enabled: true});

      this.isEditing = null;
      this.formGroup.disable();
      // @ts-ignore
      this.value = (<ymaps.geometry.Polygon>this._polygon.geometry).getCoordinates();
    } else {
      switch (mode) {
        case 'edit':
          // @ts-ignore
          (<ymaps.geometryEditor.Polygon>this._polygon.editor).startEditing();
          // @ts-ignore
          this._editButton.data.set({'content': 'Сохранить'});
          // @ts-ignore
          this._drawButton.state.set({enabled: false});

          this.formGroup.enable();
          break;
        default:
          // @ts-ignore
          (<ymaps.geometryEditor.Polygon>this._polygon.editor).startDrawing();
          // @ts-ignore
          this._drawButton.data.set({'content': 'Сохранить'});
          // @ts-ignore
          this._editButton.state.set({enabled: false});
          break;
      }

      this.isEditing = mode;
      // @ts-ignore
      this._deleteButton.state.set({enabled: false});
    }
  }

  onChange = (newValue: number[][][]) => {};

  onTouched = (newValue: number[][][]) => {};

  writeValue(newValue: number[][][]) {
    this.value = newValue;
  }

  registerOnChange(callback: (newValue: number[][][]) => void) {
    this.onChange = callback;
  }

  registerOnTouched(callback: () => void) {
    this.onTouched = callback;
  }

  getAreaControls(area: FormArray): AbstractControl[] {
    return area.controls;
  }

  showForm(): boolean {
    return this.showControls && this.value !== null && this.value.length > 0;
  }

  disableButtonsCommon(): boolean {
    return this.isEditing === 'edit' ? null : true;
  }

  disableDeleteArea(): boolean {
    return this.isEditing === 'edit' && this.pointControls.length > 1 ? null : true;
  }

  disableDeletePoint(area: FormArray): boolean {
    return this.isEditing === 'edit' && area.length > 2 ? null : true;
  }

  disableSubmitButton(): boolean {
    return this.isEditing === 'edit' && this.formGroup.valid ? null : true;
  }

}
