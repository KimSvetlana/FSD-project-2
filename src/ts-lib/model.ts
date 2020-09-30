import { SignalDispatcher, SimpleEventDispatcher, EventDispatcher } from "strongly-typed-events";

export interface IHasValue {
  getValue() : number;
};

class HasValue implements IHasValue{
  value: number;
  constructor(value : number){
    this.value = value;
  }

  setValue(value: number){
    this.value = value;
  }

  getValue(){
    return this.value;
  }
}

export class SlideEvent {
  values: number[];
  value: number;

  constructor(values: number[], value: number) {
    this.values = values;
    this.value = value;
  }
}

export class RangeValue {
  minValue: number;
  maxValue: number;

  constructor(min: number, max: number){
    this.minValue = min;
    this.maxValue = max;
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
  private _options: object;
  private _minHandle: HandleModel;
  private _maxHandle: HandleModel;
  private _activeHandle: HandleModel;
  private _minValue: HasValue;
  private _maxValue: HasValue;
  private _isDouble: boolean;
  private _slideEvent = new SimpleEventDispatcher<SlideEvent>();
  private _rangeChange = new SimpleEventDispatcher<RangeValue>();
  
  constructor(options: object) {  
    this._options = options;  
    this._minHandle = new HandleModel(options.min);
    this._maxHandle = new HandleModel(options.max);
    this._minValue = new HasValue(options.min);
    this._maxValue = new HasValue(options.max);
    this.step = options.step;
    this._isDouble = options.isDouble;

    if (this._isDouble){
      this._minHandle.setBounds(this._minValue, this._maxHandle);
      this._maxHandle.setBounds(this._minHandle,this._maxValue);
    }
    else{
      this._minHandle.setBounds(this._minValue, this._minValue);
      this._maxHandle.setBounds(this._minValue, this._maxValue);
    }

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

  setMinValue(value: number) {
    this._minValue.setValue(value);
    this._rangeChange.dispatch(new RangeValue(value, this.getMaxValue()));
  }
  getMinValue(){
    return this._minValue.getValue();
  }
  
  setMaxValue(value: number) {
    this._maxValue.setValue(value);
    this._rangeChange.dispatch(new RangeValue(this.getMinValue(), value));
  }

  getMaxValue(){
    return this._maxValue.getValue();
  }

  mapToOffset(value: number, minOffset : number, maxOffset : number) : number {
    let proportion = (value - this.getMinValue()) / (this.getMaxValue() - this.getMinValue());
    return minOffset + proportion * (maxOffset - minOffset);
  }

  mapToValue(offset: number, minOffset: number, maxOffset: number) {
    let proportion = (offset - minOffset) / (maxOffset - minOffset);
    return this.getMinValue() + proportion * (this.getMaxValue() - this.getMinValue());
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

  public get rangeChangeEvent(){
    return this._rangeChange.asEvent();
  }  
}
