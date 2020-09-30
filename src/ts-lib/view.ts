import {IHasValue, SliderModel, SlideEvent, HandleModel, RangeValue} from './model';


interface IOrientedElement {
    element : JQuery;
    width : number | string;
    height : number | string;
    left : number;
    top : number;
    offsetLeft : number;
    offsetRight : number;
    offsetCenter : number;
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

    public get element() : Jquery {
        return this._element;
    }
}

class HorizontalElement extends OrientedElementBase implements IOrientedElement {

    constructor(element: JQuery) {
        super(element);
    }

    public get width() : number {
        return this.element.outerWidth();
    }

    public set width(value: number) : void {
        this.element.outerWidth(value);
    }

    public get height() : number {
        return this.element.outerHeight();
    }

    public set height(value: number) : void {
        this.element.outerHeight(value);
    }

    public get left() : number {
        return this._getProperty('left');
    }

    public set left(value: number) : void {
        this._setProperty('left', value);
    }

    public get offsetLeft() : number {
        return this._element.offset().left;
    }

    public set offsetLeft(value: number) : void {
        this._element.offset({left: value});
    }

    public get offsetRight() : number {
        return this.element.offset().left + this.element.outerWidth();
    }

    public set offsetRight(value: number) : void {
        this.element.offset({ left: value - this.element.outerWidth()});
    }

    public get offsetCenter() : number {
        return this.element.offset().left + this.element.outerWidth() / 2;
    }

    public set offsetCenter(value: number) : void {
        this.element.offset({ left : value - this.element.outerWidth() / 2 });
    }

    public get top() : number {
        return this._getProperty('top');
    }

    public set top(value: number) : void {
        this._setProperty('top', value);
    }
}

class VerticalElement extends OrientedElementBase implements IOrientedElement {

    constructor(element: JQuery) {
        super(element);
    }

    public get width() : number {
        return this.element.outerHeight();
    }

    public set width(value: number) : void {
        this.element.outerHeight(value);
    }

    public get height() : number {
        return this.element.outerWidth();
    }

    public set height(value: number) : void {
        this.element.outerWidth(value);
    }

    public get left() : number {
        return this._getProperty('top');
    }

    public set left(value: number) : void {
        this._setProperty('top', value);
    }

    public get offsetLeft() : number {
        return this._element.offset().top + this.element.outerHeight();
    }

    public set offsetLeft(value: number) : void {
        this._element.offset({top: value - this.element.outerHeight()});
    }

    public get offsetRight() : number {
        return this.element.offset().top;
    }

    public set offsetRight(value: number) : void {
        this.element.offset({top : value});
    }

    public get offsetCenter() : number {
        return this.element.offset().top + this.element.outerHeight() / 2;
    }

    public set offsetCenter(value: number) : void {
        this.element.offset({top: value - this.element.outerHeight() / 2});
    }

    public get top() : number {
        return this._getProperty('left');
    }

    public set top(value: number) : void {
        this._setProperty('left', value);
    }
}

class OrientedView {
    protected _oriented: IOrientedElement;

    constructor(element: JQuery, vertical: boolean){
        if (vertical){
            this._oriented = new VerticalElement(element);
        }
        else {
            this._oriented = new HorizontalElement(element);
        }
    }

    public get element() : Jquery {
        return this._oriented.element;
    }

    public setVisible(visible: boolean) : void {
        let value = visible ? 'visible' : 'hidden';
        this.element.css('visibility', value);
    }
}

class HandleView extends OrientedView {
    private _handleObject: JQuery;
    private _minOffset: number;
    private _maxOffset: number;
    private _handleWidth: number;
    private _model: SliderModel;

    constructor(handleObject: JQuery, vertical: boolean, thickness : number, model: SliderModel){
        super(handleObject, vertical);
        this._handleObject = handleObject;
        this._handleWidth = thickness * 2;
        this._model = model;       

        // параметры и расположение бегунка
        this._handleObject.css({ 'width': this._handleWidth, 'height': this._handleWidth });
        // выравнивание бегунка относительно кулисы
        this._oriented.top = -thickness / 2;
    }

    get handleObject(){
        return this._handleObject;
    }

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

