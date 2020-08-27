import {IHasValue, SliderModel} from './model';

class OrientedPropertyNames{
    public _widthPropertyName: string;
    public _thicknessPropertyName: string;
    public _leftPropertyName: string;
    public _topPropertyName: string;

    constructor(vertical: boolean) {
        if (vertical) {
            this._widthPropertyName = 'height';
            this._thicknessPropertyName = 'width';
            this._leftPropertyName = 'top';
            this._topPropertyName = 'left'
        }
        else {
            this._widthPropertyName = 'width';
            this._thicknessPropertyName = 'height';
            this._leftPropertyName = 'left';
            this._topPropertyName = 'top';
        }
    }
}

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
        if (this._vertical){
            return this._handleObject.offset().top + this._handleWidth / 2;
        }
        else {
            return this._handleObject.offset().left + this._handleWidth / 2;
        }
    }
}

class IndicatorView {
    private _oriented: OrientedPropertyNames;
    private _indicatorObject: object;
    private _indicatorWidth: number;
    private _indicatorHeight: number;
    private _vertical: boolean;

    constructor(indicatorObject: Object, options: Object){
        this._indicatorObject = indicatorObject;
        this._indicatorWidth = this._indicatorObject.outerWidth();
        this._indicatorHeight = this._indicatorObject.outerHeight();

        this._oriented = new OrientedPropertyNames(options.vertical);
        this._vertical = options.vertical;

        // корректируем положение индикатора относительно центра рукоятки
        this._indicatorObject.css(this._oriented._leftPropertyName, (- this._indicatorWidth / 2));
        if(this._vertical){
            this._indicatorObject.css('left', '-55px');
        }
    }

    // перемещаем индикатор
    show(offset: number, text: number) {
        let modifier = {};
        modifier[this._oriented._leftPropertyName] = offset - this._indicatorWidth / 2;
        this._indicatorObject.offset(modifier); //передаем координаты индикатору
        this._indicatorObject.text(text);
    };
}

class ColorRangeView {
    private _colorRangeObject: object;
    private _vertical: boolean;

    constructor(colorRangeObject: object, options: object){
        this._colorRangeObject = colorRangeObject;
        this._vertical = options.vertical;
        colorRangeObject.css('background-color', options.backgroundColor);
        if (options.vertical){
            colorRangeObject.css('width', options.thickness);
        }
        else {
            colorRangeObject.css('height', options.thickness);
        }
    }

    doColor(fromOffset: number, toOffset: number) {
        if (fromOffset > toOffset){
            [fromOffset, toOffset] = [toOffset, fromOffset];
        }
        let offsetModifier = {};
        let widthPropertyName = '';
        if(this._vertical){
            offsetModifier['top'] = fromOffset;
            widthPropertyName = 'height';
        }
        else {
            offsetModifier['left'] = fromOffset
            widthPropertyName = 'width';
        }
        this._colorRangeObject.offset(offsetModifier);

        let width = toOffset - fromOffset;
        this._colorRangeObject.css(widthPropertyName, width);
    }
}

class ScaleView {
    _scaleObject: object;

    constructor(sliderObject, options){
        this._scaleObject = sliderObject;
        if(options.vertical){
            this._scaleObject.css('left', options.thickness * 1.5 );
        }
        else{
            this._scaleObject.css('top', options.thickness * 1.5 );
        }

        for(let i = 0; i < options.scaleDivision; i++){
            this._scaleObject.append("<span><i class='scale-number'></i></span>");
        }

        let arrSpan = this._scaleObject.children('span');
        if(!options.vertical){
            arrSpan.css({'border-left': '1px solid grey', 'height' : '8px'});
        }
        else{
            arrSpan.css({'border-bottom': '1px solid grey', 'width':'8px'});
        };

        let indicatorLeft = 100 / (arrSpan.length -1);
        let count = '';

        for(let i = 0; i < arrSpan.length; i++){
            count = `${indicatorLeft * i}%`;
            if(options.vertical){
                arrSpan.eq(i).css('top', count);
            }
            else{
                arrSpan.eq(i).css('left', count);
            }
        }

        let arrNumberScale = this._scaleObject.find('.scale-number');
        if(!options.vertical){
            arrNumberScale.css({'top': '10px', 'left' : '-5px'});
        }
        else{
            arrNumberScale.css({'left': '10px', 'top':'-5px'});
        };
        let stepScale = (options.max - options.min) / (options.scaleDivision -1);
        let scaleValue = 0;
        for(let i = 0; i < arrNumberScale.length; i++){
            scaleValue = options.min + stepScale * i;
            if(options.vertical){
                arrNumberScale.eq(i).text(-scaleValue);
            }
            else{
                arrNumberScale.eq(i).text(scaleValue);
            }
        }
    }

    setStep(stepValue: number) {

    }

    setRange(minValue: number, maxValue: number) {

    }
}

export class View {
    private _oriented: OrientedPropertyNames;
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

        this._oriented = new OrientedPropertyNames(options.vertical);

        let content = "<div class='slider-range-content'>" +
                                "<div class='slider-color-range'></div>" +
                                "<span class='slider-range-handle'></span>" +
                                "<span class='slider-range-handle' ></span>"+
                            "</div>"

        $this.append(content);

        // параметры слайдера
        let slider = $this.find(".slider-range-content");

        // if(!options.vertical){
        //     slider.css("width", options.expansion);
        //     slider.css("height", options.thickness);
        // }
        // else{
        //     slider.css("width", options.thickness);
        //     slider.css("height", options.expansion);
        // }

        slider.css(this._oriented._widthPropertyName, options.expansion);
        slider.css(this._oriented._thicknessPropertyName, options.thickness)

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

        // закраска слайдера
        let colorRangeObject = $this.find('.slider-color-range');
        this._colorRange = new ColorRangeView(colorRangeObject, options);

        // индикатор
        let indicatorContent = "<span class='indicator'>0</span>";
        if (options.indicatorVisibility) {
            slider.append(indicatorContent);
        }
        let indicatorObject = $this.find('.indicator');
        this._indicator = new IndicatorView(indicatorObject, options);
        this._indicator.show(this._maxHandle.getOffset(), options.max);

        // шкала значений
        let wrapScale = "<div class='slider-scale-values'></div>"
        if (options.scaleOfValues){
            slider.append(wrapScale);
        }
        let sliderScale = $this.find('.slider-scale-values');
        this._scale = new ScaleView(sliderScale, options);
    }

    private _onSlideEvent(handle: HandleView, value: IHasValue){
        handle.setOffsetFromValue(value.getValue());
        this._colorRange.doColor(this._minHandle.getOffset(), this._maxHandle.getOffset());
        this._indicator.show(handle.getOffset(), value.getValue());
    }
}