import {ModuleWithProviders, NgModule} from '@angular/core';
import { YmapComponent } from './ymap/ymap.component';
import { YmapPlacemarkControlComponent } from './ymap-placemark-control/ymap-placemark-control.component';
import { YmapPolygonControlComponent } from './ymap-polygon-control/ymap-polygon-control.component';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {GgYmapsService} from './gg-ymaps.service';

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
export class GgNg2YmapsModule {
  public static forRoot(environment: any): ModuleWithProviders {
    return {
      ngModule: GgNg2YmapsModule,
      providers: [
        GgYmapsService,
        {
          provide: 'env',
          useValue: environment
        }
      ]
    };
  }
}
