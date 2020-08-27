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

export class ISlideEvent {
  minHandle: IHasValue;
  maxHandle: IHasValue;

  constructor(minHandle: IHasValue, maxHandle: IHasValue) {
    this.minHandle = minHandle;
    this.maxHandle =maxHandle;
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

  setStep(step) {
    this._step = step;
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
  private _step: number;
  private _isDouble: boolean;
  private _slideEvent = new SimpleEventDispatcher<ISlideEvent>();

  constructor(options) {
    this._minValue = options.min;
    this._maxValue = options.max;
    this._step = options.step;
    
    this._minHandle = new HandleModel(options.min);
    this._maxHandle = new HandleModel(options.max);
    this._minHandle.setBounds(new StaticValue(this._minValue), this._maxHandle);
    this._maxHandle.setBounds(this._minHandle, new StaticValue(this._maxValue));
    this._minHandle.setStep(this._step);
    this._maxHandle.setStep(this._step);
  }

  getSliderHandles() {
    return [this._minHandle, this._maxHandle];
  }

  public get sliderValue() : number {
    return this._activeHandle.getValue();
  }
  
  public set sliderValue(value: number) {
    this._activeHandle.setValue(value);
    this._slideEvent.dispatch(new ISlideEvent(this._minHandle, this._maxHandle));
  }

  public get slideEvent() {
    return this._slideEvent.asEvent();
  }

  setSliderValues(){
    
  }
 
};