    setOffsetFromValue(sliderValue: number) {
        let offset = this._model.mapToOffset(sliderValue, this._minOffset, this._maxOffset);

        // корректировка относительно центра бегунка
        this._oriented.offsetCenter = offset;
    }

    getOffset(): number {
        return this._oriented.offsetCenter;
    }
}

class IndicatorView extends OrientedView {
    private _indicatorObject: JQuery;
    private _options: Object;

    constructor(indicatorObject: JQuery, options: Object){
        super(indicatorObject, options.vertical);
        this._indicatorObject = indicatorObject;
        this._options = options;        
    }

    // перемещаем индикатор
    indicatorMove(offset: number, text: number) {

        this._indicatorObject.text(text);

        // отступ от консоли
        let margin = - (this._oriented.height + this._options.thickness);
        this._oriented.top = margin;
        
        // корректируем положение индикатора относительно центра
        this._oriented.offsetCenter = offset; //передаем координаты индикатору
    };
}

class ColorRangeView extends OrientedView {
    private _colorRangeObject: JQuery;

    constructor(colorRangeObject: JQuery, options: object){
        super(colorRangeObject, options.vertical);
        this._colorRangeObject = colorRangeObject;

        this._colorRangeObject.css('background-color', options.backgroundColor);
        this._oriented.height = options.thickness;
    }

    doColor(fromOffset: number, toOffset: number) {
        let width = Math.abs(toOffset - fromOffset);
        this._oriented.width = width;
        this._oriented.offsetLeft = fromOffset;
    }
}

class ScaleView extends OrientedView {
    private _scaleObject: JQuery;
    private _isVertical: boolean;
    private _scaleDivision: number;

    constructor(sliderObject : JQuery, options: object){
        super(sliderObject, options.vertical);
        this._scaleObject = sliderObject;
        this._isVertical = options.vertical;
        this._scaleDivision =  options.scaleDivision;

        this._oriented.top = options.thickness * 1.5;
        this._oriented.width = 'inherit';
        this._oriented.height = 0;


        for(let i = 0; i < this._scaleDivision + 1; i++){
            this._scaleObject.append("<span><i class='scale-number'></i></span>");
        }

        let arrSpan = this._scaleObject.children('span');

        if(!this._isVertical){
            arrSpan.css({'border-left': '1px solid grey', 'height' : '8px'});
        }
        else{
            arrSpan.css({'border-bottom': '1px solid grey', 'width':'8px'});
        };

        let indicatorLeft = 100 / (arrSpan.length -1);
        let count = '';

        for(let i = 0; i < arrSpan.length; i++){
            count = `${indicatorLeft * i}%`;
            if(this._isVertical){
                arrSpan.eq(i).css('top', count);
            }
            else{
                arrSpan.eq(i).css('left', count);
            }
        }
        
    }

    setRange(minValue: number, maxValue: number) {
        let arrNumberScale = this._scaleObject.find('.scale-number');

        if(!this._isVertical){
            arrNumberScale.css({'top': '10px', 'left' : '-5px'});
        }
        else{
            arrNumberScale.css({'left': '10px', 'top':'-5px'});
        };
        let stepScale = (maxValue - minValue) / (this._scaleDivision);
        let scaleValue = 0;

        for(let i = 0, j = arrNumberScale.length -1; i < arrNumberScale.length, j >= 0; i++, j--){
            scaleValue = minValue + stepScale * i;
            if(this._isVertical){
                arrNumberScale.eq(j).text(scaleValue);
            }
            else{
                arrNumberScale.eq(i).text(scaleValue);
            }
        }
    }

}

class SliderBarView extends OrientedView {
    constructor(sliderBar: JQuery, options: Object) {
        super(sliderBar, options.vertical);
        this._oriented.width = options.expansion;
        this._oriented.height = options.thickness;
    }

    getMinOffset() : number {
        return this._oriented.offsetLeft;
    }

    getMaxOffset() : number {
        return this._oriented.offsetRight;
    }
}

export class View {
    private _sliderBar: SliderBarView;
    private _minHandle: HandleView;
    private _maxHandle: HandleView;
    private _indicator: IndicatorView;
    private _scale: ScaleView;
    private _colorRange: ColorRangeView;
    private _model: SliderModel;

