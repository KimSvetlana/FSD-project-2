import { SignalDispatcher, SimpleEventDispatcher, EventDispatcher } from "strongly-typed-events";

export interface IHasValue {
  getValue() : number;
};

class StaticValue implements IHasValue {
  value: number;
  constructor(value:number){
    this.value = value;
  }

  getValue() {
    return this.value;
  }
};

export class SlideEvent {
  values: number[];
  value: number;

  constructor(values: number[], value: number) {
    this.values = values;
    this.value = value;
  }
}

export class HandleModel implements IHasValue {
  private _value: number;
  private _step: number;
  private _leftBound: IHasValue;
  private _rightBound: IHasValue;
  private _slideEvent = new SimpleEventDispatcher<IHasValue>();
  
  constructor(initialValue: number) {
    this._value = initialValue;
  }

  public get slideEvent() {
    return this._slideEvent.asEvent();
  }

  public set step(value: number) {
    this._step = value;
  }

  public get step() {
    return this._step;
  }

  setBounds(leftBound: IHasValue, rightBound: IHasValue) {
    this._leftBound = leftBound;
    this._rightBound = rightBound;
  }

  getValue() : number {
    return this._value;
  }

  setValue(newValue: number) : void {
    newValue = Math.round(newValue / this._step) * this._step;

    if (newValue < this._leftBound.getValue()){
      newValue = this._leftBound.getValue();
    }
    
    if (newValue > this._rightBound.getValue()){
      newValue = this._rightBound.getValue();
    }

    this._value = newValue;
    this._slideEvent.dispatch(this);
  }
};

export class SliderModel {
  private _minHandle: HandleModel;
  private _maxHandle: HandleModel;
  private _activeHandle: HandleModel;
  private _minValue: number;
  private _maxValue: number;
  private _isDouble: boolean;
  private _slideEvent = new SimpleEventDispatcher<SlideEvent>();
  
  constructor(options) {
    this._minValue = options.min;
    this._maxValue = options.max;
    
    this._minHandle = new HandleModel(options.min);
    this._maxHandle = new HandleModel(options.max);
    this.setMinBound(options.min);
    this.setMaxBound(options.max);
    this.step = options.step;
    let self = this;
    for (var handle of [this._minHandle, this._maxHandle]){
      handle.slideEvent.subscribe((handle: IHasValue) => {
        self.onHandleSlide(handle);
      });
    };
  }

  public set step(value: number) {
    this._minHandle.step = value;
    this._maxHandle.step = value;
  }

  public get step() {
    return this._maxHandle.step;
  }

  setMinBound(value: number) {
    this._minValue = value;
    this._minHandle.setBounds(new StaticValue(this._minValue), this._maxHandle);
  }

  setMaxBound(value: number) {
    this._minValue = value;
    this._maxHandle.setBounds(this._minHandle, new StaticValue(this._maxValue));
  }

  getSliderValue(){
    return [this._minHandle.getValue(),this._maxHandle.getValue()];
  }
  
  setSliderValue(value1: number, value2?:number){
    if(value2){
      this._maxHandle.setValue(value1);
      this._minHandle.setValue(value2);
    }
    else{
      this._maxHandle.setValue(value1);
    }
  }
  
  getSliderHandles() {
    return [this._minHandle, this._maxHandle];
  }

  public get slideEvent() {
    return this._slideEvent.asEvent();
  }

  onHandleSlide(handle: IHasValue) {
    this._slideEvent.dispatch(new SlideEvent(
      [this._minHandle.getValue(), this._maxHandle.getValue()], 
      handle.getValue()));
  }
  
  
};