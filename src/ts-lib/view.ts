import {IHasValue, SliderModel} from './model';


class HandleView {
    private _handleObject: object;
    private _vertical: boolean;
    private _minOffset: number;
    private _maxOffset: number;
    private _maxValue: number;
    private _minValue: number;
    private _handleWidth: number;

    constructor(handleObject: object, vertical: boolean, thickness : number){
        this._handleObject = handleObject;
        this._handleWidth = thickness * 2;
        this._vertical = vertical;

        // параметры и расположение бегунка
        this._handleObject.css({ 'width': this._handleWidth, 'height': this._handleWidth });
        // выравнивание бегунка относительно кулисы
        if (!this._vertical) {
            this._handleObject.css("top", -thickness / 2);
        }
        else {
            this._handleObject.css("left", -thickness / 2);
        }
    } 
    get handleObject(){
        return this._handleObject;
    }

    hide(){
        this._handleObject.css("visibility", 'hidden');
    };

    setBounds(minOffset: number, maxOffset: number) {
        this._minOffset = minOffset;
        this._maxOffset = maxOffset;
    }

    get minBounds(){
        return this._minOffset;
    }
    get maxBounds(){
        return this._maxOffset;
    }

    setRange(minValue, maxValue){
        this._minValue = minValue;
        this._maxValue = maxValue;
    }

    setOffsetFromValue(sliderValue: number) {
        let proportion = (sliderValue - this._minValue) / (this._maxValue - this._minValue);
        let offset = this._minOffset + proportion * (this._maxOffset - this._minOffset);

        // корректировка относительно центра бегунка
        offset -= this._handleWidth / 2;
        let offsetModifier = {};

        if(this._vertical){
            offsetModifier["top"] = offset;
        }
        else{
            offsetModifier["left"] = offset;
        }
        
        this._handleObject.offset(offsetModifier);
    }

    getOffset(): number {
        return 0;
        // .css
    }
}

class IndicatorView {
    _indicatorObject: object;

    setOffset() {

    }

    setValue() {

    }
}

class ColorRangeView {
    _colorRangeObject: object;

    doColor(fromOffset: number, toOffset: number) {

    }
}

class ScaleView {
    _scaleObject: object;

    setStep(stepValue: number) {

    }

    setRange(minValue: number, maxValue: number) {

    }
}

export class View {
    private _minHandle: HandleView;
    private _maxHandle: HandleView;
    private _indicator: IndicatorView;
    private _scale: ScaleView;
    private _colorRange: ColorRangeView;

    private _minBounds: number;
    private _maxBounds: number;
    constructor(model: SliderModel, options, $this){
        this.initialize(options, $this);

        let handleModels = model.getSliderHandles();
        handleModels[0].slideEvent.subscribe((value: IHasValue) => {
            this._onSlideEvent(this._minHandle, value);
        });

        handleModels[1].slideEvent.subscribe((value: IHasValue) => {
            this._onSlideEvent(this._maxHandle, value);
        });
    }

    get minHandle(){
        return this._minHandle;
    }

    get maxHandle(){
        return this._maxHandle;
    }

    get minBounds(){
        return this._minBounds;
    }
    get maxBounds(){
        return this._maxBounds;
    }
    private initialize(options, $this) {

        let content = "<div class='slider-range-content'>" +
                                "<div class='slider-color-range'></div>" +
                                "<span class='slider-range-handle'></span>" +
                                "<span class='slider-range-handle' ></span>"+
                            "</div>"

        $this.append(content);

        // параметры слайдера
        let slider = $this.find(".slider-range-content");
        if(!options.vertical){
            slider.css("height", options.thickness);
            slider.css("width", options.expansion);
        }
        else{
            slider.css("width", options.thickness);
            slider.css("height", options.expansion);
        }

        // зная все размеры, можно уточнить границы слайдера
        let minOffset;
        let maxOffset;
        if (!options.vertical) {
            minOffset = slider.offset().left;
            maxOffset = minOffset + slider.width();
        }
        else {
            maxOffset = slider.offset().top;
            minOffset = maxOffset + slider.height();
        }

        this._minBounds = minOffset;
        this._maxBounds = maxOffset;

        let handles = $this.find('.slider-range-handle');

        this._minHandle = new HandleView(handles.first(), options.vertical, options.thickness);
        this._minHandle.setBounds(minOffset, maxOffset);

        this._maxHandle = new HandleView(handles.last(), options.vertical, options.thickness);
        this._maxHandle.setBounds(minOffset, maxOffset);

        this._minHandle.setRange(options.min, options.max);
        this._maxHandle.setRange(options.min, options.max);

        // Начальное положение бегунков
        this._minHandle.setOffsetFromValue(options.min);
        this._maxHandle.setOffsetFromValue(options.max);

        // если бегунок один, то скрываем один из бегунков(minHandle)
        if (!options.isDouble) {
            this._maxHandle.setOffsetFromValue(options.min);
            this._minHandle.hide();
        }        
    }

    private _onSlideEvent(view: HandleView, value: IHasValue){
        view.setOffsetFromValue(value.getValue());
        //this._colorRange.doColor(this._minHandle.getOffset(), this._maxHandle.getOffset());
        // convert value to offset
        // .css
        // indicator
        // color range
    }
}