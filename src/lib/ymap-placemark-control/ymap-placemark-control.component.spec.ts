import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YmapPlacemarkControlComponent } from './ymap-placemark-control.component';

describe('YmapPlacemarkControlComponent', () => {
  let component: YmapPlacemarkControlComponent;
  let fixture: ComponentFixture<YmapPlacemarkControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YmapPlacemarkControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YmapPlacemarkControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
