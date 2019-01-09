import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YmapPolygonControlComponent } from './ymap-polygon-control.component';

describe('YmapPolygonControlComponent', () => {
  let component: YmapPolygonControlComponent;
  let fixture: ComponentFixture<YmapPolygonControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YmapPolygonControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YmapPolygonControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
