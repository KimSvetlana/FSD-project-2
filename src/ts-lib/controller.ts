import {HandleModel, SliderModel} from './model';
import{View} from './view'

export class Controller {
  private _model: SliderModel;
  private _options: object;
  private _activeHandle: HandleModel;
  private _handleMinObject: JQuery;
  private _handleMaxObject: JQuery;

  private _minOffset: number;
  private _maxOffset: number;
  private _slider: JQuery;

  constructor(
    model: SliderModel,
    handleMinObject: JQuery,
    handleMaxObject: JQuery,
    options: Object,
    minBounds: number,
    maxBounds: number,
    slider: JQuery) {
    this._model = model;
    this._options = options;
    this._handleMinObject = handleMinObject;
    this._handleMaxObject = handleMaxObject;

    this._minOffset = minBounds;
    this._maxOffset = maxBounds;
    this._slider = slider;

    let self = this;
    let sliderHandles = self._model.getSliderHandles();
    let minHandle = sliderHandles[0];
    let maxHandle = sliderHandles[1];
    minHandle.setValue(options.min);
    maxHandle.setValue(options.max);

    // для обработчика по клику присваиваем activeHandle
    this._activeHandle = maxHandle;


    this._handleMinObject.on("mousedown", function (mouseEvent) {
      self._onHandleMouseDown(sliderHandles[0]);
    });

    this._handleMaxObject.on("mousedown", function (mouseEvent) {
      self._onHandleMouseDown(sliderHandles[1]);
    });

    this._slider.on('click', function(movePosition){      
      self._onMouseMove(movePosition);
    });
  }

  _onHandleMouseDown(handle: HandleModel) {
    this._activeHandle = handle;
    let self = this;
    $(document).on('mousemove', function(movePosition) {
      self._onMouseMove(movePosition);
    });
    
    $(document).on('mouseup', function () {
      $(document).off('mousemove');
    })
  }

  _onMouseMove(movePosition) {
    let movePos;
    if (this._options.vertical) {
        movePos = movePosition.pageY;
    }
    else {
        movePos = movePosition.pageX;
    }

    let value = this._model.mapToValue(movePos, this._minOffset, this._maxOffset);
    this._activeHandle.setValue(value);
  }

  disable(){
    this._handleMinObject.off("mousedown");
    
    this._handleMaxObject.off("mousedown");
    
    this._slider.off('click');
  }

  enable(){
    this._handleMinObject.on("mousedown", function (mouseEvent) {
      self._onHandleMouseDown(sliderHandles[0]);
    });

    this._handleMaxObject.on("mousedown", function (mouseEvent) {
      self._onHandleMouseDown(sliderHandles[1]);
    });

    this._slider.on('click', function(movePosition){      
      self._onMouseMove(movePosition);
    });
  }
}  