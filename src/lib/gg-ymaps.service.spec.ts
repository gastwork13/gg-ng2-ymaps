import { TestBed } from '@angular/core/testing';

import { GgYmapsService } from './gg-ymaps.service';

describe('GgYmapsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GgYmapsService = TestBed.get(GgYmapsService);
    expect(service).toBeTruthy();
  });
});
