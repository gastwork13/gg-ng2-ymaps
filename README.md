# @gastwork13/ng2-ymaps
Небольшая библиотека для работы с яндекс картами в Angular 2+.
Позволяет работать с api яндекс карт напрямую. В зависимостях есть @types/yandex-maps, что облегчает работу с api.

## Установка
`npm install --save @gastwork13/ng2-ymaps`

## Использование
Импортируйте **GgNg2YmapsModule** в корневом модуле.

```
import {GgNg2YmapsModule} from '@gg/ng2-ymaps';

@NgModule({
  imports: [
    ...,
    GgNg2YmapsModule
  ],
  ...
})

```

В **environment** можно указать api ключ для яндекс карт, библиотека использует его для загрузки карт:
```
export const environment = {
  ...,
  yandexApiKey: <your_api_key>,
  ...
};
```

### Сервисы

#### GgYmapsService

##### Методы
getYmaps(): Promise<ymaps> - промис готовности объекта ymaps, возвращает этот объект

##### Пример
```
@Component(...)
export class TestComponent implements OnInit {
  constructor(private _ymapService: GgYmapsService) {}
  
  ngOnInit() {
    this._ymapService.getYmaps().then(ymaps => {
      // Тут получаете объект яндекс карт напрямую и можете работать с ним напрямую
    });
  }
}
```

### Компоненты

#### gg-ymap
Компонент карты

##### Параметры
center: number[] - центр карты, принимает массив координат

controls: string[] - массив строк с инструментами яндекс карты, например ['default', 'routeButtonControl']

margin: number[][] | number[] - Отступы от краёв карты

mapType: 'yandex#map' | 'yandex#satellite' | 'yandex#hybrid' - тип отображения карты

zoom: number - масштаб при инициализации

style: {[name: string]: string} - объект стилей, который применится к контейнеру карты с помощью директивы [ngStyle]

##### События
mapReady: ymaps.Map - событие готовности конкретно этой карты, возвращает объект карты, с которым можно работать напрямую 

##### Пример
```
<gg-ymap></gg-ymap>
```

#### gg-ymap-placemark-control
Контрол для точки на карте. Реализует интерфейс ControlValueAccessor (позволяет работать с [ngModel] или использовать с реактивными формами)

##### Параметры
center: number[] - центр карты, принимает массив координат

controls: string[] - массив строк с инструментами яндекс карты, например ['default', 'routeButtonControl']

margin: number[][] | number[] - Отступы от краёв карты

mapType: 'yandex#map' | 'yandex#satellite' | 'yandex#hybrid' - тип отображения карты

zoom: number - масштаб при инициализации

style: {[name: string]: string} - объект стилей, который применится к контейнеру карты с помощью директивы [ngStyle]

##### Пример
```
<gg-ymap-placemark-control formControlName="coordinates"></gg-ymap-placemark-control>
```

#### gg-ymap-polygon-control
Контрол для полигона. Реализует интерфейс ControlValueAccessor (позволяет работать с [ngModel] или использовать с реактивными формами)

##### Параметры
center: number[] - центр карты, принимает массив координат

controls: string[] - массив строк с инструментами яндекс карты, например ['default', 'routeButtonControl']

margin: number[][] | number[] - Отступы от краёв карты

mapType: 'yandex#map' | 'yandex#satellite' | 'yandex#hybrid' - тип отображения карты

zoom: number - масштаб при инициализации

style: {[name: string]: string} - объект стилей, который применится к контейнеру карты с помощью директивы [ngStyle]

showControls: boolean - показать форму редактирования точек полигона 

fillRule: 'evenOdd' | 'nonZero' - способ заполнения полигона

editorDrawingCursor: string - курсор в режиме рисования

fillColor: string - цвет заполнения полигона

strokeColor: string - цвет границ полигона

strokeWidth: number - ширина границ полигона
 
##### Пример
```
<gg-ymap-polygon-control formControlName="polygon"></gg-ymap-polygon-control>
```

## Лицензия
Проект под лицензией MIT - смотрите файл [LICENSE](LICENSE)

