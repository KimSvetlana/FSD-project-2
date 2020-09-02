import {IHasValue, SliderModel} from './model';

interface IOrientedElement {
    width : number;
    height : number;
    left : number;
    top : number;
    offsetLeft : number;
}

class OrientedElementBase {
    protected _element : JQuery;

    constructor(element: JQuery){
        this._element = element;
    }

    protected _setProperty(propertyName: string, value : number) : void {
        this._element.css(propertyName, value);
    }

    protected _getProperty(propertyName: string) : number {
        return Number.parseFloat(this._element.css(propertyName));
    }
}

class HorizontalElement extends OrientedElementBase implements IOrientedElement {

    constructor(element: JQuery) {
        super(element);
    }

    public get width() : number {
        return this._getProperty("width");
    }

    public set width(value: number) : void {
        this._setProperty("width", value);
    }

    public get height() : number {
        return this._getProperty("height");
    }

    public set height(value: number) : void {
        this._setProperty("height", value);
    }

    public get left() : number {
        return this._getProperty("left");
    }

    public set left(value: number) : void {
        this._setProperty("left", value);
    }

    public get offsetLeft() : number {
        return this._element.offset().left;
    }

    public set offsetLeft(value: number) : void {
        this._element.offset({left: value});
    }

    public get top() : number {
        return this._getProperty("top");
    }

    public set top(value: number) : void {
        this._setProperty("top", value);
    }
}

class VerticalElement extends OrientedElementBase implements IOrientedElement {

    constructor(element: JQuery) {
        super(element);
    }

    public get width() : number {
        return this._getProperty("height");
    }

    public set width(value: number) : void {
        this._setProperty("height", value);
    }

    public get height() : number {
        return this._getProperty("width");
    }

    public set height(value: number) : void {
        this._setProperty("width", value);
    }

    public get left() : number {
        return this._getProperty("top");
    }

    public set left(value: number) : void {
        this._setProperty("top", value);
    }

    public get offsetLeft() : number {
        return this._element.offset().top;
    }

    public set offsetLeft(value: number) : void {
        this._element.offset({top: value});
    }

    public get top() : number {
        return this._getProperty("left");
    }

    public set top(value: number) : void {
        this._setProperty("left", value);
    }
}

class HandleView {
    private _handleObject: JQuery;
    private _minOffset: number;
    private _maxOffset: number;
    private _maxValue: number;
    private _minValue: number;
    private _handleWidth: number;
    private _oriented: IOrientedElement;

    constructor(handleObject: JQuery, vertical: boolean, thickness : number){
        this._handleObject = handleObject;
        this._handleWidth = thickness * 2;

        if (vertical){
            this._oriented = new VerticalElement(handleObject);
        }
        else {
            this._oriented = new HorizontalElement(handleObject);
        }

        // параметры и расположение бегунка
        this._handleObject.css({ 'width': this._handleWidth, 'height': this._handleWidth });
        // выравнивание бегунка относительно кулисы
        this._oriented.top = -thickness / 2;
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
        this._oriented.offsetLeft = offset;
    }

    getOffset(): number {
        return this._oriented.offsetLeft + this._handleWidth / 2;
    }
}

class IndicatorView {
    private _oriented: IOrientedElement;;
    private _indicatorObject: JQuery;

    private _options: object;

    constructor(indicatorObject: JQuery, options: Object){
        this._indicatorObject = indicatorObject;
        this._options = options;

        if (options.vertical){
            // VerticalElement
            this._oriented = new VerticalElement(indicatorObject);
        }
        else {
            this._oriented = new HorizontalElement(indicatorObject);
        }
    }

    private getOrientedHeight() {
        if (this._options.vertical) {
            return this._indicatorObject.outerWidth();
        }
        else {
            return this._indicatorObject.outerHeight();
        }
    }

    private getOrientedWidth() {
        if (this._options.vertical) {
            return this._indicatorObject.outerHeight();
        }
        else {
            return this._indicatorObject.outerWidth();
        }
    }

    // перемещаем индикатор
    show(offset: number, text: number) {

        this._indicatorObject.text(text);

        // корректируем положение индикатора относительно центра
        let correction = - this.getOrientedWidth() / 2;

         // отступ от консоли
        let margin = - (this.getOrientedHeight() + this._options.thickness);
        this._oriented.top = margin;
        this._oriented.offsetLeft = (offset + correction); //передаем координаты индикатору
    };
}

class ColorRangeView {
    private _oriented: IOrientedElement
    private _colorRangeObject: JQuery;

    constructor(colorRangeObject: JQuery, options: object){
        this._colorRangeObject = colorRangeObject;

        if (options.vertical){
            this._oriented = new VerticalElement(colorRangeObject);
        }
        else {
            this._oriented = new HorizontalElement(colorRangeObject);
        }

        colorRangeObject.css('background-color', options.backgroundColor);
        this._oriented.height = options.thickness;
    }

    doColor(fromOffset: number, toOffset: number) {
        if (fromOffset > toOffset){
            [fromOffset, toOffset] = [toOffset, fromOffset];
        }
        this._oriented.offsetLeft = fromOffset;

        let width = toOffset - fromOffset;
        this._oriented.width = width;
    }
}

class ScaleView {
    private _oriented: IOrientedElement;
    private _scaleObject: JQuery;

    constructor(sliderObject : JQuery, options: object){
        this._scaleObject = sliderObject;

        if (options.vertical){
            this._oriented = new VerticalElement(sliderObject);
        }
        else {
            this._oriented = new HorizontalElement(sliderObject);
        }

        this._oriented.top = options.thickness * 1.5;
        this._oriented.width = 'inherit';
        this._oriented.height = 0;

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

        for(let i = 0, j = arrNumberScale.length -1; i < arrNumberScale.length, j >= 0; i++, j--){
            scaleValue = options.min + stepScale * i;
            if(options.vertical){
                arrNumberScale.eq(j).text(scaleValue);
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
    private _oriented: IOrientedElement;
    private _minHandle: HandleView;
    private _maxHandle: HandleView;
    private _indicator: IndicatorView;
    private _scale: ScaleView;
    private _colorRange: ColorRangeView;

    private _minBounds: number;
    private _maxBounds: number;
    private _slider: object;
    constructor(model: SliderModel, options:object, $this){

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

    get slider(){
        return this._slider;
    }
    private initialize(options: object, $this) {

        // this._oriented = new OrientedPropertyNames(options.vertical);

        let content = "<div class='slider-range-content'>" +
        "<div class='slider-color-range'></div>" +
        "<span class='slider-range-handle'></span>" +
        "<span class='slider-range-handle' ></span>"+
        "</div>"

        $this.append(content);

        // параметры слайдера
        let slider = $this.find(".slider-range-content");
        this._slider = slider;
        
        if (options.vertical){
            this._oriented = new VerticalElement(slider);
        }
        else {
            this._oriented = new HorizontalElement(slider);
        }

        this._oriented.width = options.expansion;
        this._oriented.height = options.thickness;

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