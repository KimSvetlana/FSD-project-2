import { SignalDispatcher, SimpleEventDispatcher, EventDispatcher } from "strongly-typed-events";

interface IHasValue {
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

class HandleState implements IHasValue {
  private _value: number;
  private _leftBound: IHasValue;
  _rightBound: IHasValue;
  

  constructor(leftBound: IHasValue, rightBound: IHasValue) {
    this._leftBound = leftBound;
    this._rightBound = rightBound;
  }

  getValue() : number {
    return this._value;
  }

  setValue(newValue: number) : void {
    if (newValue < this._leftBound.getValue()){
      newValue = this._leftBound.getValue();
    }
    
    if (newValue > this._rightBound.getValue()){
      newValue = this._rightBound.getValue();
    }

    this._value = newValue;
  }
};

export class SliderModel {
  private _minHandle: HandleState;
  private _maxHandle: HandleState;
  private _activeHandle: HandleState;
  private _minValue: number;
  private _maxValue: number;
  private _step: number;
  private _isDouble: boolean;
  private _slideEvent = new SimpleEventDispatcher<ISlideEvent>();

  constructor() {
    this._minHandle = new HandleState(new StaticValue(this._minValue), this._maxHandle);
    this._maxHandle = new HandleState(this._minHandle, new StaticValue(this._maxValue));
  }

  getSliderValues() {
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


  // setSliderValues(){

  // }
 
};