    private _minValue :number;
    private _maxValue : number;

    constructor(model: SliderModel, options:object, $this){
        this._model = model;
        this.initialize(this._model, options, $this);

        let handleModels = model.getSliderHandles();
        handleModels[0].slideEvent.subscribe((value: IHasValue) => {
            this._onSlideEvent(this._minHandle, value);
        });

        handleModels[1].slideEvent.subscribe((value: IHasValue) => {
            this._onSlideEvent(this._maxHandle, value);
        });

        this._minValue = model.getMinValue();
        this._maxValue = model.getMaxValue();

        model.rangeChangeEvent.subscribe((rangeValue: RangeValue) =>{
            this.onRangeChange(rangeValue.minValue, rangeValue.maxValue);
        })
    }
    
    public get sliderBar() : SliderBarView {
        return this._sliderBar;
    }

    public get minHandle() : HandleView {
        return this._minHandle;
    }

    public get maxHandle() : HandleView {
        return this._maxHandle;
    }

    public get indicator() : IndicatorView {
        return this._indicator;
    }

    public get scale() : ScaleView {
        return this._scale;
    }
    public get colorRange() : ColorRangeView {
        return this._colorRange;
    }

    private initialize(model:SliderModel ,options: object, $this) {
        let content = "<div class='slider-range-content'>" +
                        "<div class='slider-color-range'></div>" +
                        "<span class='slider-range-handle'></span>" +
                        "<span class='slider-range-handle' ></span>"+
                    "</div>"

        $this.append(content);

        // параметры слайдера
        let slider = $this.find(".slider-range-content");
        this._sliderBar = new SliderBarView(slider, options);

        // зная все размеры, можно уточнить границы слайдера
        let minOffset = this._sliderBar.getMinOffset();
        let maxOffset = this._sliderBar.getMaxOffset();

        let handles = $this.find('.slider-range-handle');

        this._minHandle = new HandleView(handles.first(), options.vertical, options.thickness, this._model);
        this._minHandle.setBounds(minOffset, maxOffset);

        this._maxHandle = new HandleView(handles.last(), options.vertical, options.thickness, this._model);
        this._maxHandle.setBounds(minOffset, maxOffset);

        // Начальное положение бегунков
        this._minHandle.setOffsetFromValue(options.min);
        this._maxHandle.setOffsetFromValue(options.max);

        // если бегунок один, то скрываем один из бегунков(minHandle)
        if (!options.isDouble) {
            this._maxHandle.setOffsetFromValue(options.min);
            this._minHandle.setVisible(false);
        }

        // закраска слайдера
        let colorRangeObject = $this.find('.slider-color-range');
        this._colorRange = new ColorRangeView(colorRangeObject, options);

        // индикатор
        let indicatorContent = "<span class='indicator'>0</span>";
        slider.append(indicatorContent);
        let indicatorObject = $this.find('.indicator');
        this._indicator = new IndicatorView(indicatorObject, options);
        this._indicator.indicatorMove(this._maxHandle.getOffset(), options.max);
        this._indicator.setVisible(options.indicatorVisibility);

        // шкала значений
        let wrapScale = "<div class='slider-scale-values'></div>"
        slider.append(wrapScale);
        let sliderScale = $this.find('.slider-scale-values');
        this._scale = new ScaleView(sliderScale, options);

        let minValue = model.getMinValue();
        let maxValue = model.getMaxValue();

        this._scale.setRange(minValue, maxValue);
        
        this._scale.setVisible(options.scaleVisibility);
    }

    private _onSlideEvent(handle: HandleView, value: IHasValue){
        handle.setOffsetFromValue(value.getValue());
        this._colorRange.doColor(this._minHandle.getOffset(), this._maxHandle.getOffset());
        this._indicator.indicatorMove(handle.getOffset(), value.getValue());
    }

    destroy(){
        this._sliderBar.setVisible(false);
        this._indicator.setVisible(false);
        this._scale.setVisible(false);
    }

    onRangeChange(min: number, max: number){
        this._scale.setRange(min, max)
    }    
}