import { NgModule } from '@angular/core';
import { YmapComponent } from './ymap/ymap.component';
import { YmapPlacemarkControlComponent } from './ymap-placemark-control/ymap-placemark-control.component';
import { YmapPolygonControlComponent } from './ymap-polygon-control/ymap-polygon-control.component';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  declarations: [
    YmapComponent,
    YmapPlacemarkControlComponent,
    YmapPolygonControlComponent
  ],
  exports: [
    YmapComponent,
    YmapPlacemarkControlComponent,
    YmapPolygonControlComponent
  ]
})
export class GgNg2YmapsModule { }
