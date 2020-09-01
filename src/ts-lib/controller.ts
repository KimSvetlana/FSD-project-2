import {HandleModel, SliderModel} from './model';
import{View} from './view'

export class Controller {
  private _model: SliderModel;
  private _options: any;
  private _activeHandle: HandleModel;
  private _handleMinObject: object;
  private _handleMaxObject: object;

  private _minBounds;
  private _maxBounds;
  private _slider;

  constructor(model: SliderModel, handleMinObject, handleMaxObject, options, minBounds, maxBounds, slider) {
    this._model = model;
    this._options = options;
    this._handleMinObject = handleMinObject;
    this._handleMaxObject = handleMaxObject;

    this._minBounds = minBounds;
    this._maxBounds = maxBounds;
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

  // _onSliderClick(){
  //   let self = this;
  //   this._slider.on('click', function(movePosition){
  //     self._onMouseMove(movePosition);
  //   });
  // }

  _onMouseMove(movePosition) {
    let movePos;
    if (this._options.vertical) {
        movePos = movePosition.pageY;
    }
    else {
        movePos = movePosition.pageX;
    }

    let proportion = (movePos - this._minBounds) / (this._maxBounds - this._minBounds);
    let value = this._options.min + proportion * (this._options.max - this._options.min);
    this._activeHandle.setValue(value);
  } 
}  